import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="border-cream-400 text-ink-muted hidden items-center justify-center gap-3 border-t px-8 py-5 text-xs sm:flex">
      <Link to="/help" className="hover:text-ink underline">
        使用說明
      </Link>
      <span className="text-cream-600">|</span>
      <Link to="/privacy" className="hover:text-ink underline">
        隱私權聲明
      </Link>
      <span className="text-cream-600">|</span>
      <span>Copyright © 2026 xin-ping</span>
    </footer>
  );
}
