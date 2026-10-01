import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import ArrowRight from "../../assets/icons/ArrowRight.svg?react";
import Camera from "../../assets/icons/Camera.svg?react";
import { GHOST_BUTTON, PRIMARY_BUTTON } from "./classes";

type StepActionsProps = {
  step: number;
  setStep: (step: number) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  onNext: () => void;
};

export function StepActions(props: StepActionsProps) {
  const { step, setStep, isSubmitting, onCancel, onNext } = props;

  return (
    <div className="border-cream-400 flex gap-2.5 border-t px-5 py-3.5 sm:px-8">
      {step === 1 && (
        <>
          <button type="button" onClick={onCancel} className={GHOST_BUTTON}>
            取消
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={GHOST_BUTTON}
          >
            略過，手動輸入
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <button
            type="button"
            onClick={() => setStep(1)}
            className={GHOST_BUTTON}
          >
            <Camera width={15} height={15} />
            重新拍照
          </button>
          <button type="button" onClick={onNext} className={PRIMARY_BUTTON}>
            新增耗材
            <ArrowRight width={15} height={15} />
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={GHOST_BUTTON}
          >
            <ArrowLeft width={15} height={15} />
            上一步
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${PRIMARY_BUTTON} disabled:opacity-60`}
          >
            完成建檔
          </button>
        </>
      )}
    </div>
  );
}
