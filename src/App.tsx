import { useState, useCallback } from "react";
import {
  Trash2,
  ShieldCheck,
  Camera,
  Ruler,
  Wand2,
  ArrowLeft,
  Lock,
  Zap,
} from "lucide-react";
import UploadZone from "./components/UploadZone";
import AnnotatorCanvas from "./components/AnnotatorCanvas";
import ResultsPanel from "./components/ResultsPanel";
import type { FootprintLayer, Measurement } from "./lib/volume";

type Phase = "upload" | "annotate";

function App() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [layers, setLayers] = useState<FootprintLayer[]>([]);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [fillKey, setFillKey] = useState("mixed");

  const handleImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setPhase("annotate");
  }, []);

  const handleNewPhoto = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setLayers([]);
    setMeasurement(null);
    setActiveLayerId(null);
    setPhase("upload");
  }, [imageSrc]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Trash2 className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <h1 className="font-semibold text-slate-800 text-sm sm:text-base">
              Оценка объёма кучи
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Lock className="w-3.5 h-3.5" />
              100% приватно
            </span>
            {phase === "annotate" && (
              <button
                onClick={handleNewPhoto}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Новое фото</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {phase === "upload" ? (
          <LandingPage onImage={handleImage} />
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              <div className="min-w-0">
                {imageSrc && (
                  <AnnotatorCanvas
                    imageSrc={imageSrc}
                    layers={layers}
                    setLayers={setLayers}
                    measurement={measurement}
                    setMeasurement={setMeasurement}
                    activeLayerId={activeLayerId}
                    setActiveLayerId={setActiveLayerId}
                    fillKey={fillKey}
                    setFillKey={setFillKey}
                  />
                )}
              </div>
              <aside className="lg:sticky lg:top-[72px] lg:self-start lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto">
                <ResultsPanel
                  layers={layers}
                  measurement={measurement}
                  fillKey={fillKey}
                  setFillKey={setFillKey}
                />
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200/60 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-400">
          Вся обработка в браузере. Данные не сохраняются и не передаются. Бесплатно.
        </div>
      </footer>
    </div>
  );
}

function LandingPage({ onImage }: { onImage: (file: File) => void }) {
  const steps = [
    {
      icon: Camera,
      title: "Загрузите фото",
      desc: "Перетащите или вставьте фото мусорной кучи",
    },
    {
      icon: Ruler,
      title: "Укажите эталон",
      desc: "Измерьте объект известного размера для масштаба",
    },
    {
      icon: Wand2,
      title: "ИИ обведёт кучи",
      desc: "Автоматическое определение контура или вручную",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full mb-6 border border-emerald-100">
          <Zap className="w-3.5 h-3.5" />
          ИИ-автоматизация · бесплатно
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-4 leading-tight">
          Расчёт объёма кучи
          <br />
          <span className="text-emerald-600">по одному фото</span>
        </h2>
        <p className="text-slate-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
          Загрузите фото, ИИ обведёт контур, укажите эталонный размер —
          и получите объём в кубических метрах. Прямо в браузере.
        </p>
      </div>

      {/* Upload */}
      <UploadZone onImage={onImage} />

      {/* Steps — compact, horizontal */}
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0 bg-white/60 rounded-2xl border border-slate-200/60 p-4 sm:p-5"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 sm:mx-auto mb-0 sm:mb-3">
              <s.icon className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                {i + 1}. {s.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Без загрузки на сервер
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-emerald-500" />
          Данные не покидают устройство
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-emerald-500" />
          Мгновенный результат
        </span>
      </div>
    </div>
  );
}

export default App;
