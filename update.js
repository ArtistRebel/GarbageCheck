const fs = require('fs');

let content = fs.readFileSync('artifacts/volume-estimator/src/components/AnnotatorCanvas.tsx', 'utf8');

// Remove autoTrace import
content = content.replace(/import \{ autoTrace \} from "\.\.\/lib\/autotrace";\n/, '');

// Remove Wand2 and Loader2 imports
content = content.replace(/Wand2,\n  Loader2,\n/g, '');
content = content.replace(/Wand2,\n/g, '');
content = content.replace(/Loader2,\n/g, '');

// Update Tool type
content = content.replace(/type Tool = "select" \| "polygon" \| "measure" \| "magic";/, 'type Tool = "select" | "polygon" | "measure";');

// Remove ai variables
content = content.replace(/  const \[aiProcessing, setAiProcessing\] = useState\(false\);\n/g, '');
content = content.replace(/  const \[aiTolerance, setAiTolerance\] = useState\(40\);\n/g, '');
content = content.replace(/  const offscreenRef = useRef<HTMLCanvasElement \| null>\(null\);\n/g, '');

// Remove runAutoTrace definition (it's a large block)
content = content.replace(/  const runAutoTrace = useCallback\(\s*\([\s\S]*?setActiveLayerId,\n    \],\n  \);\n/g, '');

// Remove tool === "magic" from onMouseDown
const magicMouseDown = `      if (tool === "magic") {
        runAutoTrace(pt);
        return;
      }

`;
content = content.replace(magicMouseDown, '');

// Remove magic keyboard shortcut
content = content.replace(/      if \(e\.key === "a"\) setTool\("magic"\);\n/g, '');

// Update tools array
const toolsOld = `  const tools: { id: Tool; icon: typeof MousePointer2; label: string; key: string }[] = [
    { id: "select", icon: MousePointer2, label: "Выбор", key: "V" },
    { id: "polygon", icon: PenTool, label: "Контур", key: "P" },
    { id: "magic", icon: Wand2, label: "ИИ", key: "A" },
    { id: "measure", icon: Ruler, label: "Эталон", key: "M" },
  ];`;
const toolsNew = `  const tools: { id: Tool; icon: typeof MousePointer2; label: string; key: string }[] = [
    { id: "select", icon: MousePointer2, label: "Выбор", key: "V" },
    { id: "polygon", icon: PenTool, label: "Контур", key: "P" },
    { id: "measure", icon: Ruler, label: "Масштаб", key: "M" },
  ];`;
content = content.replace(toolsOld, toolsNew);

// UI Replacements
// Toolbar buttons
content = content.replace(/bg-emerald-500 text-white/g, 'bg-[#2d7d4e] text-white');
content = content.replace(/text-slate-600 hover:bg-slate-100/g, 'text-[#5a7a67] hover:bg-[#e6f0ea]');
content = content.replace(/bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm/g, 'bg-white rounded-xl border border-[#cfe0d6] px-3 py-2 shadow-sm');
content = content.replace(/bg-slate-200 mx-1/g, 'bg-[#cfe0d6] mx-1');

content = content.replace(
  /<Undo2 className="w-4 h-4" \/> Отменить/g,
  '<Undo2 className="w-4 h-4" /> Отменить точку'
);

content = content.replace(
  /<Check className="w-4 h-4" \/> Замкнуть/g,
  '<Check className="w-4 h-4" /> Завершить'
);
content = content.replace(/hover:bg-emerald-600/g, 'hover:bg-[#1a3329]');

content = content.replace(
  /<RotateCcw className="w-4 h-4" \/> Отмена/g,
  '<RotateCcw className="w-4 h-4" /> Сбросить'
);
content = content.replace(/text-slate-500 hover:bg-slate-100/g, 'text-[#5a7a67] hover:bg-[#e6f0ea]');


content = content.replace(
  /<Plus className="w-4 h-4" \/> Новая куча/g,
  '<Plus className="w-4 h-4" /> Добавить кучу'
);
content = content.replace(
  /text-emerald-600 hover:bg-emerald-50 border border-emerald-200/g,
  'border border-[#2d7d4e] text-[#2d7d4e] hover:bg-[#e6f0ea]'
);

content = content.replace(
  /<Trash2 className="w-4 h-4" \/> Сброс/g,
  '<Trash2 className="w-4 h-4" /> Очистить всё'
);

// Canvas
content = content.replace(/bg-slate-800/g, 'bg-[#1a2e22]');

// Status bar
const statusBarRegex = /\{\/\* Status bar \*\/\}\s*<div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">[\s\S]*?\{\/\* AI tolerance slider \*\/\}/;
const newStatusBar = `{/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5a7a67]">
        {tool === "polygon" && (
          <span>
            Кликайте по контуру кучи, добавляя точки. Первая точка замыкает полигон (Enter).
          </span>
        )}
        {tool === "measure" && (
          <span>
            Нарисуйте отрезок вдоль объекта с известными размерами.
          </span>
        )}
        {tool === "select" && (
          <span>
            Выберите кучу. Перетаскивайте точки для корректировки контура.
          </span>
        )}
        {draftPoints.length > 0 && (
          <span className="ml-auto font-medium text-[#1a2e22]">
            {draftPoints.length} точек
          </span>
        )}
      </div>

      {/* AI tolerance slider */}`;
content = content.replace(statusBarRegex, newStatusBar);

// Remove AI Tolerance slider entirely
const aiToleranceRegex = /\{\/\* AI tolerance slider \*\/\}\s*\{tool === "magic" && \([\s\S]*?\}\)/;
content = content.replace(aiToleranceRegex, '');

// Measurement input
const measurementInputRegex = /\{\/\* Measurement input \*\/\}\s*\{measurement && \([\s\S]*?\}\)/;
const newMeasurementInput = `{/* Measurement input */}
      {measurement && (
        <div className="bg-[#e6f0ea] border border-[#cfe0d6] rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
          <Ruler className="w-5 h-5 text-[#2d7d4e] shrink-0" />
          <span className="text-sm font-medium text-[#1a2e22]">
            Длина отрезка:
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
            className="w-24 px-2 py-1 rounded-lg border border-[#cfe0d6] text-sm font-semibold text-[#1a2e22] bg-white focus:outline-none focus:ring-2 focus:ring-[#2d7d4e]/20"
          />
          <span className="text-sm text-[#5a7a67]">м</span>
          <button
            onClick={() => setMeasurement(null)}
            className="ml-auto text-sm text-[#5a7a67] hover:text-red-500 font-medium transition-colors"
          >
            Удалить
          </button>
        </div>
      )}`;
content = content.replace(measurementInputRegex, newMeasurementInput);

// Layer list
content = content.replace(/border-emerald-400 ring-2 ring-emerald-100/g, 'border-[#2d7d4e] ring-2 ring-[#2d7d4e]/20');
content = content.replace(/border-slate-200 hover:border-slate-300/g, 'border-[#cfe0d6] hover:border-[#a8c9b4]');
content = content.replace(/text-slate-800 bg-transparent/g, 'text-[#1a2e22] bg-transparent');
content = content.replace(/text-slate-400 shrink-0/g, 'text-[#5a7a67] shrink-0');
content = content.replace(/тчк/g, 'точек');

content = content.replace(/text-slate-400 hover:text-red-500/g, 'text-[#5a7a67] hover:text-red-500');
content = content.replace(/>\s*Удалить\s*<\/button>/g, ' aria-label="Удалить"><Trash2 className="w-4 h-4" /></button>');

content = content.replace(/Высота, м/g, 'Высота, м');
content = content.replace(/border-slate-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/g, 'border-[#cfe0d6] focus:border-[#2d7d4e] focus:ring-1 focus:ring-[#2d7d4e]');
content = content.replace(/text-slate-500 block/g, 'text-[#5a7a67] block');
content = content.replace(/>\s*Высота кучи\s*<\/label>/g, '>Высота кучи</label>');

fs.writeFileSync('artifacts/volume-estimator/src/components/AnnotatorCanvas.tsx', content);
