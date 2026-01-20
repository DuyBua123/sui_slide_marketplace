import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
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
];

/**
 * Text formatting toolbar - shown when text is selected
 */
export const TextToolbar = ({ element }) => {
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

  const adjustFontSize = (delta) => {
    const currentSize = element.fontSize || 24;
    const newSize = Math.max(8, Math.min(200, currentSize + delta));
    handleChange("fontSize", newSize);
  };

  return (
    <div className="flex items-center gap-1 bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
      {/* Font Family */}
      <select
        value={element.fontFamily || "Arial"}
        onChange={(e) => handleChange("fontFamily", e.target.value)}
        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 max-w-[120px] transition-colors"
      >
        {fontFamilies.map((font) => (
          <option
            key={font}
            value={font}
            style={{ fontFamily: font }}
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            {font}
          </option>
        ))}
      </select>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Font Size */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => adjustFontSize(-2)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          value={Math.round(element.fontSize || 24)}
          onChange={(e) => handleChange("fontSize", parseInt(e.target.value) || 24)}
          className="w-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-sm text-center text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={() => adjustFontSize(2)}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Bold */}
      <button
        onClick={toggleBold}
        className={`p-1.5 rounded transition-colors ${
          element.fontWeight === "bold"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      {/* Italic */}
      <button
        onClick={toggleItalic}
        className={`p-1.5 rounded transition-colors ${
          element.fontStyle === "italic"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Text Color */}
      <div className="relative flex items-center px-1">
        <input
          type="color"
          value={element.fill || "#ffffff"}
          onChange={(e) => handleChange("fill", e.target.value)}
          className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-white/20 bg-transparent"
          title="Text Color"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Alignment */}
      <div className="flex items-center gap-0.5">
        {[
          { id: "left", icon: AlignLeft, title: "Align Left" },
          { id: "center", icon: AlignCenter, title: "Align Center" },
          { id: "right", icon: AlignRight, title: "Align Right" },
        ].map((align) => {
          const Icon = align.icon;
          const isActive = (element.align || "left") === align.id;
          return (
            <button
              key={align.id}
              onClick={() => handleChange("align", align.id)}
              className={`p-1.5 rounded transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
              title={align.title}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TextToolbar;
