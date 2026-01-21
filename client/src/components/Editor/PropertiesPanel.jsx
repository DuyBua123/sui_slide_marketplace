import { useSlideStore } from "../../store/useSlideStore";
import {
  Palette,
  Move,
  RotateCw,
  Maximize2,
  Layers,
  Copy,
  Trash2,
  Type,
  ArrowUpCircle,
  ArrowDownCircle,
  Film,
  Sparkles,
} from "lucide-react";

const animations = [
  { id: null, label: "None" },
  { id: "pulse", label: "Pulse" },
  { id: "spin", label: "Spin" },
  { id: "bounce", label: "Bounce" },
  { id: "wobble", label: "Wobble" },
];

const transitions = [
  { id: "none", label: "None" },
  { id: "fade", label: "Fade" },
  { id: "pushLeft", label: "Push Left" },
  { id: "pushRight", label: "Push Right" },
  { id: "scale", label: "Scale" },
];

/**
 * Properties Panel for selected element and slide settings
 */
export const PropertiesPanel = () => {
  const {
    slides,
    currentSlideIndex,
    selectedId,
    selectedIds,
    updateElement,
    deleteSelectedElements,
    copySelected,
    bringToFront,
    sendToBack,
    setSlideBackground,
    setSlideTransition,
  } = useSlideStore();

  const currentSlide = slides[currentSlideIndex];
  const elements = currentSlide?.elements || [];
  const selectedElement = elements.find((el) => el.id === selectedId);

  const handleChange = (key, value) => {
    if (selectedId) {
      updateElement(selectedId, { [key]: value });
    }
  };

  return (
    <div className="space-y-4 transition-colors">
      {/* Slide Settings */}
      <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4 shadow-sm transition-all">
        <h3 className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" />
          Slide Settings
        </h3>

        {/* Background Color */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase block mb-2">
            Background
          </label>
          <div className="flex gap-2 flex-wrap">
            {["#1a1a2e", "#0f172a", "#1e1b4b", "#14532d", "#7f1d1d", "#ffffff"].map(
              (color) => (
                <button
                  key={color}
                  onClick={() => setSlideBackground(color)}
                  className={`cursor-pointer w-7 h-7 rounded-md border-2 transition-all ${
                    currentSlide?.background === color
                      ? "border-blue-500 scale-110 shadow-md shadow-blue-500/20"
                      : "border-gray-100 dark:border-transparent"
                  }`}
                  style={{ background: color }}
                />
              ),
            )}
            <div className="relative w-7 h-7">
              <input
                type="color"
                value={currentSlide?.background || "#1a1a2e"}
                onChange={(e) => setSlideBackground(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full h-full rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">
                +
              </div>
            </div>
          </div>
        </div>

        {/* Transition */}
        <div>
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2 flex items-center gap-1">
            <Film className="w-3 h-3" />
            Transition
          </label>
          <div className="relative">
            <select
              value={currentSlide?.transition || "fade"}
              onChange={(e) => setSlideTransition(e.target.value)}
              className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              {transitions.map((t) => (
                <option key={t.id} value={t.id} className="bg-white dark:bg-gray-900">
                  {t.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Element Properties */}
      {selectedElement ? (
        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4 shadow-sm transition-all">
          <h3 className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4">
            {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}{" "}
            Properties
          </h3>

          {/* Position Grids */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 flex items-center gap-1 mb-1.5 uppercase">
                <Move className="w-3 h-3" /> X
              </label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handleChange("x", parseFloat(e.target.value))}
                className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 flex items-center gap-1 mb-1.5 uppercase">
                <Move className="w-3 h-3" /> Y
              </label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handleChange("y", parseFloat(e.target.value))}
                className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Size Grids */}
          {(selectedElement.type === "rect" ||
            selectedElement.type === "text" ||
            selectedElement.type === "image") && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 flex items-center gap-1 mb-1.5 uppercase">
                  <Maximize2 className="w-3 h-3" /> Width
                </label>
                <input
                  type="number"
                  value={Math.round(selectedElement.width || 0)}
                  onChange={(e) => handleChange("width", parseFloat(e.target.value))}
                  className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 flex items-center gap-1 mb-1.5 uppercase">
                  <Maximize2 className="w-3 h-3" /> Height
                </label>
                <input
                  type="number"
                  value={Math.round(selectedElement.height || 0)}
                  onChange={(e) => handleChange("height", parseFloat(e.target.value))}
                  className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Rotation Slider */}
          <div className="mb-4">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 flex items-center gap-1 mb-1.5 uppercase">
              <RotateCw className="w-3 h-3" /> Rotation
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="360"
                value={selectedElement.rotation || 0}
                onChange={(e) => handleChange("rotation", parseFloat(e.target.value))}
                className="flex-1 accent-blue-600 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 w-10 text-right">
                {Math.round(selectedElement.rotation || 0)}°
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={copySelected}
              className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 border border-blue-100 dark:border-blue-500/30 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 transition-all active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            <button
              onClick={deleteSelectedElements}
              className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-600/20 hover:bg-red-100 dark:hover:bg-red-600/30 border border-red-100 dark:border-red-500/30 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-8 text-center transition-all shadow-sm">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            Select an element on canvas to <br /> edit its properties
          </p>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4 transition-all shadow-sm">
        <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-500 mb-3 uppercase tracking-widest">
          Shortcuts
        </h4>
        <div className="space-y-2">
          {[
            { label: "Undo", key: "Ctrl+Z" },
            { label: "Copy", key: "Ctrl+C" },
            { label: "Paste", key: "Ctrl+V" },
            { label: "Delete", key: "Del" },
          ].map((s) => (
            <div key={s.label} className="flex justify-between items-center text-[11px]">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{s.label}</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-500">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
