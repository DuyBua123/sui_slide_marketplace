import { useSlideStore } from "../../store/useSlideStore";
import { Scene3D } from "./Scene3D"; // Will be created next

/**
 * MediaOverlay - HTML layer sitting on top of Konva Canvas
 * Handles Video players, Audio controls, and 3D scenes (via R3F)
 */
export const MediaOverlay = ({ zoom, readOnly = false, elements: propElements }) => {
    const store = useSlideStore();

    // If elements are passed via props (e.g. from Presentation Mode), use them.
    // Otherwise, use the store (Editor Mode).
    let elements = propElements;
    if (!elements) {
        const currentSlide = store.slides[store.currentSlideIndex];
        elements = currentSlide?.elements || [];
    }

    const mediaElements = elements.filter(el =>
        ["video", "audio", "threeD"].includes(el.type)
    );

    if (mediaElements.length === 0) return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{ overflow: 'hidden' }}
        >
            {mediaElements.map(element => {
                const style = {
                    position: 'absolute',
                    left: `${element.x * zoom}px`,
                    top: `${element.y * zoom}px`,
                    width: `${element.width * zoom}px`,
                    height: `${element.height * zoom}px`,
                    transform: `rotate(${element.rotation || 0}deg)`,
                    pointerEvents: readOnly ? 'auto' : 'none', // Allow interaction only in read-only/present mode usually, or use a handle for editing
                    // For now, let's allow interaction if not dragging, but complex in editor.
                    // Better approach: In editor, show "Edit" overlay or static preview.
                    // In this iteration, we'll render them fully but maybe behind a transparent div for drag in Editor.
                };

                if (element.type === "video") {
                    return (
                        <div key={element.id} style={style} className="pointer-events-auto">
                            <video
                                src={element.src}
                                className="w-full h-full object-cover"
                                controls={!readOnly} // Show controls in editor? Maybe.
                                autoPlay={element.autoPlay}
                                loop={element.loop}
                                muted={element.muted}
                            />
                        </div>
                    );
                }

                if (element.type === "audio") {
                    return (
                        <div key={element.id} style={{ ...style, height: 'auto' }} className="pointer-events-auto">
                            <audio controls src={element.src} className="w-full shadow-lg rounded-full" />
                        </div>
                    );
                }

                if (element.type === "threeD") {
                    return (
                        <div key={element.id} style={style} className="pointer-events-auto">
                            <Scene3D modelUrl={element.model} color={element.color || 'cyan'} />
                        </div>
                    )
                }

                return null;
            })}
        </div>
    );
};

export default MediaOverlay;
