import { useState } from "react";
import Plus from "../../assets/icons/Plus.svg?react";
import X from "../../assets/icons/X.svg?react";
import { PartFields } from "../../components/PartFields";
import type { PartFormValues } from "../../components/PartFields/fields";
import { usePartForm } from "../../components/PartFields/usePartForm";
import { GHOST_BUTTON, PRIMARY_BUTTON } from "./classes";

type PartsStepProps = {
  applianceName: string;
  parts: PartFormValues[];
  onAdd: (part: PartFormValues) => void;
  onRemove: (index: number) => void;
};

export function PartsStep(props: PartsStepProps) {
  const { applianceName, parts, onAdd, onRemove } = props;
  const [addingPart, setAddingPart] = useState(false);

  const partForm = usePartForm();

  const addPart = partForm.handleSubmit((values) => {
    onAdd(values);
    partForm.reset({ action: "replace" });
    setAddingPart(false);
  });

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-4 pb-2 sm:px-8">
      <p className="text-ink-muted text-xs">{applianceName || "這台家電"}</p>

      {parts.map((part, index) => (
        <div
          key={`${part.name}-${index}`}
          className="border-cream-400 bg-surface flex items-center gap-3 rounded-sm border px-4 py-3"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-body truncate font-medium">{part.name}</span>
            <span className="text-ink-muted text-xs">
              每 {part.cycleMonths} 個月
              {part.action === "clean" ? "清洗" : "更換"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-cream-800 hover:text-danger -mr-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full"
          >
            <X width={16} height={16} />
          </button>
        </div>
      ))}

      {addingPart ? (
        <div className="flex flex-col gap-3">
          <PartFields
            register={partForm.register}
            errors={partForm.formState.errors}
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setAddingPart(false)}
              className={GHOST_BUTTON}
            >
              取消
            </button>
            <button type="button" onClick={addPart} className={PRIMARY_BUTTON}>
              加入
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingPart(true)}
          className="border-cream-500 text-ink-muted hover:bg-cream-100 hover:border-cream-800 hover:text-ink flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed p-3 text-sm font-medium"
        >
          <Plus width={16} height={16} />
          新增耗材週期
        </button>
      )}

      <p className="text-cream-800 text-xs leading-relaxed text-pretty">
        沒有耗材也可以直接完成建檔，之後在家電詳情再補上。
      </p>
    </div>
  );
}
