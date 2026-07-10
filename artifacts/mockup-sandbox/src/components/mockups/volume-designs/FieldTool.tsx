import React from "react";
import {
  ShieldCheck,
  Camera,
  Ruler,
  PenTool,
  Box,
  Lock,
  UploadCloud,
  Leaf,
  Zap,
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
    <div className="min-h-screen bg-[#f0fdf4] font-['DM_Sans',sans-serif] flex flex-col text-[#14532d]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#14532d] border-b border-[#052e16] text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#16a34a]/20 flex items-center justify-center shrink-0 border border-[#4ade80]/30 shadow-inner">
              <Leaf className="w-5 h-5 text-[#4ade80]" strokeWidth={2} />
            </div>
            <h1 className="font-semibold text-base sm:text-lg tracking-wide">
              Оценка объёма кучи
            </h1>
          </div>
          <div className="flex items-center">
            <span className="flex items-center gap-1.5 text-xs text-[#bbf7d0] font-medium bg-[#14532d]/40 border border-[#15803d] px-3 py-1.5 rounded-full shadow-sm">
              <Lock className="w-3.5 h-3.5" />
              100% приватно
            </span>
          </div>
        </div>
      </header>

      {/* Hero band */}
      <section className="bg-[#052e16] pt-16 pb-24 px-4 w-full relative">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4ade80] bg-[#14532d] px-4 py-1.5 rounded-full border border-[#15803d] mb-8 uppercase tracking-widest shadow-sm">
            ЭКОЛОГИЯ &middot; ТОЧНОСТЬ
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            Расчёт объёма кучи
            <br />
            <span className="text-[#4ade80]">по одному фото</span>
          </h2>
          <p className="text-[#dcfce7] text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-12">
            Загрузите фото, обведите контур, укажите эталонный размер — получите объём в м³. Прямо в браузере.
          </p>

          {/* Upload Zone Embedded */}
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#bbf7d0] p-10 sm:p-14 text-center flex flex-col items-center transition-all hover:border-[#4ade80] cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-[#f0fdf4] group-hover:bg-[#dcfce7] flex items-center justify-center mb-6 text-[#16a34a] border border-[#bbf7d0] transition-colors">
              <UploadCloud className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-[#14532d] mb-2 group-hover:text-[#16a34a] transition-colors">Перетащите фото или нажмите</h3>
            <p className="text-[#166534] mb-6 text-sm font-medium">или вставьте из буфера (Ctrl+V)</p>
            <div className="flex gap-3 text-xs font-bold text-[#166534]">
              <span className="bg-[#f0fdf4] px-3 py-1.5 rounded border border-[#bbf7d0]">JPG</span>
              <span className="bg-[#f0fdf4] px-3 py-1.5 rounded border border-[#bbf7d0]">PNG</span>
              <span className="bg-[#f0fdf4] px-3 py-1.5 rounded border border-[#bbf7d0]">WEBP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Steps section */}
      <section className="bg-[#f0fdf4] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm font-bold mb-10 text-center text-[#16a34a] uppercase tracking-wider">
            Как это работает
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="bg-white border border-[#dcfce7] rounded-2xl p-6 shadow-sm flex flex-col hover:border-[#bbf7d0] transition-colors hover:shadow-md">
                <div className="text-3xl font-bold font-mono text-[#4ade80] mb-4">
                  {s.num}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <s.icon className="w-5 h-5 text-[#16a34a]" strokeWidth={2} />
                  <h4 className="font-semibold text-[#14532d] text-lg">{s.title}</h4>
                </div>
                <p className="text-[#15803d] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="bg-white border-t border-[#dcfce7] py-8 px-4 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm font-medium text-[#15803d] text-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
            <span>Без загрузки на сервер</span>
          </div>
          <span className="hidden sm:inline text-[#bbf7d0] font-bold">&middot;</span>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#22c55e]" />
            <span>Данные не покидают устройство</span>
          </div>
          <span className="hidden sm:inline text-[#bbf7d0] font-bold">&middot;</span>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#22c55e]" />
            <span>Мгновенный результат</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#14532d] py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-[#bbf7d0] text-xs font-medium">
            Вся обработка в браузере. Данные не сохраняются. Бесплатно.
          </p>
        </div>
      </footer>
    </div>
  );
}
