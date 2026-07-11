import { useState, useCallback } from "react";
import { Layers } from "lucide-react";
import UploadZone from "./components/UploadZone";
import AnnotatorCanvas from "./components/AnnotatorCanvas";
import ResultsPanel from "./components/ResultsPanel";
import type { FootprintLayer, Measurement, PhotoEstimate } from "./lib/volume";
import { computeVolume, totalVolume } from "./lib/volume";
import { uid } from "./lib/id";

type Phase = "upload" | "annotate";

function App() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [layers, setLayers] = useState<FootprintLayer[]>([]);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [fillKey, setFillKey] = useState("mixed");
  // Additional photos of the same навал, each calculated independently,
  // used to combine several angle shots into one final estimate.
  const [photos, setPhotos] = useState<PhotoEstimate[]>([]);

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
    setPhotos([]);
    setPhase("upload");
  }, [imageSrc]);

  // Save the current photo's independently-computed volume, then return to
  // the upload screen for another angle of the same навал.
  const handleAddAnotherPhoto = useCallback(() => {
    if (!measurement || layers.length === 0) return;
    const hasHeights = layers.every((l) => l.heightM > 0);
    if (!hasHeights) return;
    const results = layers.map((l) => computeVolume(l, measurement, fillKey));
    const { m3 } = totalVolume(results);
    setPhotos((prev) => [...prev, { id: uid(), volumeM3: m3 }]);
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setLayers([]);
    setMeasurement(null);
    setActiveLayerId(null);
    setPhase("upload");
  }, [measurement, layers, fillKey, imageSrc]);

  return (
    <div className="min-h-screen bg-[#f4f7f5] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#1a3329] h-14 border-b border-[#1a3329]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2d7d4e] flex items-center justify-center shrink-0">
              <Layers className="w-4.5 h-4.5 text-[#e6f0ea]" strokeWidth={2} />
            </div>
            <h1 className="font-semibold text-white text-sm">
              Оценка объёма
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center text-xs text-[#a8c9b4]">
              Всё — в браузере
            </span>
            {phase === "annotate" && (
              <button
                onClick={handleNewPhoto}
                className="flex items-center gap-1.5 text-sm font-medium text-[#a8c9b4] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                ← Назад
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
                  photos={photos}
                  onAddAnotherPhoto={handleAddAnotherPhoto}
                />
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#cfe0d6] bg-[#f4f7f5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-[#5a7a67]">
          Рекомендуется для корректной работы калькулятора использовать компьютер или ноутбук. В мобильной версии некоторые функции, такие, как настройка масштаба, могут работать некорректно.
        </div>
      </footer>
    </div>
  );
}

function LandingPage({ onImage }: { onImage: (file: File) => void }) {
  const steps = [
    {
      title: "Загрузите фотографию",
      desc: "Выберите снимок с навалом мусора или перетащите его в окно",
    },
    {
      title: "Задайте масштаб",
      desc: "Нарисуйте отрезок вдоль объекта с известными размерами — человека, машины или ящика",
    },
    {
      title: "Обведите контур",
      desc: "Кликайте по краям навала, добавляя точки. Замкните контур нажатием на первую точку или клавишей Enter",
    },
    {
      title: "Получите объём",
      desc: "Укажите высоту навала — инструмент рассчитает объём в м³ и необходимое число рейсов",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2d7d4e] bg-[#e6f0ea] px-3 py-1.5 rounded-full mb-6 border border-[#cfe0d6]">
          Бесплатно · Без регистрации
        </div>
        <h2 className="text-4xl sm:text-5xl font-semibold text-[#1a2e22] tracking-tight mb-4 leading-tight">
          Рассчитайте объём
          <br />
          <span className="text-[#2d7d4e]">мусорного навала</span>
        </h2>
        <p className="text-[#5a7a67] text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
          Загрузите снимок, обведите контур, задайте масштаб — получите объём в м³. Всё вычисляется прямо в браузере, данные никуда не передаются.
        </p>
      </div>

      {/* Upload */}
      <UploadZone onImage={onImage} />

      {/* Steps */}
      <div className="mt-14">
        <h3 className="text-xl font-semibold text-[#1a2e22] text-center mb-8 tracking-tight">Как это работает</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="bg-white rounded-xl border border-[#cfe0d6] p-5 shadow-sm"
            >
              <div className="text-2xl font-semibold text-[#2d7d4e] mb-2">
                {i + 1}
              </div>
              <h4 className="font-semibold text-[#1a2e22] text-sm mb-1.5">
                {s.title}
              </h4>
              <p className="text-xs text-[#5a7a67] leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-10 text-center text-xs text-[#5a7a67]">
        Расчет является ориентировочным. Для настройки масштаба используйте объект на фото с известным размером (покрышка, матрас и т.д.)
      </div>
    </div>
  );
}

export default App;
