import { useState } from "react";
import { PrivacyDialog } from "./PrivacyDialog";

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
