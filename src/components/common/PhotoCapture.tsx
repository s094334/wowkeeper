import Camera from "../../assets/icons/Camera.svg?react";
import RefreshCw from "../../assets/icons/RefreshCw.svg?react";

type PhotoCaptureProps = {
  onCapture: (file: File) => void;
  isScanning?: boolean;
};

export function PhotoCapture({
  onCapture,
  isScanning = false,
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
        className={`border-cream-500 flex flex-col items-center gap-2 rounded-sm border border-dashed px-4 py-6 ${
          isScanning
            ? "text-ink-muted cursor-wait"
            : "hover:bg-cream-100 hover:border-cream-800 cursor-pointer"
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
        ) : (
          <>
            <Camera width={22} height={22} className="text-cream-800" />
            <span className="text-sm font-medium">拍照自動辨識</span>
            <span className="text-ink-muted text-2xs">
              對準銘牌，自動填入品牌與型號
            </span>
          </>
        )}
      </label>
    </div>
  );
}
