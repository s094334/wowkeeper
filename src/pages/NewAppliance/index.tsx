import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { recogniseNameplate } from "../../api/recognise";
import AlertCircle from "../../assets/icons/AlertCircle.svg?react";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import Camera from "../../assets/icons/Camera.svg?react";
import Plus from "../../assets/icons/Plus.svg?react";
import X from "../../assets/icons/X.svg?react";
import { ApplianceFields } from "../../components/ApplianceFields";
import type { ApplianceFormValues } from "../../components/ApplianceFields/fields";
import { FormError } from "../../components/common/FormError";
import { PhotoCapture } from "../../components/common/PhotoCapture";
import { PartFields } from "../../components/PartFields";
import type { PartFormValues } from "../../components/PartFields/fields";
import { StepIndicator } from "../../components/StepIndicator";

const STEPS = ["拍照", "家電資料", "耗材設定"];

const GHOST_BUTTON =
  "border-cream-400 bg-surface hover:bg-cream-100 flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xs border text-sm font-medium";
const PRIMARY_BUTTON =
  "bg-terracotta hover:bg-terracotta-hover flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xs text-sm font-medium text-white whitespace-nowrap";

export function NewAppliance() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errorLog, setErrorLog] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [scanError, setScanError] = useState("");
  const [parts, setParts] = useState<PartFormValues[]>([]);
  const [addingPart, setAddingPart] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ApplianceFormValues>({
    mode: "onBlur",
    defaultValues: { category: "" },
  });

  // 耗材用另一份表單，加完就重置，不影響家電那份
  const partForm = useForm<PartFormValues>({
    mode: "onBlur",
    defaultValues: { action: "replace" },
  });

  const handleScan = async (file: File) => {
    setIsScanning(true);
    setScanError("");
    setScanResult("");

    try {
      const { brand, model, category } = await recogniseNameplate(file);

      if (brand) setValue("brand", brand);
      if (model) setValue("model", model);
      if (category) setValue("category", category);

      const summary = [brand, model].filter(Boolean).join("・");
      if (summary) {
        setScanResult(summary);
        // 讀到東西就直接進下一步 —— 填好的欄位本身就是最好的回饋
        setStep(2);
      } else {
        setScanError("看不清楚，請手動填寫");
      }
    } catch (error) {
      setScanError(
        error instanceof Error ? error.message : "辨識失敗，請稍後再試",
      );
    } finally {
      setIsScanning(false);
    }
  };

  const addPart = partForm.handleSubmit((values) => {
    setParts((prev) => [...prev, values]);
    partForm.reset({ action: "replace" });
    setAddingPart(false);
  });

  const onSubmit: SubmitHandler<ApplianceFormValues> = async (values) => {
    setErrorLog("");
    try {
      console.log({
        ...values,
        parts: parts.map((part) => ({
          ...part,
          cycleMonths: Number(part.cycleMonths),
        })),
      });
      navigate("/", { replace: true });
    } catch {
      setErrorLog("儲存失敗，請稍後再試");
    }
  };

  return (
    <main className="flex flex-1 flex-col sm:mx-auto sm:w-full sm:max-w-150">
      <div className="flex items-center px-5 pt-2 pb-1 sm:px-8">
        <span className="text-h1 font-medium">
          {step === 3 ? "新增耗材" : "新增家電"}
        </span>
      </div>

      <div className="border-cream-400 border-b px-5 pt-3.5 pb-4.5 sm:px-8">
        <StepIndicator current={step} labels={STEPS} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        {step === 1 && (
          <div className="flex flex-1 flex-col gap-4 px-5 pt-4.5 pb-3 sm:px-8">
            <PhotoCapture
              onCapture={handleScan}
              isScanning={isScanning}
              result={scanResult}
              error={scanError}
            />
            <div className="text-cream-800 flex items-start gap-2 px-1 pb-1 text-xs leading-relaxed">
              <AlertCircle width={14} height={14} className="mt-0.5 shrink-0" />
              <span>照片不會儲存，辨識完就會刪除，也不會將照片公開。</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2 sm:px-8">
            <ApplianceFields register={register} errors={errors} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-4 pb-2 sm:px-8">
            <p className="text-ink-muted text-xs">
              {getValues("name") || "這台家電"}
            </p>

            {parts.map((part, index) => (
              <div
                key={`${part.name}-${index}`}
                className="border-cream-400 bg-surface flex items-center gap-3 rounded-sm border px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body truncate font-medium">
                    {part.name}
                  </span>
                  <span className="text-ink-muted text-xs">
                    每 {part.cycleMonths} 個月
                    {part.action === "clean" ? "清洗" : "更換"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setParts((prev) => prev.filter((_, i) => i !== index))
                  }
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
                  <button
                    type="button"
                    onClick={addPart}
                    className={PRIMARY_BUTTON}
                  >
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
        )}

        {errorLog && (
          <div className="px-5 pb-2 sm:px-8">
            <FormError>{errorLog}</FormError>
          </div>
        )}

        <div className="border-cream-400 flex gap-2.5 border-t px-5 py-3.5 sm:px-8">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={GHOST_BUTTON}
              >
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
              <button
                type="button"
                onClick={handleSubmit(() => setStep(3))}
                className={PRIMARY_BUTTON}
              >
                新增耗材
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
      </form>
    </main>
  );
}
