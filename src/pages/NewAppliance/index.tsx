import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { recogniseNameplate } from "../../api/recognise";
import AlertCircle from "../../assets/icons/AlertCircle.svg?react";
import X from "../../assets/icons/X.svg?react";
import { ApplianceFields } from "../../components/ApplianceFields";
import {
  toApplianceInput,
  type ApplianceFormValues,
} from "../../components/ApplianceFields/fields";
import { FormError } from "../../components/common/FormError";
import { PhotoCapture } from "../../components/common/PhotoCapture";
import { PrivacyNotice } from "../../components/PrivacyNotice";
import {
  toPartInput,
  type PartFormValues,
} from "../../components/PartFields/fields";
import { StepIndicator } from "../../components/StepIndicator";
import { useApplianceMutations } from "../../hooks/useAppliances";
import { PartsStep } from "./PartsStep";
import { StepActions } from "./StepActions";

const STEPS = ["拍照", "家電資料", "耗材設定"];

export function NewAppliance() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [scanError, setScanError] = useState("");
  const [parts, setParts] = useState<PartFormValues[]>([]);
  const {
    addAppliance,
    isAdding,
    errorLog: mutationErrors,
  } = useApplianceMutations();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ApplianceFormValues>({
    mode: "onBlur",
    defaultValues: { category: "" },
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

  const onSubmit: SubmitHandler<ApplianceFormValues> = (values) => {
    addAppliance(
      { ...toApplianceInput(values), parts: parts.map(toPartInput) },
      { onSuccess: () => navigate("/", { replace: true }) },
    );
  };

  return (
    <main className="flex flex-1 flex-col sm:mx-auto sm:w-full sm:max-w-150">
      <div className="flex items-center justify-between px-5 pt-6 pb-1 sm:px-8">
        <span className="text-h1 font-medium">
          {step === 3 ? "新增耗材" : "新增家電"}
        </span>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="取消"
          className="text-cream-800 hover:bg-cream-100 hover:text-ink -mr-1.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full"
        >
          <X width={18} height={18} />
        </button>
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
              <span>
                照片僅用於辨識銘牌文字。 <PrivacyNotice />
              </span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2 sm:px-8">
            <ApplianceFields register={register} errors={errors} />
          </div>
        )}

        {step === 3 && (
          <PartsStep
            applianceName={getValues("name")}
            parts={parts}
            onAdd={(part) => setParts((prev) => [...prev, part])}
            onRemove={(index) =>
              setParts((prev) => prev.filter((_, i) => i !== index))
            }
          />
        )}

        {mutationErrors.length > 0 && (
          <div className="flex flex-col gap-2 px-5 pb-2 sm:px-8">
            {mutationErrors.map((message, index) => (
              <FormError key={index}>{message}</FormError>
            ))}
          </div>
        )}

        <StepActions
          step={step}
          setStep={setStep}
          isSubmitting={isAdding}
          onCancel={() => navigate(-1)}
          onNext={handleSubmit(() => setStep(3))}
        />
      </form>
    </main>
  );
}
