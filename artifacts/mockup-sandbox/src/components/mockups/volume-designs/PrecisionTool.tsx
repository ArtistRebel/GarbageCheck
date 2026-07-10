import React, { useState } from 'react';
import { Lock, Camera, Ruler, MousePointer2, Calculator, ShieldCheck, Upload, FileImage, Box } from 'lucide-react';

export default function PrecisionTool() {
  const [isHovered, setIsHovered] = useState(false);
  
  const steps = [
    {
      icon: Camera,
      title: "Загрузите фото",
      desc: "Перетащите или вставьте фото кучи",
    },
    {
      icon: Ruler,
      title: "Укажите эталон",
      desc: "Нарисуйте линию через объект известного размера",
    },
    {
      icon: MousePointer2,
      title: "Обведите контур",
      desc: "Вручную отметьте кучу точками",
    },
    {
      icon: Calculator,
      title: "Получите объём",
      desc: "Мгновенный расчёт в кубических метрах",
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] text-[#f1f5f9] font-sans selection:bg-[#06b6d4]/30 selection:text-white flex flex-col">
      {/* Background Grid Texture */}
      <div className="fixed inset-0 pointer-events-none" 
           style={{
             backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
             backgroundSize: '4rem 4rem',
             opacity: 0.05
           }}></div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0f172a]/80 backdrop-blur-md border-b border-[#334155]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[#334155] bg-[#1e293b] flex items-center justify-center shrink-0">
              <Box className="w-4 h-4 text-[#06b6d4]" strokeWidth={1.5} />
            </div>
            <h1 className="font-['Space_Grotesk'] font-medium text-[15px] tracking-wide text-[#f1f5f9]">
              Оценка объёма кучи
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#334155]/60 bg-[#1e293b]/50">
              <Lock className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-medium">
                100% приватно
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-16 sm:pt-24 pb-16 flex-1 flex flex-col">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse"></div>
            <span className="text-[11px] font-mono tracking-wider text-[#06b6d4] uppercase">Анализ в браузере</span>
          </div>
          <h2 className="font-['Space_Grotesk'] text-3xl sm:text-5xl font-bold tracking-tight mb-5 text-white leading-tight">
            Расчёт объёма кучи<br />
            <span className="text-[#06b6d4] relative inline-block mt-2">
              по одному фото
              <span className="absolute bottom-1 left-0 w-full h-1 bg-[#06b6d4]/20 -z-10"></span>
            </span>
          </h2>
          <p className="text-[#94a3b8] text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Загрузите фото, обведите контур, укажите эталонный размер — получите объём в м³. Прямо в браузере.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="mb-20">
          <div 
            className="group relative bg-[#1e293b] rounded-xl overflow-hidden transition-all duration-500 ease-out cursor-pointer"
            style={isHovered ? {
              boxShadow: '0 0 0 1px #06b6d4, 0 0 40px rgba(6,182,212,0.08)'
            } : {
              boxShadow: '0 0 0 1px #334155, 0 4px 20px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Dashed Border Overlay */}
            <div className={`absolute inset-4 rounded-lg border-2 border-dashed transition-colors duration-500 pointer-events-none ${isHovered ? 'border-[#06b6d4]' : 'border-[#334155]'}`}></div>
            
            <div className="py-20 sm:py-24 px-6 flex flex-col items-center justify-center text-center relative z-10">
              <div className={`w-16 h-16 rounded-2xl bg-[#0f172a] border border-[#334155] flex items-center justify-center mb-6 transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                <Upload className={`w-7 h-7 transition-colors duration-500 ${isHovered ? 'text-[#06b6d4]' : 'text-[#94a3b8]'}`} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-xl font-medium text-white mb-2 font-['Space_Grotesk']">
                Перетащите фото или нажмите
              </h3>
              <p className="text-[#94a3b8] flex items-center gap-2 text-sm mb-8">
                или вставьте из буфера 
                <kbd className="font-mono text-xs px-2 py-0.5 rounded bg-[#0f172a] border border-[#334155] text-[#94a3b8]">Ctrl+V</kbd>
              </p>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0f172a] border border-[#334155]">
                  <FileImage className="w-3.5 h-3.5 text-[#94a3b8]" />
                  <span className="text-[11px] font-mono text-[#94a3b8]">JPG · PNG · WEBP</span>
                </div>
              </div>
            </div>
            
            {/* Ambient Background Glow inside the card */}
            <div className={`absolute inset-0 bg-gradient-to-b from-[#06b6d4]/5 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : ''}`}></div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-6 relative">
            {/* Connecting Line */}
            <div className="hidden sm:block absolute top-[28px] left-[40px] right-[40px] h-[1px] bg-gradient-to-r from-[#334155] via-[#06b6d4]/50 to-[#334155] -z-10"></div>
            
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-5">
                <div className="w-14 h-14 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center shrink-0 shadow-lg relative">
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#06b6d4] text-[#0f172a] text-[10px] font-mono font-bold flex items-center justify-center border-2 border-[#0f172a]">
                    0{idx + 1}
                  </span>
                  <step.icon className="w-6 h-6 text-[#06b6d4]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[15px] font-medium text-white mb-1.5 font-['Space_Grotesk']">{step.title}</h4>
                  <p className="text-[13px] text-[#94a3b8] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Privacy */}
        <div className="mt-auto">
          <div className="flex justify-center border-t border-[#334155]/60 pt-8 mb-6">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[13px] text-[#94a3b8]">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#06b6d4]" />
                Без загрузки на сервер
              </span>
              <span className="hidden sm:block text-[#334155] font-black">·</span>
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#06b6d4]" />
                Данные не покидают устройство
              </span>
              <span className="hidden sm:block text-[#334155] font-black">·</span>
              <span className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#06b6d4]" />
                Бесплатно
              </span>
            </div>
          </div>
          
          <div className="text-center text-[11px] text-[#94a3b8]/60 uppercase tracking-wider font-mono">
            Только оценка. Точность зависит от эталонного измерения и угла съёмки.
          </div>
        </div>
      </main>

      <footer className="border-t border-[#334155]/40 bg-[#0f172a] mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[12px] text-[#94a3b8]">
            Вся обработка в браузере. Данные не сохраняются. Бесплатно.
          </div>
          <div className="text-[11px] font-mono text-[#475569]">
            v1.0.0 // LOCAL_ENV
          </div>
        </div>
      </footer>
    </div>
  );
}
