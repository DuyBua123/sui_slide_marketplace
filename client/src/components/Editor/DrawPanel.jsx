import { Trash2, Eraser, PenTool, MousePointer2 } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";

/**
 * DrawPanel - Controls for the freehand drawing tool
 */
export const DrawPanel = () => {
    const {
        drawingSettings,
        updateDrawingSettings,
        clearSelection,
    } = useSlideStore();

    const colors = [
        "#000000", "#ffffff", "#f44336", "#e91e63", "#9c27b0",
        "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
        "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b",
        "#ffc107", "#ff9800", "#ff5722"
    ];

    const handleToggleDraw = (enabled) => {
        if (enabled) clearSelection();
        updateDrawingSettings({ enabled });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Tool Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                <button
                    onClick={() => handleToggleDraw(false)}
                    className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!drawingSettings.enabled
                            ? "bg-white dark:bg-white/10 text-purple-600 dark:text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <MousePointer2 className="w-4 h-4" />
                    Select
                </button>
                <button
                    onClick={() => handleToggleDraw(true)}
                    className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${drawingSettings.enabled
                            ? "bg-white dark:bg-white/10 text-purple-600 dark:text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <PenTool className="w-4 h-4" />
                    Draw
                </button>
            </div>

            {drawingSettings.enabled && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Color Picker */}
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                            Brush Color
                        </h4>
                        <div className="grid grid-cols-6 gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => updateDrawingSettings({ color })}
                                    className={`cursor-pointer w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 active:scale-90 ${drawingSettings.color === color
                                            ? "border-purple-500 scale-110 shadow-lg"
                                            : "border-transparent"
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                Brush Size
                            </h4>
                            <span className="text-xs font-bold text-purple-600">{drawingSettings.brushSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={drawingSettings.brushSize}
                            onChange={(e) => updateDrawingSettings({ brushSize: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                    </div>

                    {/* Opacity Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                Opacity
                            </h4>
                            <span className="text-xs font-bold text-purple-600">{Math.round(drawingSettings.opacity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.01"
                            value={drawingSettings.opacity}
                            onChange={(e) => updateDrawingSettings({ opacity: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                    </div>

                    {/* Helpful Tips */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-100 dark:border-purple-500/20">
                        <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed font-medium">
                            ✨ Tip: Use drawing to add annotations, arrows, or unique freehand elements to your slides.
                            Each stroke is saved as a separate element.
                        </p>
                    </div>
                </div>
            )}

            {/* Placeholder for future Eraser tool */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 opacity-50">
                <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 text-xs font-bold"
                >
                    <Eraser className="w-4 h-4" />
                    Eraser (Soon)
                </button>
            </div>
        </div>
    );
};

export default DrawPanel;
