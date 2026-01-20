import { Palette, Film } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";

const backgroundColors = [
  "#1a1a2e",
  "#0f172a",
  "#18181b",
  "#1e1b4b",
  "#14532d",
  "#7f1d1d",
  "#78350f",
  "#ffffff",
];

const transitions = [
  { id: "none", label: "None" },
  { id: "fade", label: "Fade" },
  { id: "pushLeft", label: "Push Left" },
  { id: "pushRight", label: "Push Right" },
  { id: "scale", label: "Scale" },
];

/**
 * Slide toolbar - shown when nothing is selected
 */
export const SlideToolbar = () => {
  const { slides, currentSlideIndex, setSlideBackground, setSlideTransition } =
    useSlideStore();

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
      {/* Background Color */}
      <div className="flex items-center gap-2 px-2">
        <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Background
        </span>
        <div className="flex items-center gap-1">
          {backgroundColors.map((color) => (
            <button
              key={color}
              onClick={() => setSlideBackground(color)}
              className={`w-6 h-6 rounded border-2 transition-all ${
                currentSlide?.background === color
                  ? "border-blue-500 scale-110 shadow-sm"
                  : "border-gray-100 dark:border-transparent hover:border-blue-300 dark:hover:border-white/30"
              }`}
              style={{ background: color }}
            />
          ))}
          <input
            type="color"
            value={currentSlide?.background || "#1a1a2e"}
            onChange={(e) => setSlideBackground(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
            title="Custom Color"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Transition */}
      <div className="flex items-center gap-2 px-2">
        <Film className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Transition
        </span>
        <select
          value={currentSlide?.transition || "fade"}
          onChange={(e) => setSlideTransition(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          {transitions.map((t) => (
            <option
              key={t.id}
              value={t.id}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SlideToolbar;
