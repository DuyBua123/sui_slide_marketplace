import { useState, useEffect } from "react";
import { Canvas } from "./Canvas";
import { Ruler } from "./Ruler";
import { FloatingElementMenu } from "./FloatingElementMenu";
import { useSlideStore } from "../../store/useSlideStore";

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

/**
 * CanvasWithRulers - Wrapper bổ sung thước đo và menu nổi cho Canvas
 */
export const CanvasWithRulers = ({ readOnly = false }) => {
  const { slides, currentSlideIndex, selectedId } = useSlideStore();
  const [floatingMenuPosition, setFloatingMenuPosition] = useState(null);

  const currentSlide = slides[currentSlideIndex];
  const elements = currentSlide?.elements || [];
  const selectedElement = elements.find((el) => el.id === selectedId);

  useEffect(() => {
    if (selectedElement && !readOnly) {
      const x = selectedElement.x + (selectedElement.width || 100) / 2;
      const y = selectedElement.y;
      setFloatingMenuPosition({ x, y });
    } else {
      setFloatingMenuPosition(null);
    }
  }, [selectedElement, readOnly]);

  return (
    // Mặc định: Nền xám nhạt (Light) | Dark: Nền xám đen (Dark)
    <div className="flex-1 relative bg-gray-100 dark:bg-gray-950 rounded-xl overflow-hidden transition-colors duration-300">
      {/* Rulers Area */}
      {!readOnly && (
        <>
          {/* Top-left corner: Điểm giao nhau giữa 2 thước */}
          <div className="absolute top-0 left-0 w-5 h-5 bg-gray-200 dark:bg-gray-900/50 border-r border-b border-gray-300 dark:border-white/5 z-10" />

          {/* Horizontal ruler: Thước ngang */}
          <div className="absolute top-0 left-5 z-10">
            <Ruler orientation="horizontal" width={CANVAS_WIDTH} />
          </div>

          {/* Vertical ruler: Thước dọc */}
          <div className="absolute left-0 top-5 z-10">
            <Ruler orientation="vertical" height={CANVAS_HEIGHT} />
          </div>
        </>
      )}

      {/* Main Canvas Container */}
      <div
        className={`${!readOnly ? "ml-5 mt-5" : ""} flex items-center justify-center p-8 min-h-full`}
      >
        {/* Canvas Box: Thêm đổ bóng mềm cho Light Mode và đổ bóng sâu cho Dark Mode */}
        <div className="relative shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-shadow">
          <Canvas readOnly={readOnly} />

          {/* Floating Element Menu: Xuất hiện khi chọn element */}
          {!readOnly && selectedElement && floatingMenuPosition && (
            <FloatingElementMenu element={selectedElement} position={floatingMenuPosition} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasWithRulers;
