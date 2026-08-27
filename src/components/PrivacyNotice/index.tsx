import { useEffect, useState } from "react";
import X from "../../assets/icons/X.svg?react";
import { PrivacyText, privacyTitle } from "./PrivacyText";

type PrivacyDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function PrivacyDialog(props: PrivacyDialogProps) {
  const { open, onClose } = props;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="wk-scrim fixed inset-0 z-30 bg-black/25"
      />

      <div className="wk-scrim bg-surface fixed inset-x-5 top-1/2 z-40 max-h-[80dvh] -translate-y-1/2 overflow-y-auto rounded-sm p-5 shadow-[0_8px_24px_rgba(70,52,34,0.14)] sm:inset-x-0 sm:mx-auto sm:max-w-110">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold tracking-[-0.01em]">
            {privacyTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-cream-800 hover:bg-cream-100 hover:text-ink -mt-1 -mr-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full"
          >
            <X width={16} height={16} />
          </button>
        </div>

        <PrivacyText />
      </div>
    </>
  );
}

type PrivacyNoticeProps = {
  label?: string;
};

export function PrivacyNotice(props: PrivacyNoticeProps) {
  const { label = "隱私權聲明" } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:text-ink cursor-pointer underline"
      >
        {label}
      </button>
      <PrivacyDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
