import { useRef, useState, useEffect, useCallback } from "react";
import {
  MousePointer2,
  PenTool,
  Ruler,
  Trash2,
  Undo2,
  Check,
  Plus,
  RotateCcw,
  Wand2,
  Loader2,
} from "lucide-react";
import type { Point } from "../lib/geometry";
import {
  pointInPolygon,
  pointToPolygonPerimeterDistance,
} from "../lib/geometry";
import type { FootprintLayer, Measurement } from "../lib/volume";
import { uid } from "../lib/id";
import { autoTrace } from "../lib/autotrace";

type Tool = "select" | "polygon" | "measure" | "magic";

type Props = {
  imageSrc: string;
  layers: FootprintLayer[];
  setLayers: (l: FootprintLayer[]) => void;
  measurement: Measurement | null;
  setMeasurement: (m: Measurement | null) => void;
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
  fillKey: string;
  setFillKey: (k: string) => void;
};

const HIT_RADIUS = 12;
const CLOSE_THRESHOLD = 14;
const LAYER_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function AnnotatorCanvas({
  imageSrc,
  layers,
  setLayers,
  measurement,
  setMeasurement,
  activeLayerId,
  setActiveLayerId,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<Tool>("polygon");
  const [draftPoints, setDraftPoints] = useState<Point[]>([]);
  const [mouse, setMouse] = useState<Point | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [measureDraft, setMeasureDraft] = useState<{
    start: Point;
    end: Point;
  } | null>(null);
  const [hoverLayerId, setHoverLayerId] = useState<string | null>(null);
  const [dragVertex, setDragVertex] = useState<{
    layerId: string;
    index: number;
  } | null>(null);
  const [dragMeasure, setDragMeasure] = useState<0 | 1 | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiTolerance, setAiTolerance] = useState(40);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Compute display size to fit container width
  useEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      const img = imgRef.current;
      if (!container || !img) return;
      const maxW = container.clientWidth;
      const maxH = window.innerHeight * 0.65;
      const ratio = img.naturalWidth / img.naturalHeight;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      setDisplaySize({ w: Math.round(w), h: Math.round(h) });
    };
    if (imgLoaded) compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [imgLoaded]);

  // Scale factor between displayed canvas and natural image coords
  const getScale = useCallback(() => {
    if (!imgNaturalSize.w || !displaySize.w) return 1;
    return imgNaturalSize.w / displaySize.w;
  }, [imgNaturalSize, displaySize]);

  // Convert screen (clientX/Y relative to canvas) to image-natural coords
  const toImageCoords = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const sx = (clientX - rect.left) / rect.width;
      const sy = (clientY - rect.top) / rect.height;
      return {
        x: sx * imgNaturalSize.w,
        y: sy * imgNaturalSize.h,
      };
    },
    [imgNaturalSize],
  );

  // Convert image-natural coords to canvas display coords for drawing
  const toCanvasCoords = useCallback(
    (p: Point): Point => {
      const s = getScale();
      return { x: p.x / s, y: p.y / s };
    },
    [getScale],
  );

  // ---- Drawing ----
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = displaySize.w;
    canvas.height = displaySize.h;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const img = imgRef.current;
    if (img && displaySize.w > 0) {
      ctx.drawImage(img, 0, 0, displaySize.w, displaySize.h);
    }

    // Draw layers
    for (const layer of layers) {
      const isActive = layer.id === activeLayerId;
      const isHover = layer.id === hoverLayerId;
      const color = LAYER_COLORS[layers.indexOf(layer) % LAYER_COLORS.length];
      const pts = layer.polygon.map(toCanvasCoords);
      if (pts.length < 2) continue;

      // Fill
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fillStyle = hexToRgba(color, isActive ? 0.22 : isHover ? 0.15 : 0.1);
      ctx.fill();

      // Stroke
      ctx.strokeStyle = color;
      ctx.lineWidth = isActive ? 2.5 : 1.8;
      ctx.setLineDash(isActive ? [] : [4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertices
      for (let i = 0; i < pts.length; i++) {
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, isActive ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Label
      const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      ctx.fillStyle = hexToRgba("#000", 0.6);
      const labelText = layer.label;
      ctx.font = "bold 12px system-ui, sans-serif";
      const tw = ctx.measureText(labelText).width;
      ctx.fillRect(cx - tw / 2 - 6, cy - 10, tw + 12, 18);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText, cx, cy);
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
    }

    // Draw measurement
    if (measurement) {
      const p1 = toCanvasCoords(measurement.p1);
      const p2 = toCanvasCoords(measurement.p2);
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Endpoints
      for (const p of [p1, p2]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#06b6d4";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const txt = `${measurement.meters} м`;
      ctx.font = "bold 12px system-ui, sans-serif";
      const tw = ctx.measureText(txt).width;
      ctx.fillStyle = "#06b6d4";
      ctx.fillRect(mx - tw / 2 - 6, my - 22, tw + 12, 18);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(txt, mx, my - 13);
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
    }

    // Draw measure draft
    if (measureDraft) {
      const p1 = toCanvasCoords(measureDraft.start);
      const p2 = toCanvasCoords(measureDraft.end);
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#06b6d4";
      ctx.fill();
    }

    // Draw draft polygon
    if (draftPoints.length > 0 && tool === "polygon") {
      const color = LAYER_COLORS[layers.length % LAYER_COLORS.length];
      const pts = draftPoints.map(toCanvasCoords);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (mouse) {
        const m = toCanvasCoords(mouse);
        ctx.lineTo(m.x, m.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertices
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Close indicator
      if (draftPoints.length >= 3 && mouse) {
        const first = toCanvasCoords(draftPoints[0]);
        const m = toCanvasCoords(mouse);
        const d = Math.hypot(first.x - m.x, first.y - m.y);
        if (d < CLOSE_THRESHOLD) {
          ctx.beginPath();
          ctx.arc(first.x, first.y, 9, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(first.x, first.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
    }

    // Draw mouse crosshair for measure tool
    if (tool === "measure" && mouse && !measureDraft) {
      const m = toCanvasCoords(mouse);
      ctx.strokeStyle = "rgba(6,182,212,0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, m.y);
      ctx.lineTo(canvas.width, m.y);
      ctx.moveTo(m.x, 0);
      ctx.lineTo(m.x, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [
    layers,
    measurement,
    draftPoints,
    mouse,
    tool,
    measureDraft,
    activeLayerId,
    hoverLayerId,
    displaySize,
    toCanvasCoords,
    imgLoaded,
  ]);

  // ---- Mouse handlers ----
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pt = toImageCoords(e.clientX, e.clientY);

      if (tool === "polygon") {
        // Check if clicking near first point to close
        if (draftPoints.length >= 3) {
          const firstCanvas = toCanvasCoords(draftPoints[0]);
          const mCanvas = toCanvasCoords(pt);
          const d = Math.hypot(
            firstCanvas.x - mCanvas.x,
            firstCanvas.y - mCanvas.y,
          );
          if (d < CLOSE_THRESHOLD) {
            finishPolygon();
            return;
          }
        }
        setDraftPoints([...draftPoints, pt]);
        return;
      }

      if (tool === "magic") {
        runAutoTrace(pt);
        return;
      }

      if (tool === "measure") {
        if (measurement) {
          // Check if clicking on an endpoint to drag
          const p1c = toCanvasCoords(measurement.p1);
          const p2c = toCanvasCoords(measurement.p2);
          const mc = toCanvasCoords(pt);
          const d1 = Math.hypot(p1c.x - mc.x, p1c.y - mc.y);
          const d2 = Math.hypot(p2c.x - mc.x, p2c.y - mc.y);
          if (d1 < HIT_RADIUS) {
            setDragMeasure(0);
            return;
          }
          if (d2 < HIT_RADIUS) {
            setDragMeasure(1);
            return;
          }
        }
        setMeasureDraft({ start: pt, end: pt });
        return;
      }

      if (tool === "select") {
        // Check vertex hit
        for (const layer of layers) {
          for (let i = 0; i < layer.polygon.length; i++) {
            const vc = toCanvasCoords(layer.polygon[i]);
            const mc = toCanvasCoords(pt);
            if (Math.hypot(vc.x - mc.x, vc.y - mc.y) < HIT_RADIUS) {
              setDragVertex({ layerId: layer.id, index: i });
              setActiveLayerId(layer.id);
              return;
            }
          }
        }
        // Check polygon hit
        for (let i = layers.length - 1; i >= 0; i--) {
          const layer = layers[i];
          if (pointInPolygon(pt, layer.polygon)) {
            setActiveLayerId(layer.id);
            return;
          }
        }
        // Check measurement endpoint
        if (measurement) {
          const p1c = toCanvasCoords(measurement.p1);
          const p2c = toCanvasCoords(measurement.p2);
          const mc = toCanvasCoords(pt);
          if (Math.hypot(p1c.x - mc.x, p1c.y - mc.y) < HIT_RADIUS) {
            setDragMeasure(0);
            return;
          }
          if (Math.hypot(p2c.x - mc.x, p2c.y - mc.y) < HIT_RADIUS) {
            setDragMeasure(1);
            return;
          }
        }
        setActiveLayerId(null);
      }
    },
    [
      tool,
      draftPoints,
      measurement,
      layers,
      toImageCoords,
      toCanvasCoords,
      setActiveLayerId,
    ],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pt = toImageCoords(e.clientX, e.clientY);
      setMouse(pt);

      if (dragVertex) {
        const newLayers = layers.map((l) => {
          if (l.id !== dragVertex.layerId) return l;
          const poly = [...l.polygon];
          poly[dragVertex.index] = pt;
          return { ...l, polygon: poly };
        });
        setLayers(newLayers);
        return;
      }

      if (dragMeasure !== null && measurement) {
        const newM = { ...measurement };
        if (dragMeasure === 0) newM.p1 = pt;
        else newM.p2 = pt;
        setMeasurement(newM);
        return;
      }

      if (measureDraft) {
        setMeasureDraft({ ...measureDraft, end: pt });
        return;
      }

      // Hover detection for select tool
      if (tool === "select") {
        let foundId: string | null = null;
        for (let i = layers.length - 1; i >= 0; i--) {
          const layer = layers[i];
          const perimDist = pointToPolygonPerimeterDistance(
            pt,
            layer.polygon,
          );
          const inside = pointInPolygon(pt, layer.polygon);
          if (inside || perimDist < 6) {
            foundId = layer.id;
            break;
          }
        }
        setHoverLayerId(foundId);
      }
    },
    [
      dragVertex,
      dragMeasure,
      measurement,
      measureDraft,
      tool,
      layers,
      toImageCoords,
      setLayers,
      setMeasurement,
    ],
  );

  const onMouseUp = useCallback(() => {
    if (measureDraft) {
      const d = Math.hypot(
        measureDraft.start.x - measureDraft.end.x,
        measureDraft.start.y - measureDraft.end.y,
      );
      if (d > 5) {
        setMeasurement({
          id: uid(),
          p1: measureDraft.start,
          p2: measureDraft.end,
          meters: 1.0,
        });
      }
      setMeasureDraft(null);
    }
    setDragVertex(null);
    setDragMeasure(null);
  }, [measureDraft, setMeasurement]);

  const finishPolygon = useCallback(() => {
    if (draftPoints.length < 3) return;
    const newLayer: FootprintLayer = {
      id: uid(),
      polygon: [...draftPoints],
      heightPx: 0,
      heightM: 0,
      label: `Куча ${layers.length + 1}`,
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
    setDraftPoints([]);
    setTool("select");
  }, [draftPoints, layers, setLayers, setActiveLayerId]);

  const undoLastPoint = useCallback(() => {
    setDraftPoints(draftPoints.slice(0, -1));
  }, [draftPoints]);

  const cancelDraft = useCallback(() => {
    setDraftPoints([]);
    setMeasureDraft(null);
  }, []);

  const deleteLayer = useCallback(
    (id: string) => {
      setLayers(layers.filter((l) => l.id !== id));
      if (activeLayerId === id) setActiveLayerId(null);
    },
    [layers, setLayers, activeLayerId, setActiveLayerId],
  );

  const startNewPile = useCallback(() => {
    setTool("polygon");
    setDraftPoints([]);
    setActiveLayerId(null);
  }, [setActiveLayerId]);

  const resetAll = useCallback(() => {
    setLayers([]);
    setMeasurement(null);
    setActiveLayerId(null);
    setDraftPoints([]);
    setTool("polygon");
  }, [setLayers, setMeasurement, setActiveLayerId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelDraft();
      }
      if (e.key === "Enter" && draftPoints.length >= 3) {
        finishPolygon();
      }
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undoLastPoint();
      }
      if (e.key === "v") setTool("select");
      if (e.key === "p") setTool("polygon");
      if (e.key === "a") setTool("magic");
      if (e.key === "m") setTool("measure");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [draftPoints, cancelDraft, finishPolygon, undoLastPoint]);

  const runAutoTrace = useCallback(
    (seedPt: Point) => {
      const img = imgRef.current;
      if (!img || !imgNaturalSize.w) return;
      setAiProcessing(true);

      // Defer to next frame so the loading spinner can render
      requestAnimationFrame(() => {
        try {
          // Draw image to offscreen canvas at natural resolution for pixel analysis
          if (!offscreenRef.current) {
            offscreenRef.current = document.createElement("canvas");
          }
          const oc = offscreenRef.current;
          oc.width = imgNaturalSize.w;
          oc.height = imgNaturalSize.h;
          const octx = oc.getContext("2d", { willReadFrequently: true });
          if (!octx) return;
          octx.drawImage(img, 0, 0);
          const imageData = octx.getImageData(
            0,
            0,
            imgNaturalSize.w,
            imgNaturalSize.h,
          );

          const polygon = autoTrace(
            imageData,
            Math.round(seedPt.x),
            Math.round(seedPt.y),
            aiTolerance,
          );

          if (polygon.length >= 4) {
            const newLayer: FootprintLayer = {
              id: uid(),
              polygon,
              heightPx: 0,
              heightM: 0,
              label: `Куча ${layers.length + 1}`,
            };
            setLayers([...layers, newLayer]);
            setActiveLayerId(newLayer.id);
            setTool("select");
          } else {
            // Region too small — try with higher tolerance
            const polygon2 = autoTrace(
              imageData,
              Math.round(seedPt.x),
              Math.round(seedPt.y),
              aiTolerance + 20,
            );
            if (polygon2.length >= 4) {
              const newLayer: FootprintLayer = {
                id: uid(),
                polygon: polygon2,
                heightPx: 0,
                heightM: 0,
                label: `Куча ${layers.length + 1}`,
              };
              setLayers([...layers, newLayer]);
              setActiveLayerId(newLayer.id);
              setTool("select");
            }
          }
        } catch (err) {
          console.error("Auto-trace failed:", err);
        } finally {
          setAiProcessing(false);
        }
      });
    },
    [
      imgNaturalSize,
      aiTolerance,
      layers,
      setLayers,
      setActiveLayerId,
    ],
  );

  const tools: { id: Tool; icon: typeof MousePointer2; label: string; key: string }[] = [
    { id: "select", icon: MousePointer2, label: "Выбор", key: "V" },
    { id: "polygon", icon: PenTool, label: "Контур", key: "P" },
    { id: "magic", icon: Wand2, label: "ИИ", key: "A" },
    { id: "measure", icon: Ruler, label: "Эталон", key: "M" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
        <div className="flex gap-1">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tool === t.id
                  ? "bg-emerald-500 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <kbd className="text-[10px] opacity-60 ml-0.5">{t.key}</kbd>
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-slate-200 mx-1" />
        {tool === "polygon" && draftPoints.length > 0 && (
          <>
            <button
              onClick={undoLastPoint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <Undo2 className="w-4 h-4" /> Отменить
            </button>
            {draftPoints.length >= 3 && (
              <button
                onClick={finishPolygon}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Check className="w-4 h-4" /> Замкнуть
              </button>
            )}
            <button
              onClick={cancelDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              <RotateCcw className="w-4 h-4" /> Отмена
            </button>
          </>
        )}
        <div className="ml-auto flex gap-1">
          <button
            onClick={startNewPile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
          >
            <Plus className="w-4 h-4" /> Новая куча
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Сброс
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ minHeight: 200 }}
      >
        {imgLoaded && displaySize.w > 0 ? (
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => {
              setMouse(null);
              setHoverLayerId(null);
              onMouseUp();
            }}
            className="cursor-crosshair"
            style={{ display: "block", maxWidth: "100%" }}
          />
        ) : (
          <div className="py-20 text-slate-400 text-sm">Загрузка изображения…</div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {tool === "polygon" && (
          <span>
            Нажмите, чтобы добавить точки вокруг контура кучи. Нажмите на первую
            точку (или Enter) для замыкания.
          </span>
        )}
        {tool === "measure" && (
          <span>
            Нажмите и протяните через объект известного размера на фото
            (человек, машина, дверь и т.д.), затем укажите его реальную длину ниже.
          </span>
        )}
        {tool === "select" && (
          <span>
            Нажмите на кучу для выбора. Перетаскивайте точки для корректировки контура.
          </span>
        )}
        {tool === "magic" && (
          <span>
            Нажмите на кучу — ИИ автоматически обведёт её контур по цвету и текстуре.
            Регулируйте чувствительность ниже.
          </span>
        )}
        {draftPoints.length > 0 && (
          <span className="ml-auto font-medium text-slate-600">
            {draftPoints.length} точек
          </span>
        )}
      </div>

      {/* AI tolerance slider */}
      {tool === "magic" && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <Wand2 className="w-5 h-5 text-violet-600 shrink-0" />
          <span className="text-sm font-medium text-violet-900">
            Чувствительность:
          </span>
          <input
            type="range"
            min={15}
            max={80}
            value={aiTolerance}
            onChange={(e) => setAiTolerance(parseInt(e.target.value))}
            className="flex-1 min-w-[100px] accent-violet-500"
          />
          <span className="text-sm text-violet-700 font-mono w-8 text-right">
            {aiTolerance}
          </span>
          {aiProcessing && (
            <span className="flex items-center gap-1.5 text-sm text-violet-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Обработка…
            </span>
          )}
        </div>
      )}

      {/* Measurement input */}
      {measurement && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <Ruler className="w-5 h-5 text-cyan-600 shrink-0" />
          <span className="text-sm font-medium text-cyan-900">
            Эталонная длина:
          </span>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={measurement.meters}
            onChange={(e) =>
              setMeasurement({
                ...measurement,
                meters: Math.max(0.01, parseFloat(e.target.value) || 0),
              })
            }
            className="w-24 px-2 py-1 rounded-lg border border-cyan-300 text-sm font-semibold text-cyan-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <span className="text-sm text-cyan-700">метров</span>
          <button
            onClick={() => setMeasurement(null)}
            className="ml-auto text-sm text-cyan-600 hover:text-cyan-800 font-medium"
          >
            Удалить
          </button>
        </div>
      )}

      {/* Layer list */}
      {layers.length > 0 && (
        <div className="space-y-2">
          {layers.map((layer, i) => {
            const color = LAYER_COLORS[i % LAYER_COLORS.length];
            const isActive = layer.id === activeLayerId;
            return (
              <div
                key={layer.id}
                className={`bg-white rounded-xl border px-4 py-3 transition-all ${
                  isActive
                    ? "border-emerald-400 ring-2 ring-emerald-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <input
                    type="text"
                    value={layer.label}
                    onChange={(e) => {
                      setLayers(
                        layers.map((l) =>
                          l.id === layer.id
                            ? { ...l, label: e.target.value }
                            : l,
                        ),
                      );
                    }}
                    className="font-medium text-sm text-slate-800 bg-transparent border-none focus:outline-none focus:underline flex-1 min-w-0"
                  />
                  <span className="text-xs text-slate-400 shrink-0">
                    {layer.polygon.length} тчк
                  </span>
                  <button
                    onClick={() => deleteLayer(layer.id)}
                    className="text-slate-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">
                        Высота кучи (в метрах)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={layer.heightM || ""}
                        placeholder="напр. 1.5"
                        onChange={(e) => {
                          const v = parseFloat(e.target.value) || 0;
                          setLayers(
                            layers.map((l) =>
                              l.id === layer.id
                                ? { ...l, heightM: v, heightPx: 0 }
                                : l,
                            ),
                          );
                        }}
                        className="w-32 px-2 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Укажите высоту кучи в самой высокой точке. Это главный
                        фактор объёма — введите вашу лучшую оценку.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
