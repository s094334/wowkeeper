import { useState } from "react";
import { Link } from "react-router";
import LogOut from "../../assets/icons/LogOut.svg?react";
import Shield from "../../assets/icons/Shield.svg?react";
import { PrivacyDialog } from "../PrivacyNotice/PrivacyDialog";
import User from "../../assets/icons/User.svg?react";
import type { StoredUser } from "../../lib/authStorage";

type HeaderProps = {
  user: StoredUser;
  onLogout?: () => void;
};

const MENU_ITEM =
  "hover:bg-cream-100 flex w-full cursor-pointer items-center gap-3 rounded-xs px-3 py-3.5 text-left text-body";

export function Header(props: HeaderProps) {
  const { user, onLogout } = props;
  const [open, setOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    if (window.confirm("確定要登出嗎？")) onLogout?.();
  };

  return (
    <>
      <header className="border-cream-400 mt-1 flex h-15 items-center gap-4 border-b px-8 sm:gap-8">
        <Link
          to="/"
          className="text-terracotta mt-px text-base font-semibold tracking-[-0.01em] whitespace-nowrap"
        >
          哇管家 WowKeeper
        </Link>

        <span className="flex-1" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`flex size-10 cursor-pointer items-center justify-center rounded-full border ${
              open
                ? "bg-cream-300 border-cream-600"
                : "bg-cream-100 border-cream-400 hover:border-cream-600"
            }`}
          >
            <User width={19} height={19} className="text-ink-muted" />
          </button>

          {open && (
            <>
              <div
                onClick={() => setOpen(false)}
                className="wk-fade-in fixed inset-0 z-30 bg-black/25"
              />

              <div className="wk-sheet bg-surface fixed inset-x-0 bottom-0 z-40 rounded-t-lg pb-[env(safe-area-inset-bottom)] sm:mx-auto sm:max-w-110 md:absolute md:inset-x-auto md:top-full md:right-0 md:bottom-auto md:mx-0 md:mt-2 md:w-70 md:rounded-sm md:border md:border-cream-400 md:pb-0 md:shadow-[0_8px_24px_rgba(70,52,34,0.14)]">
                <span className="bg-cream-400 mx-auto mt-2.5 mb-1 block h-1 w-9 rounded-full md:hidden" />

                <div className="border-cream-300 flex flex-col gap-0.5 border-b px-5 pt-3 pb-4 md:pt-4">
                  <span className="truncate text-base font-medium">
                    {user.name}
                  </span>
                  <span className="text-cream-800 truncate text-sm">
                    {user.email}
                  </span>
                </div>

                <div className="flex flex-col p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setPrivacyOpen(true);
                    }}
                    className={MENU_ITEM}
                  >
                    <Shield width={18} height={18} className="text-cream-800" />
                    隱私權聲明
                  </button>
                </div>

                <div className="border-cream-300 border-t p-2 pb-3 md:pb-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${MENU_ITEM} text-lamp-red-fg hover:bg-lamp-red-bg ml-0.5`}
                  >
                    <LogOut width={18} height={18} />
                    登出
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
}
