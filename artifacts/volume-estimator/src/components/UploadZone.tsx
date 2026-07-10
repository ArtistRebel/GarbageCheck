import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, ClipboardPaste, X, Lock } from "lucide-react";

type Props = {
  onImage: (file: File) => void;
};

export default function UploadZone({ onImage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Пожалуйста, выберите изображение (JPG, PNG и т.д.).");
        return;
      }
      setError(null);
      onImage(file);
    },
    [onImage],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile],
  );

  const onPaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
            return;
          }
        }
      }
    },
    [handleFile],
  );

  useEffect(() => {
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onPaste]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
          dragging
            ? "border-emerald-400 bg-emerald-50/60"
            : "border-slate-200 bg-white/50 hover:border-emerald-300 hover:bg-emerald-50/30"
        } px-6 py-12 text-center`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              dragging ? "bg-emerald-100" : "bg-slate-100"
            }`}
          >
            <Upload
              className={`w-6 h-6 transition-colors ${
                dragging ? "text-emerald-600" : "text-slate-400"
              }`}
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-700">
              Перетащите фото или нажмите
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              или вставьте из буфера (Ctrl+V)
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              JPG · PNG · WEBP
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              <ClipboardPaste className="w-3 h-3" /> Буфер
            </span>
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />
        Фото не покидает ваше устройство
      </p>
    </div>
  );
}
