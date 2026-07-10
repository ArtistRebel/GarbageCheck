import type { Point } from "./geometry";

/**
 * Browser-based computer vision for auto-detecting pile outlines.
 * Uses color-similarity flood fill from a seed point, then extracts
 * the contour via boundary marching. Runs entirely on-device — no API, no cost.
 */

type Pixel = { r: number; g: number; b: number };

function getPixel(data: Uint8ClampedArray, w: number, x: number, y: number): Pixel {
  const i = (y * w + x) * 4;
  return { r: data[i], g: data[i + 1], b: data[i + 2] };
}

function colorDist(a: Pixel, b: Pixel): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Flood fill from a seed point, collecting all pixels within a color tolerance.
 * Returns a boolean mask (Uint8Array) where 1 = inside region.
 */
export function floodFill(
  imageData: ImageData,
  seedX: number,
  seedY: number,
  tolerance: number,
): Uint8Array {
  const { width: w, height: h, data } = imageData;
  const mask = new Uint8Array(w * h);
  const seedColor = getPixel(data, w, seedX, seedY);

  const stack: number[] = [seedY * w + seedX];
  mask[seedY * w + seedX] = 1;

  while (stack.length > 0) {
    const idx = stack.pop()!;
    const x = idx % w;
    const y = Math.floor(idx / w);

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const nidx = ny * w + nx;
      if (mask[nidx]) continue;
      const np = getPixel(data, w, nx, ny);
      if (colorDist(np, seedColor) <= tolerance) {
        mask[nidx] = 1;
        stack.push(nidx);
      }
    }
  }

  return mask;
}

/**
 * Extract the outer contour of a binary mask using boundary following.
 * Returns a simplified polygon (array of points) in image coordinates.
 */
export function extractContour(mask: Uint8Array, w: number, h: number): Point[] {
  // Find the first boundary pixel (top-leftmost filled pixel that has an empty neighbor)
  let startX = -1;
  let startY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      // Check if it's a boundary pixel (has at least one empty 4-neighbor)
      const isBoundary =
        x === 0 || x === w - 1 || y === 0 || y === h - 1 ||
        !mask[y * w + x - 1] || !mask[y * w + x + 1] ||
        !mask[(y - 1) * w + x] || !mask[(y + 1) * w + x];
      if (isBoundary) {
        startX = x;
        startY = y;
        break;
      }
    }
    if (startX >= 0) break;
  }
  if (startX < 0) return [];

  // Moore boundary tracing
  const contour: Point[] = [];
  const visited = new Set<string>();
  const directions = [
    [0, -1], [1, -1], [1, 0], [1, 1],
    [0, 1], [-1, 1], [-1, 0], [-1, -1],
  ];

  let cx = startX;
  let cy = startY;
  let dir = 0;

  for (let iter = 0; iter < w * h; iter++) {
    const key = `${cx},${cy}`;
    if (visited.has(key) && contour.length > 2) break;
    visited.add(key);
    contour.push({ x: cx, y: cy });

    // Search for next boundary pixel
    let found = false;
    for (let i = 0; i < 8; i++) {
      const checkDir = (dir + i) % 8;
      const [dx, dy] = directions[checkDir];
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      if (mask[ny * w + nx]) {
        cx = nx;
        cy = ny;
        dir = (checkDir + 6) % 8;
        found = true;
        break;
      }
    }
    if (!found) break;
    if (cx === startX && cy === startY) break;
  }

  return simplifyContour(contour, w, h);
}

/**
 * Douglas-Peucker style simplification — reduce contour to manageable polygon.
 */
function simplifyContour(contour: Point[], w: number, h: number): Point[] {
  if (contour.length < 3) return contour;

  // Target: roughly 1 point per 2% of image dimension, min 8, max 60
  const target = Math.min(60, Math.max(8, Math.floor(Math.min(w, h) / 20)));
  const step = Math.max(1, Math.floor(contour.length / target));
  const simplified: Point[] = [];
  for (let i = 0; i < contour.length; i += step) {
    simplified.push(contour[i]);
  }
  // Always include last point
  if (simplified[simplified.length - 1] !== contour[contour.length - 1]) {
    simplified.push(contour[contour.length - 1]);
  }

  return simplified;
}

/**
 * Full auto-trace pipeline: given image data and a seed point, returns a polygon.
 */
export function autoTrace(
  imageData: ImageData,
  seedX: number,
  seedY: number,
  tolerance = 40,
): Point[] {
  const mask = floodFill(imageData, seedX, seedY, tolerance);
  const contour = extractContour(mask, imageData.width, imageData.height);

  // Filter out tiny regions (noise)
  if (contour.length < 4) return [];

  return contour;
}
