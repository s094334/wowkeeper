import { recognise } from "./recognise.js";
import { signUp, signIn, signOut } from "./users.js";
import {
  listAppliances,
  getAppliance,
  createAppliance,
  updateAppliance,
  deleteAppliance,
} from "./appliances.js";
import {
  createPart,
  updatePart,
  deletePart,
  renewPart,
} from "./parts.js";
import { MAIL_FROM, renderDigest } from "./email.js";
import { findOverdueByUser, markNotified } from "./notifications.js";
import { authenticate } from "./lib/auth.js";
import { taipeiToday } from "./lib/date.js";
import { fail } from "./lib/response.js";

const appliancesCollection = new URLPattern({ pathname: "/api/appliances/" });
const applianceItem = new URLPattern({ pathname: "/api/appliances/:id" });
const partsCollection = new URLPattern({
  pathname: "/api/appliances/:applianceId/parts/",
});
const partItem = new URLPattern({
  pathname: "/api/appliances/:applianceId/parts/:partId",
});
const partRenew = new URLPattern({
  pathname: "/api/appliances/:applianceId/parts/:partId/renew",
});

async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (pathname === "/api/recognise") {
    return recognise(request, env);
  }

  if (pathname === "/api/users/sign_up" && method === "POST") {
    return signUp(request, env);
  }
  if (pathname === "/api/users/sign_in" && method === "POST") {
    return signIn(request, env);
  }
  if (pathname === "/api/users/sign_out" && method === "POST") {
    return signOut(request, env);
  }

  // 一鍵完成保養：路徑比 /parts/:partId 多一段，要先比對，避免被 partItem 的規則吃掉。
  const renewMatch = partRenew.exec(url);
  if (renewMatch && method === "PATCH") {
    const auth = await authenticate(request, env);
    if (!auth) return fail("狀態更新失敗", 401);
    const { applianceId, partId } = renewMatch.pathname.groups as {
      applianceId: string;
      partId: string;
    };
    return renewPart(env, auth.uid, applianceId, partId);
  }

  const partMatch = partItem.exec(url);
  if (partMatch) {
    const { applianceId, partId } = partMatch.pathname.groups as {
      applianceId: string;
      partId: string;
    };
    if (method === "PUT") {
      const auth = await authenticate(request, env);
      if (!auth) return fail("更新失敗", 401);
      return updatePart(request, env, auth.uid, applianceId, partId);
    }
    if (method === "DELETE") {
      const auth = await authenticate(request, env);
      if (!auth) return fail("刪除失敗", 401);
      return deletePart(env, auth.uid, applianceId, partId);
    }
  }

  const partsMatch = partsCollection.exec(url);
  if (partsMatch) {
    const applianceId = partsMatch.pathname.groups.applianceId as string;
    if (method === "POST") {
      const auth = await authenticate(request, env);
      if (!auth) return fail("新增失敗", 401);
      return createPart(request, env, auth.uid, applianceId);
    }
  }

  const applianceMatch = applianceItem.exec(url);
  if (applianceMatch) {
    const id = applianceMatch.pathname.groups.id as string;
    if (method === "GET") {
      const auth = await authenticate(request, env);
      if (!auth) return fail("取得失敗", 401);
      return getAppliance(env, auth.uid, id);
    }
    if (method === "PUT") {
      const auth = await authenticate(request, env);
      if (!auth) return fail("更新失敗", 401);
      return updateAppliance(request, env, auth.uid, id);
    }
    if (method === "DELETE") {
      const auth = await authenticate(request, env);
      if (!auth) return fail("刪除失敗", 401);
      return deleteAppliance(env, auth.uid, id);
    }
  }

  if (appliancesCollection.test(url)) {
    if (method === "GET") {
      const auth = await authenticate(request, env);
      if (!auth) return fail("取得失敗", 401);
      return listAppliances(env, auth.uid);
    }
    if (method === "POST") {
      const auth = await authenticate(request, env);
      if (!auth) return fail("新增失敗", 401);
      return createAppliance(request, env, auth.uid);
    }
  }

  return new Response(null, { status: 404 });
}

/**
 * 每天 01:00 UTC（台北早上 9 點）由 cron 觸發，見 wrangler.jsonc 的 triggers。
 *
 * 寄送成功才呼叫 markNotified()。順序顛倒的話，一旦寄送失敗那次提醒就永久遺失
 * ——耗材還在逾期，系統卻以為已經通知過。失敗時跳過標記，下次排程會重試。
 *
 * 單一使用者寄送失敗不影響其他人，所以錯誤在迴圈內接住而不是往外拋。
 */
/**
 * 只有名單上的地址收得到信，用來在開發與 demo 期間避免誤寄給真實使用者。
 * NOTIFY_ALLOWLIST 留空代表不限制，正式開放時就是這個設定。
 */
function allowedRecipients(env: Env): Set<string> | null {
  const raw = env.NOTIFY_ALLOWLIST?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function runDailyNotifications(env: Env): Promise<void> {
  const today = taipeiToday();
  const allowlist = allowedRecipients(env);
  const all = await findOverdueByUser(env, today);

  const digests = allowlist
    ? all.filter((digest) => allowlist.has(digest.email.toLowerCase()))
    : all;

  const skipped = all.length - digests.length;
  if (skipped > 0) {
    console.log(`[notify] 白名單過濾掉 ${skipped} 位收件人`);
  }

  if (digests.length === 0) {
    console.log(`[notify] ${today} 沒有需要通知的項目`);
    return;
  }

  let sent = 0;

  for (const digest of digests) {
    const { subject, text, html } = renderDigest(digest);

    try {
      await env.EMAIL.send({
        to: digest.email,
        from: MAIL_FROM,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error(`[notify] 寄給 ${digest.email} 失敗`, error);
      continue;
    }

    await markNotified(
      env,
      digest.parts.map((part) => part.partId),
      today,
    );
    sent++;
    console.log(`[notify] 已寄給 ${digest.email}（${digest.parts.length} 項）`);
  }

  console.log(`[notify] ${today} 寄出 ${sent}/${digests.length} 封`);
}

export default {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error("未預期的錯誤", error);
      return fail("伺服器發生錯誤", 500);
    }
  },

  async scheduled(_controller, env, ctx) {
    // waitUntil 讓 worker 等這個 promise 結束才回收，否則排程可能在寄完之前就被中斷。
    ctx.waitUntil(
      runDailyNotifications(env).catch((error: unknown) => {
        console.error("[notify] 排程執行失敗", error);
      }),
    );
  },
} satisfies ExportedHandler<Env>;
