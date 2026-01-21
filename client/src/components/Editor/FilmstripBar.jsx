import { useState } from "react";
import { Plus, Grid3x3, ZoomIn, ZoomOut, Maximize2, Copy, Trash2 } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";

/**
 * Enhanced Filmstrip Bar - Canva style with grid view and zoom controls
 */
export const FilmstripBar = () => {
  const [viewMode, setViewMode] = useState("filmstrip"); // 'filmstrip' | 'grid'
  const [zoom, setZoom] = useState(100);
  const [thumbnails, setThumbnails] = useState({});

  const {
    slides,
    currentSlideIndex,
    setCurrentSlideIndex,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlides,
  } = useSlideStore();

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Drag handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, toIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderSlides(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleZoomChange = (delta) => {
    setZoom((prev) => Math.max(10, Math.min(200, prev + delta)));
  };

  return (
    <div className="h-20 border-gray-200 dark:border-white/5 flex items-center px-4 gap-3 transition-colors shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
      {/* Slides List */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-3">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onClick={() => setCurrentSlideIndex(index)}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            className={`relative group cursor-pointer transition-all ${
              draggedIndex === index ? "opacity-50" : ""
            }`}
          >
            {/* Drop indicator: Thanh chỉ hướng khi kéo thả */}
            {dragOverIndex === index && draggedIndex !== index && (
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-purple-500 rounded-full z-10 animate-pulse" />
            )}

            {/* Thumbnail Slide */}
            <div
              className={`w-28 h-16 rounded-xl border-2 transition-all overflow-hidden relative ${
                index === currentSlideIndex
                  ? "border-purple-600 shadow-lg shadow-purple-600/20 scale-105 z-10"
                  : "border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/30"
              }`}
              style={{
                background: slide.background || "#ffffff", // Mặc định trắng cho Light
              }}
            >
              {/* Slide Number Label */}
              <div className="absolute bottom-1 right-2 text-[9px] font-black text-gray-400 dark:text-gray-500">
                {index + 1}
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateSlide(index);
                  }}
                  className="cursor-pointer p-1.5 bg-white hover:bg-gray-100 text-gray-800 rounded-lg transition-colors shadow-sm"
                  title="Duplicate"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(index);
                    }}
                    className="cursor-pointer p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Slide Button */}
        <button
          onClick={() => addSlide()}
          className="cursor-pointer flex-shrink-0 w-28 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all flex flex-col items-center justify-center gap-1 group"
        >
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          <span className="text-[9px] font-bold text-gray-400 group-hover:text-purple-600 uppercase tracking-tighter">
            Add Page
          </span>
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center gap-3 border-l border-gray-200 dark:border-white/5 pl-4 h-10">
        {/* Zoom Group */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
          <button
            onClick={() => handleZoomChange(-10)}
            className="cursor-pointer p-1.5 hover:bg-white dark:hover:bg-white/10 shadow-sm hover:text-purple-600 dark:hover:text-white rounded-lg text-gray-500 transition-all"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-black text-gray-700 dark:text-gray-300 w-10 text-center">
            {zoom}%
          </span>
          <button
            onClick={() => handleZoomChange(10)}
            className="cursor-pointer p-1.5 hover:bg-white dark:hover:bg-white/10 shadow-sm hover:text-purple-600 dark:hover:text-white rounded-lg text-gray-500 transition-all"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode & Fullscreen */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode(viewMode === "filmstrip" ? "grid" : "filmstrip")}
            className={`cursor-pointer p-2 rounded-xl transition-all ${
              viewMode === "grid"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            className="cursor-pointer p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Counter Badge */}
        <div className="flex items-center gap-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] font-black tracking-widest uppercase">
            {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilmstripBar;
