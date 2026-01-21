import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  ChevronDown,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";

const fontFamilies = [
  "Arial",
  "Arial Black",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Impact",
  "Comic Sans MS",
  "Helvetica",
  "Palatino",
];

const textEffects = [
  { id: "none", label: "None" },
  { id: "shadow", label: "Shadow" },
  { id: "outline", label: "Outline" },
  { id: "lift", label: "Lift" },
];

/**
 * Enhanced Text Toolbar - Canva-style with all text controls
 */
export const TextToolbar = ({ element, onAnimateClick }) => {
  const updateElement = useSlideStore((state) => state.updateElement);

  if (!element || element.type !== "text") return null;

  const handleChange = (key, value) => {
    updateElement(element.id, { [key]: value });
  };

  const toggleBold = () => {
    handleChange("fontWeight", element.fontWeight === "bold" ? "normal" : "bold");
  };

  const toggleItalic = () => {
    handleChange("fontStyle", element.fontStyle === "italic" ? "normal" : "italic");
  };

  const toggleUnderline = () => {
    handleChange(
      "textDecoration",
      element.textDecoration === "underline" ? "none" : "underline",
    );
  };

  const adjustFontSize = (delta) => {
    const currentSize = element.fontSize || 24;
    const newSize = Math.max(8, Math.min(200, currentSize + delta));
    handleChange("fontSize", newSize);
  };

  const handleEffectChange = (effectId) => {
    if (effectId === "none") {
      handleChange("shadowEnabled", false);
      handleChange("strokeEnabled", false);
    } else if (effectId === "shadow") {
      handleChange("shadowEnabled", true);
      handleChange("shadowColor", "#000000");
      handleChange("shadowBlur", 10);
      handleChange("shadowOffsetX", 5);
      handleChange("shadowOffsetY", 5);
      handleChange("shadowOpacity", 0.5);
    } else if (effectId === "outline") {
      handleChange("strokeEnabled", true);
      handleChange("stroke", "#000000");
      handleChange("strokeWidth", 2);
    } else if (effectId === "lift") {
      handleChange("shadowEnabled", true);
      handleChange("shadowColor", "#000000");
      handleChange("shadowBlur", 20);
      handleChange("shadowOffsetX", 0);
      handleChange("shadowOffsetY", 8);
      handleChange("shadowOpacity", 0.3);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none">
      {/* Font Family */}
      <select
        value={element.fontFamily || "Arial"}
        onChange={(e) => handleChange("fontFamily", e.target.value)}
        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 min-w-[110px] cursor-pointer"
      >
        {fontFamilies.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Font Size */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => adjustFontSize(-2)}
          className="cursor-pointer p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
          title="Decrease font size"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          value={Math.round(element.fontSize || 24)}
          onChange={(e) => handleChange("fontSize", parseInt(e.target.value) || 24)}
          className="w-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs text-center text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={() => adjustFontSize(2)}
          className="cursor-pointer p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
          title="Increase font size"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Text Color */}
      <div className="relative flex items-center px-1">
        <input
          type="color"
          value={element.fill || "#000000"}
          onChange={(e) => handleChange("fill", e.target.value)}
          className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-white/20 bg-transparent"
          title="Text Color"
        />
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Bold, Italic, Underline */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={toggleBold}
          className={`cursor-pointer p-1.5 rounded transition-colors ${
            element.fontWeight === "bold"
              ? "bg-purple-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleItalic}
          className={`cursor-pointer p-1.5 rounded transition-colors ${
            element.fontStyle === "italic"
              ? "bg-purple-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleUnderline}
          className={`cursor-pointer p-1.5 rounded transition-colors ${
            element.textDecoration === "underline"
              ? "bg-purple-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
          title="Underline"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Alignment */}
      <div className="flex items-center gap-0.5">
        {["left", "center", "right"].map((align) => {
          const Icon =
            align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
          const isActive = (element.align || "left") === align;
          return (
            <button
              key={align}
              onClick={() => handleChange("align", align)}
              className={`cursor-pointer p-1.5 rounded transition-colors ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
              title={`Align ${align.charAt(0).toUpperCase() + align.slice(1)}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Spacing Controls */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Letter
          </span>
          <input
            type="range"
            min="-5"
            max="20"
            value={element.letterSpacing || 0}
            onChange={(e) => handleChange("letterSpacing", parseInt(e.target.value))}
            className="w-12 h-1 accent-purple-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Line
          </span>
          <input
            type="range"
            min="0.8"
            max="2.5"
            step="0.1"
            value={element.lineHeight || 1.2}
            onChange={(e) => handleChange("lineHeight", parseFloat(e.target.value))}
            className="w-12 h-1 accent-purple-600"
          />
        </div>
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Effects */}
      <div className="relative group">
        <select
          onChange={(e) => handleEffectChange(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded pl-2 pr-6 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
        >
          {textEffects.map((effect) => (
            <option key={effect.id} value={effect.id}>
              {effect.label}
            </option>
          ))}
        </select>
        <Sparkles className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-purple-500" />
      </div>

      {onAnimateClick && (
        <>
          <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
          <button
            onClick={onAnimateClick}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-tight">Animate</span>
          </button>
        </>
      )}

      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Opacity */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          Opacity
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={element.opacity ?? 1}
          onChange={(e) => handleChange("opacity", parseFloat(e.target.value))}
          className="w-12 h-1 accent-purple-600"
        />
        <span className="text-[10px] font-bold text-gray-500 w-6 text-right">
          {Math.round((element.opacity ?? 1) * 100)}
        </span>
      </div>
    </div>
  );
};

export default TextToolbar;
