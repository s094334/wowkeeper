import Camera from "../../assets/icons/Camera.svg?react";
import Check from "../../assets/icons/Check.svg?react";
import RefreshCw from "../../assets/icons/RefreshCw.svg?react";

type PhotoCaptureProps = {
  onCapture: (file: File) => void;
  isScanning?: boolean;
  result?: string;
  error?: string;
};

export function PhotoCapture({
  onCapture,
  isScanning = false,
  result,
  error,
}: PhotoCaptureProps) {
  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onCapture(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-ink-muted text-xs font-medium">銘牌照片</span>

      <input
        id="photo"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePick}
        disabled={isScanning}
        className="hidden"
      />

      <label
        htmlFor="photo"
        className={`flex flex-col items-center gap-2 rounded-sm border border-dashed px-4 py-6 ${
          isScanning
            ? "border-cream-500 text-ink-muted cursor-wait"
            : error
              ? "border-danger hover:bg-cream-100 cursor-pointer"
              : "border-cream-500 hover:bg-cream-100 hover:border-cream-800 cursor-pointer"
        }`}
      >
        {isScanning ? (
          <>
            <RefreshCw
              width={22}
              height={22}
              className="text-cream-800 animate-spin"
            />
            <span className="text-sm font-medium">辨識中…</span>
          </>
        ) : result ? (
          <>
            <Check width={22} height={22} className="text-lamp-green-fg" />
            <span className="text-sm font-medium">{result}</span>
            <span className="text-ink-muted text-2xs">
              不對的話可以直接改，或重拍一次
            </span>
          </>
        ) : (
          <>
            <Camera width={22} height={22} className="text-cream-800" />
            <span className="text-sm font-medium">
              {error ? "重新拍照" : "拍照自動辨識"}
            </span>
            <span
              className={`text-2xs ${error ? "text-danger" : "text-ink-muted"}`}
            >
              {error ?? "對準銘牌，自動填入品牌與型號"}
            </span>
          </>
        )}
      </label>
    </div>
  );
}
