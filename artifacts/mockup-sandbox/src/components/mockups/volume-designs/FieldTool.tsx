import React from "react";
import {
  ShieldCheck,
  Camera,
  Ruler,
  PenTool,
  Box,
  Lock,
  UploadCloud,
  Layers,
} from "lucide-react";

export default function FieldTool() {
  const steps = [
    {
      num: "01",
      icon: Camera,
      title: "Загрузите фото",
      desc: "Перетащите или вставьте фото кучи",
    },
    {
      num: "02",
      icon: Ruler,
      title: "Укажите эталон",
      desc: "Нарисуйте линию через объект известного размера",
    },
    {
      num: "03",
      icon: PenTool,
      title: "Обведите контур",
      desc: "Вручную отметьте кучу точками",
    },
    {
      num: "04",
      icon: Box,
      title: "Получите объём",
      desc: "Мгновенный расчёт в кубических метрах",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans flex flex-col text-[#1c1917]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#1c1917] border-b border-[#292524] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#d97706] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <h1 className="font-bold text-base sm:text-lg tracking-wide">
              Оценка объёма кучи
            </h1>
          </div>
          <div className="flex items-center">
            <span className="flex items-center gap-1.5 text-xs text-[#d97706] font-semibold bg-[#292524] px-3 py-1.5 rounded">
              <Lock className="w-3.5 h-3.5" />
              100% приватно
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#292524] pt-16 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d97706] bg-[#d97706]/10 px-3 py-1.5 rounded border border-[#d97706]/20 mb-6 uppercase tracking-wider">
            Бесплатный инструмент
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Расчёт объёма кучи
            <br />
            <span className="text-[#d97706]">по одному фото</span>
          </h2>
          <p className="text-[#a8a29e] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Загрузите фото, обведите контур, укажите эталонный размер — получите объём в м³. Прямо в браузере.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 -mt-12 px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Upload Zone */}
          <div className="bg-white rounded-xl shadow-xl shadow-black/5 border-2 border-dashed border-[#e7e5e4] hover:border-[#d97706] transition-colors group cursor-pointer p-10 sm:p-14 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f5f5f4] group-hover:bg-[#d97706]/10 flex items-center justify-center mb-6 transition-colors">
              <UploadCloud className="w-8 h-8 text-[#d97706]" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-[#1c1917] mb-2">Перетащите фото или нажмите</h3>
            <p className="text-[#78716c] mb-6 font-medium">или вставьте из буфера (Ctrl+V)</p>
            <div className="flex gap-2 text-xs font-bold text-[#78716c]">
              <span className="bg-[#f5f5f4] px-3 py-1.5 rounded border border-[#e7e5e4]">JPG</span>
              <span className="bg-[#f5f5f4] px-3 py-1.5 rounded border border-[#e7e5e4]">PNG</span>
              <span className="bg-[#f5f5f4] px-3 py-1.5 rounded border border-[#e7e5e4]">WEBP</span>
            </div>
          </div>

          {/* Steps */}
          <div className="mt-16 bg-[#f5f5f4] rounded-2xl p-8 sm:p-10 border border-[#e7e5e4]">
            <h3 className="text-xl font-bold mb-8 text-center text-[#1c1917] uppercase tracking-wide">Как это работает</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-5">
                  <div className="text-4xl font-black text-[#d97706]/30 shrink-0 w-12 pt-1">{s.num}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className="w-4 h-4 text-[#d97706]" strokeWidth={2.5} />
                      <h4 className="font-bold text-[#1c1917] text-lg">{s.title}</h4>
                    </div>
                    <p className="text-[15px] text-[#78716c] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[15px] font-semibold text-[#78716c]">
            <span className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#d97706]" strokeWidth={2.5} />
              Без загрузки на сервер
            </span>
            <span className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-[#d97706]" strokeWidth={2.5} />
              Данные не покидают устройство
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1c1917] border-t border-[#292524] py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-[#a8a29e] text-sm font-medium mb-4">
            Вся обработка в браузере. Данные не сохраняются. Бесплатно.
          </p>
          <p className="text-[#78716c] text-xs max-w-xl mx-auto font-medium">
            Только оценка. Точность зависит от эталонного измерения и угла съёмки.
          </p>
        </div>
      </footer>
    </div>
  );
}
