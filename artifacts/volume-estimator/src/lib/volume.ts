import type { Polygon, Box } from "./geometry";
import { polygonArea, boundingBox } from "./geometry";

export type FootprintLayer = {
  id: string;
  polygon: Polygon;
  heightPx: number;
  heightM: number;
  label: string;
};

export type Measurement = {
  id: string;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  meters: number;
};

export type VolumeResult = {
  layerId: string;
  label: string;
  footprintAreaM2: number;
  heightM: number;
  volumeM3: number;
  fillFactor: number;
};

export const DEFAULT_FILL_FACTORS: Record<string, number> = {
  loose: 0.85,
  mixed: 0.7,
  compacted: 0.55,
};

export const FILL_FACTOR_LABELS: { value: string; label: string; desc: string }[] = [
  { value: "loose", label: "Рыхлая / свежая", desc: "Только что насыпана, много пустот" },
  { value: "mixed", label: "Смешанная / частично слежавшаяся", desc: "Некоторое уплотнение, умеренные пустоты" },
  { value: "compacted", label: "Уплотнённая / плотная", desc: "Утрамбована, минимальные пустоты" },
];

function getScale(measurement: Measurement): number {
  const dx = measurement.p2.x - measurement.p1.x;
  const dy = measurement.p2.y - measurement.p1.y;
  const px = Math.hypot(dx, dy);
  if (px < 1) return 0;
  return measurement.meters / px;
}

function layerFootprintAreaM2(layer: FootprintLayer, scale: number): number {
  const pxArea = polygonArea(layer.polygon);
  return pxArea * scale * scale;
}

function estimateHeightM(layer: FootprintLayer, scale: number): number {
  if (layer.heightM > 0) return layer.heightM;
  if (layer.heightPx > 0 && scale > 0) return layer.heightPx * scale;
  return 0;
}

export function computeVolume(
  layer: FootprintLayer,
  measurement: Measurement,
  fillKey: string,
): VolumeResult {
  const scale = getScale(measurement);
  const footprintAreaM2 = layerFootprintAreaM2(layer, scale);
  const heightM = estimateHeightM(layer, scale);
  const fillFactor = DEFAULT_FILL_FACTORS[fillKey] ?? 0.7;
  const volumeM3 = footprintAreaM2 * heightM * fillFactor;
  return {
    layerId: layer.id,
    label: layer.label,
    footprintAreaM2,
    heightM,
    volumeM3,
    fillFactor,
  };
}

export function totalVolume(results: VolumeResult[]): {
  m3: number;
  footprintM2: number;
} {
  let m3 = 0;
  let footprintM2 = 0;
  for (const r of results) {
    m3 += r.volumeM3;
    footprintM2 += r.footprintAreaM2;
  }
  return { m3, footprintM2 };
}

export function getLayerBox(layer: FootprintLayer): Box | null {
  return boundingBox(layer.polygon);
}

// ---- Multi-photo estimation for the same waste pile (навал) ----

export type PhotoEstimate = {
  id: string;
  volumeM3: number;
};

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function combinePhotoVolumes(volumes: number[]): {
  estimate: number;
  min: number;
  max: number;
} {
  if (volumes.length === 0) return { estimate: 0, min: 0, max: 0 };
  return {
    estimate: median(volumes),
    min: Math.min(...volumes),
    max: Math.max(...volumes),
  };
}
