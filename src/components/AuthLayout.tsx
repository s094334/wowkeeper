import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="flex flex-1 flex-col gap-8 px-6 pt-14 pb-10 sm:mx-auto sm:w-full sm:max-w-120 sm:justify-center sm:py-12">
      <div className="flex flex-col gap-3">
        <p className="text-terracotta text-sm font-semibold tracking-[0.02em]">
          哇管家 WowKeeper
        </p>
        <h1 className="text-title font-semibold">{title}</h1>
        <p className="text-ink-muted text-body">{subtitle}</p>
      </div>
      {children}
    </main>
  );
}
