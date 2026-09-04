import { PrivacyNotice } from "./PrivacyNotice";

export function Footer() {
  return (
    <footer className="border-cream-400 text-ink-muted hidden items-center justify-center gap-3 border-t px-8 py-5 text-xs sm:flex">
      <PrivacyNotice label="隱私權聲明" />
      <span className="text-cream-600">|</span>
      <span>Copyright © 2026 XinPing rights reserved.</span>
    </footer>
  );
}
