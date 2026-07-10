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
        setError("Пожалуйста, выберите файл изображения");
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
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
          dragging
            ? "border-[#2d7d4e] bg-[#e6f0ea]"
            : "border-[#cfe0d6] bg-white hover:border-[#2d7d4e]/40 hover:bg-[#e6f0ea]/50"
        } px-6 py-12 text-center shadow-sm`}
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
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
              dragging ? "bg-[#2d7d4e]/10" : "bg-[#f4f7f5]"
            }`}
          >
            <Upload
              className={`w-6 h-6 transition-colors ${
                dragging ? "text-[#2d7d4e]" : "text-[#5a7a67]"
              }`}
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="text-base font-semibold text-[#1a2e22]">
              Нажмите или перетащите фотографию
            </p>
            <p className="text-sm text-[#5a7a67] mt-0.5">
              Или вставьте из буфера обмена (Ctrl+V)
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs text-[#5a7a67] bg-[#f4f7f5] px-2.5 py-1 rounded-md border border-[#cfe0d6]">
              JPG · PNG · WEBP
            </span>
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      <p className="mt-4 text-center text-xs text-[#5a7a67] flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />
        Файлы не загружаются на сервер
      </p>
    </div>
  );
}
