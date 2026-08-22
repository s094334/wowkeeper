const CLOUDFLARE_PRIVACY = "https://www.cloudflare.com/privacypolicy/";

export const privacyTitle = "隱私權聲明";

export function PrivacyText() {
  return (
    <>
      <p className="text-ink-muted text-sm leading-relaxed text-pretty">
        本網站為學習用途而做的專題，不是正式服務。辨識可能會有誤，請自行確認家電上的銘牌;由於本網站可能進行變動，對於資料存取不負任何責任，謝謝。
      </p>
      <p className="text-ink-muted text-sm leading-relaxed text-pretty">
        拍攝的照片只用於辨識銘牌文字。照片在你的裝置上會先縮小並移除拍攝地點等資訊，傳送過程加密，我們不會將照片存入任何資料庫或檔案儲存空間，辨識完成即刪除。辨識由
        Cloudflare Workers AI 執行，其資料處理方式請參閱{" "}
        <a
          href={CLOUDFLARE_PRIVACY}
          target="_blank"
          rel="noreferrer"
          className="text-terracotta hover:text-terracotta-hover underline"
        >
          Cloudflare 的隱私政策
        </a>
        。
      </p>
    </>
  );
}
