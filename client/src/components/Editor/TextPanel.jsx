import { Type, Sparkles, Layout } from "lucide-react";
import { TextPresets } from "./TextPresets";
import { useSlideStore } from "../../store/useSlideStore";

/**
 * Text Panel - Canva-style text sidebar
 */
export const TextPanel = () => {
  const { addElement } = useSlideStore();

  const handleAddTextBox = () => {
    addElement("text", {
      text: "Click to edit",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
      x: 400,
      y: 250,
      width: 200,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      {/* Add Text Box Button */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <button
          onClick={handleAddTextBox}
          className="cursor-pointer w-full bg-gray-900 dark:bg-purple-600 hover:bg-black dark:hover:bg-purple-500 text-white rounded-2xl py-4 px-4 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
        >
          <Type className="w-5 h-5" />
          Add a text box
        </button>
      </div>

      {/* Magic Write Button (AI Feature) */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <button className="cursor-pointer w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 active:scale-95 group">
          <Sparkles className="w-4 h-4 group-hover:animate-spin" />
          Magic Write
        </button>
      </div>

      {/* Text Presets Section */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">
          Default text styles
        </h3>

        {/* Container for Presets - Giả định TextPresets render ra các mẫu tiêu đề */}
        <div className="space-y-3">
          <TextPresets />
        </div>
      </div>

      {/* Apps / Ecosystem Section */}
      <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">
          Ecosystem
        </h3>
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 p-6 text-center">
          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-2">
            <Layout className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-600 leading-tight">
            Text effects & Apps <br />
            coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
