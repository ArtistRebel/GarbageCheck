import { Truck, Layers, Info, Sparkles } from "lucide-react";
import type { FootprintLayer, Measurement, VolumeResult } from "../lib/volume";
import { computeVolume, totalVolume } from "../lib/volume";
import {
  formatM2,
  formatM3,
  formatM,
  formatTruckLoads,
} from "../lib/format";

type Props = {
  layers: FootprintLayer[];
  measurement: Measurement | null;
  fillKey: string;
  setFillKey: (k: string) => void;
};

const LOCAL_FILL_LABELS = [
  { value: "loose", label: "Рыхлая", desc: "Только насыпана, много пустот" },
  { value: "mixed", label: "Смешанная", desc: "Частично слежалась, умеренные пустоты" },
  { value: "compacted", label: "Плотная", desc: "Утрамбована, минимум пустот" },
];

export default function ResultsPanel({
  layers,
  measurement,
  fillKey,
  setFillKey,
}: Props) {
  const hasMeasurement = !!measurement;
  const hasLayers = layers.length > 0;
  const hasHeights = layers.every((l) => l.heightM > 0);

  if (!hasMeasurement || !hasLayers) {
    return (
      <div className="bg-white rounded-xl border border-[#cfe0d6] p-6 text-center shadow-sm">
        <Info className="w-8 h-8 text-[#a8c9b4] mx-auto mb-2" />
        <p className="text-sm text-[#5a7a67]">
          {!hasMeasurement && !hasLayers
            ? "Задайте масштаб и обведите кучу, чтобы увидеть расчёт."
            : !hasMeasurement
              ? "Задайте масштаб — нарисуйте отрезок вдоль объекта известного размера."
              : "Обведите контур хотя бы одной кучи."}
        </p>
      </div>
    );
  }

  const results: VolumeResult[] = layers.map((l) =>
    computeVolume(l, measurement!, fillKey),
  );
  const totals = totalVolume(results);
  const canCompute = hasHeights;

  return (
    <div className="space-y-4">
      {/* Fill factor selector */}
      <div className="bg-white rounded-xl border border-[#cfe0d6] p-4 shadow-sm">
        <label className="text-sm font-semibold text-[#1a2e22] block mb-2 tracking-tight">
          Плотность заполнения
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {LOCAL_FILL_LABELS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFillKey(f.value)}
              className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                fillKey === f.value
                  ? "border-[#2d7d4e] bg-[#e6f0ea] ring-2 ring-[#2d7d4e]/20"
                  : "border-[#cfe0d6] bg-white hover:border-[#2d7d4e]/40"
              }`}
            >
              <div className={`font-semibold ${fillKey === f.value ? "text-[#1a2e22]" : "text-[#1a2e22]"}`}>{f.label}</div>
              <div className={`mt-0.5 ${fillKey === f.value ? "text-[#5a7a67]" : "text-[#5a7a67]"}`}>{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Per-pile results */}
      <div className="space-y-2">
        {results.map((r) => (
          <div
            key={r.layerId}
            className="bg-white rounded-xl border border-[#cfe0d6] p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-[#1a2e22] text-sm tracking-tight">
                {r.label}
              </h4>
              {r.heightM <= 0 && (
                <span className="text-xs text-[#2d7d4e] font-medium bg-[#e6f0ea] px-2 py-0.5 rounded">
                  Укажите высоту
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Stat
                label="Площадь"
                value={formatM2(r.footprintAreaM2)}
              />
              <Stat label="Высота" value={formatM(r.heightM)} />
              <Stat
                label="Объём"
                value={formatM3(r.volumeM3)}
                highlight
              />
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      {canCompute && (
        <div className="bg-[#1a3329] rounded-xl p-6 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-[#a8c9b4]">
            <Layers className="w-5 h-5" />
            <h3 className="font-semibold tracking-tight text-white">Суммарный объём</h3>
          </div>
          <div className="text-center py-2">
            <p className="text-4xl font-semibold tracking-tight text-white">
              {formatM3(totals.m3)}
            </p>
            <p className="text-[#a8c9b4] text-sm mt-1">кубических метров</p>
          </div>
          <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#5dbf82] shrink-0" />
              <div>
                <p className="text-xs text-[#a8c9b4]">Рейсов (8 м³/рейс)</p>
                <p className="font-semibold text-white">
                  {formatTruckLoads(totals.m3)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5dbf82] shrink-0" />
              <div>
                <p className="text-xs text-[#a8c9b4]">Суммарная площадь</p>
                <p className="font-semibold text-white">
                  {formatM2(totals.footprintM2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-[#e6f0ea] border border-[#cfe0d6] rounded-xl p-4 shadow-sm mt-4">
        <p className="text-xs text-[#5a7a67] leading-relaxed">
          Приблизительная оценка. Точность зависит от корректности эталонного измерения, заданной высоты и угла съёмки.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-[#5a7a67]">{label}</p>
      <p
        className={`font-semibold mt-0.5 ${highlight ? "text-[#2d7d4e] text-lg" : "text-[#1a2e22]"}`}
      >
        {value}
      </p>
    </div>
  );
}
