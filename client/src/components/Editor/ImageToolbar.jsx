import { useRef } from "react";
import { Upload, FlipHorizontal, FlipVertical } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";
import { uploadToPinata } from "../../utils/pinata";

/**
 * Image toolbar - shown when image is selected
 */
export const ImageToolbar = ({ element }) => {
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
    <div className="flex items-center gap-1 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-lg p-1.5 border border-gray-200 dark:border-white/10 shadow-xl transition-colors duration-500">
      {/* Replace Image */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-blue-500/20"
      >
        <Upload className="w-4 h-4" />
        Replace
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplace}
        className="hidden"
      />

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

      {/* Flip Horizontal */}
      <button
        onClick={toggleFlipX}
        className={`p-2 rounded-md transition-all ${
          element.flipX
            ? "bg-blue-100 dark:bg-blue-600 text-blue-600 dark:text-white shadow-inner"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
        }`}
        title="Flip Horizontal"
      >
        <FlipHorizontal className="w-4 h-4" />
      </button>

      {/* Flip Vertical */}
      <button
        onClick={toggleFlipY}
        className={`p-2 rounded-md transition-all ${
          element.flipY
            ? "bg-blue-100 dark:bg-blue-600 text-blue-600 dark:text-white shadow-inner"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
        }`}
        title="Flip Vertical"
      >
        <FlipVertical className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

      {/* Opacity Control */}
      <div className="flex items-center gap-3 px-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Opacity
        </span>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-black/20 px-2 py-1 rounded-md border border-gray-200 dark:border-white/5">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={element.opacity ?? 1}
            onChange={(e) => handleChange("opacity", parseFloat(e.target.value))}
            className="w-20 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 w-9 text-right">
            {Math.round((element.opacity ?? 1) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageToolbar;
