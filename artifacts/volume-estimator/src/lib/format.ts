export function formatM2(v: number): string {
  if (!isFinite(v)) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(2)} тыс м²`;
  if (v >= 100) return `${v.toFixed(0)} м²`;
  if (v >= 10) return `${v.toFixed(1)} м²`;
  return `${v.toFixed(2)} м²`;
}

export function formatM3(v: number): string {
  if (!isFinite(v)) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(2)} тыс м³`;
  if (v >= 100) return `${v.toFixed(0)} м³`;
  if (v >= 10) return `${v.toFixed(1)} м³`;
  return `${v.toFixed(2)} м³`;
}

export function formatM(v: number): string {
  if (!isFinite(v)) return "—";
  if (v >= 100) return `${v.toFixed(0)} м`;
  if (v >= 10) return `${v.toFixed(1)} м`;
  return `${v.toFixed(2)} м`;
}

export function formatTruckLoads(m3: number): string {
  if (!isFinite(m3) || m3 <= 0) return "—";
  const loads = m3 / 8;
  if (loads >= 100) return `${Math.round(loads)}`;
  if (loads >= 10) return `${loads.toFixed(0)}`;
  if (loads >= 1) return `${loads.toFixed(1)}`;
  return `${loads.toFixed(2)}`;
}
