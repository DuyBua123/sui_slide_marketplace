import { useState, useEffect } from 'react';
import { Canvas } from './Canvas';
import { Ruler } from './Ruler';
import { FloatingElementMenu } from './FloatingElementMenu';
import { useSlideStore } from '../../store/useSlideStore';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

/**
 * CanvasWithRulers - Wrapper that adds rulers and floating menu to Canvas
 */
export const CanvasWithRulers = ({ readOnly = false }) => {
    const { slides, currentSlideIndex, selectedId } = useSlideStore();
    const [floatingMenuPosition, setFloatingMenuPosition] = useState(null);

    const currentSlide = slides[currentSlideIndex];
    const elements = currentSlide?.elements || [];
    const selectedElement = elements.find((el) => el.id === selectedId);

    // Update floating menu position when element is selected
    useEffect(() => {
        if (selectedElement && !readOnly) {
            // Calculate position above element center
            const x = selectedElement.x + (selectedElement.width || 100) / 2;
            const y = selectedElement.y;
            setFloatingMenuPosition({ x, y });
        } else {
            setFloatingMenuPosition(null);
        }
    }, [selectedElement, readOnly]);

    return (
        <div className="flex-1 relative bg-gray-950 rounded-xl overflow-hidden">
            {/* Rulers */}
            {!readOnly && (
                <>
                    {/* Top ruler corner */}
                    <div className="absolute top-0 left-0 w-5 h-5 bg-gray-900/50 border-r border-b border-white/5 z-10" />

                    {/* Horizontal ruler */}
                    <div className="absolute top-0 left-5 z-10">
                        <Ruler orientation="horizontal" width={CANVAS_WIDTH} />
                    </div>

                    {/* Vertical ruler */}
                    <div className="absolute left-0 top-5 z-10">
                        <Ruler orientation="vertical" height={CANVAS_HEIGHT} />
                    </div>
                </>
            )}

            {/* Canvas area with offset for rulers */}
            <div className={`${!readOnly ? 'ml-5 mt-5' : ''} flex items-center justify-center p-4`}>
                <div className="relative">
                    <Canvas readOnly={readOnly} />

                    {/* Floating Element Menu */}
                    {!readOnly && selectedElement && floatingMenuPosition && (
                        <FloatingElementMenu
                            element={selectedElement}
                            position={floatingMenuPosition}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CanvasWithRulers;
