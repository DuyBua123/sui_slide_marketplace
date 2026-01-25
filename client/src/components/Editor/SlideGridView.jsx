import { Trash2, Copy, Plus, X } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";
import { SlideThumbnail } from "./SlideThumbnail";

/**
 * SlideGridView - Modal-style overview of all slides
 */
export const SlideGridView = () => {
    const {
        slides,
        currentSlideIndex,
        setCurrentSlideIndex,
        addSlide,
        deleteSlide,
        duplicateSlide,
        setViewMode,
    } = useSlideStore();

    const handleSelect = (index) => {
        setCurrentSlideIndex(index);
        setViewMode("filmstrip");
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#f0f2f5] dark:bg-[#0a0a0f] flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-16 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        Slide Overview
                    </h2>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        {slides.length} Pages
                    </span>
                </div>

                <button
                    onClick={() => setViewMode("filmstrip")}
                    className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-500 transition-all active:scale-95"
                    title="Close Overview"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 max-w-[1600px] mx-auto">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="group flex flex-col gap-3"
                        >
                            {/* Slide Counter */}
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-black text-gray-400 dark:text-gray-500">
                                    {index + 1}
                                </span>

                                {/* Quick Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateSlide(index);
                                        }}
                                        className="cursor-pointer p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 rounded-lg transition-all"
                                        title="Duplicate"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    {slides.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteSlide(index);
                                            }}
                                            className="cursor-pointer p-1.5 hover:bg-red-500 hover:text-white text-gray-600 dark:text-gray-400 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Slide Thumbnail */}
                            <div
                                onClick={() => handleSelect(index)}
                                className={`relative aspect-video rounded-2xl border-4 transition-all overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${index === currentSlideIndex
                                    ? "border-purple-600 ring-4 ring-purple-600/10"
                                    : "border-white dark:border-white/5 hover:border-purple-300"
                                    }`}
                                style={{ background: "#ffffff" }}
                            >
                                {/* Content Preview */}
                                <div className="w-full h-full flex items-center justify-center">
                                    <SlideThumbnail slide={slide} width={300} height={168} />
                                </div>

                                {/* Overlay for hover */}
                                <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/5 transition-colors" />
                            </div>
                        </div>
                    ))}

                    {/* Add Slide Button */}
                    <div className="flex flex-col gap-3">
                        <div className="px-1 invisible">0</div>
                        <button
                            onClick={() => addSlide()}
                            className="cursor-pointer aspect-video rounded-2xl border-4 border-dashed border-gray-200 dark:border-white/5 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black text-gray-400 group-hover:text-purple-600 uppercase tracking-widest">
                                Add Page
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer / Status */}
            <div className="h-12 bg-white dark:bg-[#0d0d0d] border-t border-gray-200 dark:border-white/5 flex items-center justify-center px-8">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                    SlideSui • Slide Overview Mode
                </p>
            </div>
        </div>
    );
};

export default SlideGridView;
