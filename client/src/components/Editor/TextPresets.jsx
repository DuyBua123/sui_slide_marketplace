import { Type, Sparkles, Hash } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";
import { textPresets } from "./textPresetsConfig";

/**
 * Text Presets - Preset text styles
 */
export const TextPresets = () => {
  const { addElement } = useSlideStore();

  const handleAddPreset = (presetKey) => {
    const preset = textPresets[presetKey];
    addElement("text", {
      ...preset,
      x: 100,
      y: 100,
    });
  };

  return (
    <div className="space-y-4">
      {/* Headings */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
          Add a heading
        </h4>
        <div className="space-y-2">
          {[
            { id: "heading1", size: "text-2xl", label: "Add a heading" },
            { id: "heading2", size: "text-xl", label: "Add a heading" },
            { id: "heading3", size: "text-lg", label: "Add a heading" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handleAddPreset(p.id)}
              className="cursor-pointer w-full text-left p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
            >
              <span
                className={`${p.size} font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400`}
              >
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Subheadings */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
          Add a subheading
        </h4>
        <div className="space-y-2">
          {[
            { id: "subheading1", size: "text-base" },
            { id: "subheading2", size: "text-sm" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handleAddPreset(p.id)}
              className="cursor-pointer w-full text-left p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
            >
              <span
                className={`${p.size} font-medium text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400`}
              >
                Add a subheading
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Body Text */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
          Add a bit of body text
        </h4>
        <button
          onClick={() => handleAddPreset("body")}
          className="cursor-pointer w-full text-left p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
            Add a bit of body text
          </span>
        </button>
      </div>

      {/* Dynamic Text */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
          Dynamic text
        </h4>
        <button
          onClick={() => {
            addElement("text", {
              text: "Page 1",
              fontSize: 12,
              fontFamily: "Arial",
              fill: "#9ca3af",
              x: 870,
              y: 510,
            });
          }}
          className="cursor-pointer w-full flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
        >
          <div className="w-8 h-8 bg-purple-600 text-white rounded flex items-center justify-center">
            <Hash className="w-4 h-4" />
          </div>
          <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
            Page numbers
          </span>
        </button>
      </div>
    </div>
  );
};

export default TextPresets;
