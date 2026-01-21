import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  ArrowUpCircle,
  ArrowDownCircle,
  MoreHorizontal,
} from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";

/**
 * Floating Element Menu - appears above selected element (Canva-style)
 */
export const FloatingElementMenu = ({ element, position }) => {
  const { duplicateElement, deleteElement, bringToFront, sendToBack } = useSlideStore();

  if (!element || !position) return null;

  const handleDuplicate = (e) => {
    e.stopPropagation();
    // Create new element with offset position
    const { id, ...elementProps } = element;
    const newElement = {
      ...elementProps,
      x: element.x + 20,
      y: element.y + 20,
    };
    duplicateElement(element.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteElement(element.id);
  };

  const handleBringForward = (e) => {
    e.stopPropagation();
    bringToFront(element.id);
  };

  const handleSendBackward = (e) => {
    e.stopPropagation();
    sendToBack(element.id);
  };

  return (
    <div
      className="absolute z-50 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 50}px`, // Tăng khoảng cách một chút để không đè lên viền chọn
        transform: "translateX(-50%)",
      }}
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/20 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl flex items-center gap-0.5 p-1.5 transition-all">
        {/* Duplicate */}
        <button
          onClick={handleDuplicate}
          className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-white group"
          title="Duplicate"
        >
          <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="cursor-pointer p-2 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors text-red-500 dark:text-red-400 group"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

        {/* Layer Management */}
        <button
          onClick={handleBringForward}
          className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-white"
          title="Bring Forward"
        >
          <ArrowUpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={handleSendBackward}
          className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-white"
          title="Send Backward"
        >
          <ArrowDownCircle className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

        {/* More Options */}
        <button
          className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-white"
          title="More Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Arrow pointing down to element */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full flex flex-col items-center">
        <div
          className="w-0 h-0 
      border-l-[6px] border-r-[6px] border-t-[6px] 
      border-l-transparent border-r-transparent 
      border-t-gray-200 dark:border-t-white/20"
        />
        <div
          className="w-0 h-0 -mt-[7px]
      border-l-[5px] border-r-[5px] border-t-[5px] 
      border-l-transparent border-r-transparent 
      border-t-white dark:border-t-gray-900"
        />
      </div>
    </div>
  );
};

export default FloatingElementMenu;
