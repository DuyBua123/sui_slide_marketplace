import { useRef } from "react";
import { Upload, FlipHorizontal, FlipVertical, Wand2 } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";
import { uploadToPinata } from "../../utils/pinata";

/**
 * Image toolbar - shown when image is selected
 */
export const ImageToolbar = ({ element, onAnimateClick }) => {
  const fileInputRef = useRef(null);
  const updateElement = useSlideStore((state) => state.updateElement);

  if (!element || element.type !== "image") return null;

  const handleChange = (key, value) => {
    updateElement(element.id, { [key]: value });
  };

  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadToPinata(file, file.name);
      handleChange("src", result.url);
    } catch (error) {
      // Fallback to local
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange("src", event.target?.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const toggleFlipX = () => {
    handleChange("flipX", !element.flipX);
  };

  const toggleFlipY = () => {
    handleChange("flipY", !element.flipY);
  };

  return (
    <div className="flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-1.5 border border-gray-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300">
      {/* Replace Image Action */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/25 group"
      >
        <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        Replace
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplace}
        className="hidden"
      />

      {/* Vertical Divider */}
      <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-1.5" />

      {/* Transform Group */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleFlipX}
          className={`cursor-pointer p-2 rounded-xl transition-all duration-200 ${
            element.flipX
              ? "bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white shadow-inner"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
          title="Flip Horizontal"
        >
          <FlipHorizontal className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={toggleFlipY}
          className={`cursor-pointer p-2 rounded-xl transition-all duration-200 ${
            element.flipY
              ? "bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white shadow-inner"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
          title="Flip Vertical"
        >
          <FlipVertical className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Vertical Divider */}
      <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-1.5" />

      {/* Animation Trigger */}
      {onAnimateClick && (
        <>
          <button
            onClick={onAnimateClick}
            className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
          >
            <Wand2 className="w-4 h-4 text-purple-500 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold">Animate</span>
          </button>
          <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-1.5" />
        </>
      )}

      {/* Opacity Control Slider */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex flex-col -space-y-0.5">
          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
            Opacity
          </span>
          <span className="text-[11px] font-mono font-black text-blue-600 dark:text-blue-400">
            {Math.round((element.opacity ?? 1) * 100)}%
          </span>
        </div>

        <div className="relative flex items-center bg-gray-100 dark:bg-white/5 px-3 py-2.5 rounded-xl border border-gray-200/50 dark:border-white/5 shadow-inner">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={element.opacity ?? 1}
            onChange={(e) => handleChange("opacity", parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageToolbar;
