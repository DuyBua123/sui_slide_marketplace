import { useState } from "react";
import { Type, Heading1, Square, Circle, Minus, Image, Upload, Loader2 } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";
import { uploadToPinata } from "../../utils/pinata";

/**
 * Toolbox component with element tools
 */
export const Toolbox = () => {
  const addElement = useSlideStore((state) => state.addElement);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const tools = [
    {
      id: "text",
      label: "Text",
      icon: <Type className="w-5 h-5" />,
      onClick: () =>
        addElement("text", {
          text: "Click to edit",
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 100,
        }),
    },
    {
      id: "heading",
      label: "Heading",
      icon: <Heading1 className="w-5 h-5" />,
      onClick: () =>
        addElement("text", {
          text: "Heading",
          fontSize: 48,
          fontFamily: "Arial Black",
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 100,
          width: 400,
        }),
    },
    {
      id: "rect",
      label: "Rectangle",
      icon: <Square className="w-5 h-5" />,
      onClick: () =>
        addElement("rect", {
          x: 150 + Math.random() * 200,
          y: 150 + Math.random() * 100,
        }),
    },
    {
      id: "circle",
      label: "Circle",
      icon: <Circle className="w-5 h-5" />,
      onClick: () =>
        addElement("circle", {
          x: 200 + Math.random() * 200,
          y: 200 + Math.random() * 100,
        }),
    },
    {
      id: "line",
      label: "Line",
      icon: <Minus className="w-5 h-5" />,
      onClick: () =>
        addElement("line", {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 100,
        }),
    },
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadToPinata(file, file.name);
      addElement("image", {
        src: result.url,
        ipfsHash: result.hash,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 100,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error.message);
      // Fallback to local
      const reader = new FileReader();
      reader.onload = (event) => {
        addElement("image", {
          src: event.target?.result,
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 100,
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Elements Section */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-sm transition-colors">
        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
          Elements
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={tool.onClick}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-blue-500/30 shadow-sm hover:shadow-md transition-all group"
            >
              <span className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.icon}
              </span>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors uppercase tracking-tighter">
                {tool.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-sm transition-colors">
        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
          Media
        </h3>
        <label
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg cursor-pointer transition-all border ${
            isUploading
              ? "bg-yellow-50 dark:bg-yellow-600/20 border-yellow-200 dark:border-yellow-500/40"
              : "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-600/10 dark:to-cyan-600/10 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-600/20 dark:hover:to-cyan-600/20 border-blue-100 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 shadow-sm"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                Uploading...
              </span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Upload Image
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </label>
        {uploadError && (
          <p className="text-[10px] font-medium text-red-500 mt-2 text-center italic">
            Using local fallback
          </p>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-white/5 rounded-xl p-3 transition-colors">
        <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase mb-2">
          Quick Tips
        </h4>
        <ul className="space-y-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-500">
          <li className="flex items-start gap-1.5">
            <span className="text-blue-500">•</span>
            <span>Double-click text to edit</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-blue-500">•</span>
            <span>Shift+Click to multi-select</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-blue-500">•</span>
            <span>Drag elements to snap to center</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Toolbox;
