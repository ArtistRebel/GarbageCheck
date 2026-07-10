import React, { useEffect } from "react";
import {
  Lock,
  UploadCloud,
  CloudOff,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function CleanPro() {
  useEffect(() => {
    if (!document.getElementById("font-instrument-serif")) {
      const link = document.createElement("link");
      link.id = "font-instrument-serif";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const headingStyle = { fontFamily: "'Instrument Serif', serif" };

  const steps = [
    {
      title: "Загрузите фото",
      desc: "Перетащите или вставьте фото кучи",
    },
    {
      title: "Укажите эталон",
      desc: "Нарисуйте линию через объект известного размера",
    },
    {
      title: "Обведите контур",
      desc: "Вручную отметьте кучу точками",
    },
    {
      title: "Получите объём",
      desc: "Мгновенный расчёт в кубических метрах",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-700 shrink-0"
            >
              <rect width="24" height="24" fill="currentColor" />
              <rect x="8" y="8" width="8" height="8" fill="white" />
            </svg>
            <h1 className="font-semibold text-slate-900 text-[15px] tracking-tight">
              Оценка объёма кучи
            </h1>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
              <Lock className="w-3.5 h-3.5" />
              100% приватно
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-24 pb-24">
        {/* Hero */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none -z-10"></div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 mb-8">
            В браузере
          </div>

          <h2
            className="text-[2.75rem] sm:text-[4.5rem] text-slate-900 mb-6 max-w-4xl mx-auto"
            style={{ ...headingStyle, lineHeight: "1.05" }}
          >
            Расчёт объёма кучи
            <br />
            <span className="text-blue-700 italic">по одному фото</span>
          </h2>
          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Загрузите фото, обведите контур, укажите эталонный размер — получите
            объём в м³. Прямо в браузере.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="max-w-2xl mx-auto mb-20 group">
          <div className="relative bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(29,78,216,0.08)] hover:border-blue-400 overflow-hidden">
            <div className="absolute inset-2 border-[1.5px] border-dashed border-slate-200 rounded-lg group-hover:border-blue-200 transition-colors pointer-events-none z-10"></div>

            <button className="w-full relative z-20 px-8 py-20 flex flex-col items-center justify-center cursor-pointer bg-transparent text-center focus:outline-none">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:scale-105 transition-all duration-300">
                <UploadCloud
                  className="w-7 h-7 text-blue-700"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">
                Перетащите фото или нажмите
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                или вставьте из буфера (Ctrl+V)
              </p>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium tracking-wider uppercase bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">
                  JPG
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">
                  PNG
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">
                  WEBP
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* How it works steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative group hover:border-blue-200 transition-colors"
            >
              <div className="text-blue-700 font-mono text-xl mb-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                0{i + 1}
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">
                {step.title}
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600 font-medium">
            <span className="text-slate-300 hidden sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <CloudOff className="w-4 h-4 text-slate-400" />
              <span>Без загрузки</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Данные не покидают устройство</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              <span>Бесплатно</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">·</span>
          </div>
          <p className="mt-8 text-xs text-slate-400 max-w-lg text-center leading-relaxed">
            Только оценка. Точность зависит от эталонного измерения и угла
            съёмки.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-900 shrink-0"
            >
              <rect width="24" height="24" fill="currentColor" />
              <rect x="8" y="8" width="8" height="8" fill="white" />
            </svg>
            <span className="text-xs font-semibold tracking-tight">
              Оценка объёма кучи
            </span>
          </div>
          <div className="text-xs text-slate-500 text-center sm:text-right">
            Вся обработка в браузере. Данные не сохраняются. Бесплатно.
          </div>
        </div>
      </footer>
    </div>
  );
}
