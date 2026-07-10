import { Truck, Layers, Info, Sparkles } from "lucide-react";
import type { FootprintLayer, Measurement, VolumeResult } from "../lib/volume";
import { computeVolume, totalVolume } from "../lib/volume";
import { FILL_FACTOR_LABELS } from "../lib/volume";
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">
          {!hasMeasurement && !hasLayers
            ? "Укажите эталонный размер и обведите хотя бы одну кучу для отображения результатов."
            : !hasMeasurement
              ? "Укажите эталонный размер для задания масштаба."
              : "Обведите хотя бы одну кучу для отображения результатов."}
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
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="text-sm font-semibold text-slate-700 block mb-2">
          Плотность кучи
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FILL_FACTOR_LABELS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFillKey(f.value)}
              className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                fillKey === f.value
                  ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="font-semibold text-slate-800">{f.label}</div>
              <div className="text-slate-500 mt-0.5">{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Per-pile results */}
      <div className="space-y-2">
        {results.map((r) => (
          <div
            key={r.layerId}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-800 text-sm">
                {r.label}
              </h4>
              {r.heightM <= 0 && (
                <span className="text-xs text-amber-600 font-medium">
                  Введите высоту
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

      {/* Totals — prominent on-screen display */}
      {canCompute && (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5" />
            <h3 className="font-semibold">Общий расчётный объём</h3>
          </div>
          <div className="text-center py-2">
            <p className="text-5xl font-bold tracking-tight">
              {formatM3(totals.m3)}
            </p>
            <p className="text-emerald-100 text-sm mt-1">кубических метров</p>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-400/40 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-100 shrink-0" />
              <div>
                <p className="text-xs text-emerald-100">Рейсов (по 8 м³)</p>
                <p className="font-bold text-white">
                  {formatTruckLoads(totals.m3)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-100 shrink-0" />
              <div>
                <p className="text-xs text-emerald-100">Общая площадь</p>
                <p className="font-bold text-white">
                  {formatM2(totals.footprintM2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Только оценка.</strong> Этот инструмент даёт грубое визуальное
          приближение по одному 2D-фото. Точность зависит от качества эталонного
          измерения, оценки высоты и угла съёмки. Результаты подходят для
          планирования и отчётности, но не для коммерческого биллинга или
          юридического соответствия.
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
      <p className="text-xs text-slate-400">{label}</p>
      <p
        className={`font-semibold ${highlight ? "text-emerald-600 text-lg" : "text-slate-800"}`}
      >
        {value}
      </p>
    </div>
  );
}
