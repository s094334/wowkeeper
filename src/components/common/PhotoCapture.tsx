import Camera from "../../assets/icons/Camera.svg?react";
import Check from "../../assets/icons/Check.svg?react";
import RefreshCw from "../../assets/icons/RefreshCw.svg?react";

type PhotoCaptureProps = {
  onCapture: (file: File) => void;
  isScanning?: boolean;
  result?: string;
  error?: string;
};

export function PhotoCapture(props: PhotoCaptureProps) {
  const { onCapture, isScanning = false, result, error } = props;
  const settled = Boolean(result || error);

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onCapture(file);
  };

  return (
    <>
      <input
        id="photo"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePick}
        disabled={isScanning}
        className="hidden"
      />

      <div
        className={`flex flex-1 flex-col items-center justify-center gap-4 rounded-sm border border-dashed px-5 py-6 text-center ${
          error ? "border-danger" : "border-cream-500"
        }`}
      >
        <span className="border-cream-500 text-cream-700 flex size-18 items-center justify-center rounded-lg border border-dashed">
          {isScanning ? (
            <RefreshCw width={26} height={26} className="animate-spin" />
          ) : result ? (
            <Check width={26} height={26} className="text-lamp-green-fg" />
          ) : (
            <Camera width={26} height={26} />
          )}
        </span>
        {isScanning ? (
          <p className="text-ink-muted text-sm leading-relaxed">
            辨識中，請稍等一下下
          </p>
        ) : result ? (
          <div className="flex flex-col gap-1">
            <p className="text-body font-medium">{result}</p>
            <p className="text-ink-muted text-xs">下一步可以修改讀錯的地方</p>
          </div>
        ) : error ? (
          <p className="text-danger max-w-80 text-sm leading-relaxed text-pretty">
            {error}
          </p>
        ) : (
          <p className="text-ink-muted max-w-80 text-sm leading-relaxed text-pretty">
            拍下銘牌上的型號，或從相簿選一張既有的照片，類型、品牌與型號會自動帶入下一步。
          </p>
        )}

        <label
          htmlFor="photo"
          className={`flex h-10 w-full max-w-55 items-center justify-center gap-2 rounded-xs text-sm font-medium ${
            isScanning
              ? "bg-cream-300 text-cream-700 cursor-wait"
              : settled
                ? "border-cream-400 hover:bg-cream-100 cursor-pointer border"
                : "bg-terracotta hover:bg-terracotta-hover cursor-pointer text-white"
          }`}
        >
          {!isScanning && settled && <Camera width={15} height={15} />}
          {isScanning ? "辨識中…" : settled ? "重新拍照" : "拍照"}
        </label>
      </div>
    </>
  );
}
