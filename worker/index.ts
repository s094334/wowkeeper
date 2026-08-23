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
  listParts,
  createPart,
  updatePart,
  deletePart,
  renewPart,
} from "./parts.js";
import { authenticate } from "./lib/auth.js";
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
    if (method === "GET") {
      const auth = await authenticate(request, env);
      if (!auth) return fail("取得失敗", 401);
      return listParts(env, auth.uid, applianceId);
    }
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

export default {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error("未預期的錯誤", error);
      return fail("伺服器發生錯誤", 500);
    }
  },
} satisfies ExportedHandler<Env>;
