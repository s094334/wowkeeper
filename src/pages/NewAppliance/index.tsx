import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import ArrowLeft from "../../assets/icons/ArrowLeft.svg?react";
import { FormError } from "../../components/common/FormError";
import { FormField } from "../../components/common/FormField";
import { PhotoCapture } from "../../components/common/PhotoCapture";
import { APPLIANCE_CATEGORY_LABELS } from "../../data/appliances";
import { fields, type ApplianceFormValues } from "./fields";
import { useState } from "react";

export function NewAppliance() {
  const navigate = useNavigate();
  const [errorLog, setErrorLog] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplianceFormValues>({
    mode: "onBlur",
    defaultValues: { category: "" },
  });

  const handleScan = async (file: File) => {
    setIsScanning(true);
    // 確認有收到照片，之後拿掉
    try {
      console.log("收到照片", {
        name: file.name,
        type: file.type,
        sizeKB: Math.round(file.size / 1024),
      });
    } finally {
      setIsScanning(false);
    }
  };

  const onSubmit: SubmitHandler<ApplianceFormValues> = async (values) => {
    setErrorLog("");
    try {
      console.log(values);
      navigate("/", { replace: true });
    } catch {
      setErrorLog("儲存失敗，請稍後再試");
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8 sm:mx-auto sm:w-full sm:max-w-150 sm:px-8">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-ink hover:bg-cream-100 -ml-2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full"
        >
          <ArrowLeft width={20} height={20} />
        </button>
        <h1 className="text-h1 font-semibold tracking-[-0.02em]">新增家電</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <PhotoCapture onCapture={handleScan} isScanning={isScanning} />
        <div className="wk-card-outline flex flex-col gap-4 p-4.5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="category"
              className="text-ink-muted text-xs font-medium"
            >
              家電類型
            </label>
            <select
              id="category"
              {...register("category", { required: "請選擇家電類型" })}
              className="border-cream-400 focus:border-terracotta text-body cursor-pointer border-b py-2.5 outline-none"
            >
              <option value="">選擇家電類型</option>
              {Object.entries(APPLIANCE_CATEGORY_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
            {errors.category && (
              <p className="text-danger text-2xs">{errors.category.message}</p>
            )}
          </div>

          {fields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              register={register}
              errors={errors}
            />
          ))}
        </div>

        {errorLog && <FormError>{errorLog}</FormError>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="wk-cta w-full cursor-pointer disabled:opacity-60"
        >
          完成建檔
        </button>
      </form>
    </main>
  );
}
