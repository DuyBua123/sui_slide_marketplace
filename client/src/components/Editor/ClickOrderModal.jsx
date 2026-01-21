import { X, GripVertical } from "lucide-react";
import { useState } from "react";
import { useSlideStore } from "../../store/useSlideStore";

/**
 * Click Order Modal - Manage animation click sequence
 */
export const ClickOrderModal = ({ isOpen, onClose }) => {
  const { slides, currentSlideIndex, updateElement } = useSlideStore();
  const currentSlide = slides[currentSlideIndex];

  // Get elements with appearOnClick animations
  const clickOrderElements = (currentSlide?.elements || [])
    .filter((el) => el.animation?.enabled && el.animation?.appearOnClick)
    .sort((a, b) => (a.animation?.clickOrder || 0) - (b.animation?.clickOrder || 0));

  const [localOrder, setLocalOrder] = useState(clickOrderElements);

  const handleReorder = (fromIndex, toIndex) => {
    const newOrder = [...localOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setLocalOrder(newOrder);
  };

  const handleSave = () => {
    // Update click orders
    localOrder.forEach((el, index) => {
      updateElement(el.id, {
        animation: {
          ...el.animation,
          clickOrder: index + 1,
        },
      });
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-96 max-h-[600px] flex flex-col border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Click Order</h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-gray-900">
          {localOrder.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium px-8 text-center leading-relaxed">
                No elements with "Appear on click" enabled on this slide
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {localOrder.map((element, index) => (
                <div
                  key={element.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/50 shadow-sm dark:shadow-none hover:shadow-md transition-all group"
                >
                  {/* Drag Handle */}
                  <button className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </button>

                  {/* Order Number Badge */}
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-purple-50 dark:bg-purple-600 rounded-xl text-purple-600 dark:text-white text-sm font-black shadow-inner">
                    {index + 1}
                  </div>

                  {/* Element Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-white capitalize truncate">
                      {element.type}
                      {element.text && (
                        <span className="font-normal text-gray-400 dark:text-gray-500 lowercase ml-1">
                          : "{element.text.substring(0, 15)}
                          {element.text.length > 15 ? "..." : ""}"
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                        {element.animation?.type || "Fade In"}
                      </p>
                    </div>
                  </div>

                  {/* Quick Reorder Controls */}
                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleReorder(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-400 dark:text-gray-500 disabled:opacity-10 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleReorder(index, Math.min(localOrder.length - 1, index + 1))
                      }
                      disabled={index === localOrder.length - 1}
                      className="cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-400 dark:text-gray-500 disabled:opacity-10 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="cursor-pointer px-5 py-2.5 text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="cursor-pointer px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-purple-600/20 active:scale-95 text-sm"
          >
            Save Sequence
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClickOrderModal;
