import LogOut from "../assets/icons/LogOut.svg?react";

type NavItem = { label: string; active?: boolean };

const NAV_ITEMS: NavItem[] = [{ label: "家電總覽", active: true }];

type HeaderProps = {
  onLogout?: () => void;
};

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="border-cream-400 flex h-15 items-center gap-4 border-b px-5 sm:gap-8 sm:px-8">
      <span className="text-terracotta text-base font-semibold tracking-[-0.01em] whitespace-nowrap">
        哇管家 WowKeeper
      </span>
      <nav className="hidden gap-1 sm:flex">
        {NAV_ITEMS.map(({ label, active }) => (
          <a
            key={label}
            href="#"
            className={
              "rounded-xs px-3 py-[7px] text-sm whitespace-nowrap " +
              (active
                ? "bg-cream-100 text-ink font-medium"
                : "text-ink-muted hover:bg-cream-100")
            }
          >
            {label}
          </a>
        ))}
      </nav>

      <span className="flex-1" />

      <div className="flex items-center gap-2.5">
        <div className="bg-cream-300 size-[30px] shrink-0 rounded-full" />
        <button
          type="button"
          onClick={onLogout}
          className="border-cream-400 text-lamp-red-fg hover:bg-lamp-red-bg hover:border-lamp-red-fg rounded-xs flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap"
        >
          <LogOut width={15} height={15} />
          <span className="hidden sm:inline">登出</span>
        </button>
      </div>
    </header>
  );
}
