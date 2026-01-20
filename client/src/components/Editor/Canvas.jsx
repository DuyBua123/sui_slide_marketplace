import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Image as KonvaImage } from 'react-konva';
import { useSlideStore } from '../../store/useSlideStore';

// Aspect ratio 16:9
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

/**
 * URLImage component - loads image from URL and renders on Konva
 */
const URLImage = ({ element, isSelected, onSelect, onDragEnd, onTransformEnd, readOnly }) => {
    const [image, setImage] = useState(null);
    const imageRef = useRef(null);

    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = element.src;
        img.onload = () => {
            setImage(img);
        };
        img.onerror = () => {
            console.error('Failed to load image:', element.src);
        };
    }, [element.src]);

    if (!image) {
        // Render placeholder while loading
        return (
            <Rect
                id={element.id}
                x={element.x}
                y={element.y}
                width={element.width || 200}
                height={element.height || 150}
                fill="#374151"
                stroke="#6b7280"
                strokeWidth={2}
                cornerRadius={8}
                draggable={!readOnly}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={onDragEnd}
            />
        );
    }

    return (
        <KonvaImage
            ref={imageRef}
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width || image.width || 200}
            height={element.height || image.height || 150}
            image={image}
            rotation={element.rotation || 0}
            draggable={!readOnly}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
        />
    );
};

/**
 * Main Canvas component using React Konva
 * Renders all elements and handles selection/transformation
 */
export const Canvas = ({ readOnly = false }) => {
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    const {
        elements,
        selectedId,
        selectElement,
        clearSelection,
        updateElement
    } = useSlideStore();

    // Responsive scaling
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const newScale = Math.min(containerWidth / CANVAS_WIDTH, 1);
                setScale(newScale);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update transformer when selection changes
    useEffect(() => {
        if (readOnly || !transformerRef.current || !stageRef.current) return;

        const selectedNode = stageRef.current.findOne(`#${selectedId}`);
        if (selectedNode) {
            transformerRef.current.nodes([selectedNode]);
            transformerRef.current.getLayer().batchDraw();
        } else {
            transformerRef.current.nodes([]);
        }
    }, [selectedId, elements, readOnly]);

    const handleStageClick = (e) => {
        if (readOnly) return;
        // Click on empty area - deselect
        if (e.target === e.target.getStage()) {
            clearSelection();
        }
    };

    const handleDragEnd = (e, id) => {
        if (readOnly) return;
        updateElement(id, {
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    const handleTransformEnd = (e, id) => {
        if (readOnly) return;
        const node = e.target;
        const element = elements.find((el) => el.id === id);

        if (!element) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale and apply to width/height
        node.scaleX(1);
        node.scaleY(1);

        const updates = {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
        };

        if (element.type === 'rect' || element.type === 'text' || element.type === 'image') {
            updates.width = Math.max(20, node.width() * scaleX);
            updates.height = Math.max(20, node.height() * scaleY);
        } else if (element.type === 'circle') {
            updates.radius = Math.max(10, element.radius * Math.max(scaleX, scaleY));
        }

        updateElement(id, updates);
    };

    const handleTextDblClick = (e, element) => {
        if (readOnly) return;
        const textNode = e.target;
        const stage = stageRef.current;
        const stageBox = stage.container().getBoundingClientRect();

        // Hide text node
        textNode.hide();

        // Create textarea over canvas
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        const textPosition = textNode.absolutePosition();
        textarea.value = element.text;
        textarea.style.position = 'absolute';
        textarea.style.top = `${stageBox.top + textPosition.y * scale}px`;
        textarea.style.left = `${stageBox.left + textPosition.x * scale}px`;
        textarea.style.width = `${textNode.width() * scale}px`;
        textarea.style.fontSize = `${element.fontSize * scale}px`;
        textarea.style.fontFamily = element.fontFamily;
        textarea.style.color = element.fill;
        textarea.style.background = 'transparent';
        textarea.style.border = '2px solid #3b82f6';
        textarea.style.padding = '4px';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.zIndex = '1000';

        textarea.focus();

        const handleBlur = () => {
            updateElement(element.id, { text: textarea.value });
            textarea.remove();
            textNode.show();
        };

        textarea.addEventListener('blur', handleBlur);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                textarea.blur();
            }
        });
    };

    const renderElement = (element) => {
        const commonProps = {
            key: element.id,
            id: element.id,
            x: element.x,
            y: element.y,
            rotation: element.rotation || 0,
            draggable: !readOnly,
            onClick: () => !readOnly && selectElement(element.id),
            onTap: () => !readOnly && selectElement(element.id),
            onDragEnd: (e) => handleDragEnd(e, element.id),
            onTransformEnd: (e) => handleTransformEnd(e, element.id),
        };

        switch (element.type) {
            case 'rect':
                return (
                    <Rect
                        {...commonProps}
                        width={element.width}
                        height={element.height}
                        fill={element.fill}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                        cornerRadius={element.cornerRadius}
                    />
                );
            case 'circle':
                return (
                    <Circle
                        {...commonProps}
                        radius={element.radius}
                        fill={element.fill}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                    />
                );
            case 'line':
                return (
                    <Line
                        {...commonProps}
                        points={element.points}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                    />
                );
            case 'text':
                return (
                    <Text
                        {...commonProps}
                        text={element.text}
                        fontSize={element.fontSize}
                        fontFamily={element.fontFamily}
                        fill={element.fill}
                        width={element.width}
                        align={element.align}
                        onDblClick={(e) => handleTextDblClick(e, element)}
                        onDblTap={(e) => handleTextDblClick(e, element)}
                    />
                );
            case 'image':
                return (
                    <URLImage
                        key={element.id}
                        element={element}
                        isSelected={selectedId === element.id}
                        onSelect={() => !readOnly && selectElement(element.id)}
                        onDragEnd={(e) => handleDragEnd(e, element.id)}
                        onTransformEnd={(e) => handleTransformEnd(e, element.id)}
                        readOnly={readOnly}
                    />
                );
            default:
                return null;
        }
    };

    // Export stage for thumbnail generation
    useEffect(() => {
        if (stageRef.current) {
            window.__slideStage = stageRef.current;
        }
        return () => {
            window.__slideStage = null;
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center bg-gray-950 rounded-xl p-4 overflow-hidden"
            style={{ minHeight: CANVAS_HEIGHT * scale + 40 }}
        >
            <div
                className="shadow-2xl rounded-lg overflow-hidden"
                style={{
                    width: CANVAS_WIDTH * scale,
                    height: CANVAS_HEIGHT * scale,
                    boxShadow: '0 0 60px rgba(59, 130, 246, 0.15)'
                }}
            >
                <Stage
                    ref={stageRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    scaleX={scale}
                    scaleY={scale}
                    style={{ background: '#1a1a2e', cursor: readOnly ? 'default' : 'crosshair' }}
                    onClick={handleStageClick}
                    onTap={handleStageClick}
                >
                    <Layer>
                        {/* Background */}
                        <Rect
                            x={0}
                            y={0}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            fill="#1a1a2e"
                            listening={false}
                        />

                        {/* Elements */}
                        {elements.map(renderElement)}

                        {/* Transformer for selection */}
                        {!readOnly && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    // Limit minimum size
                                    if (newBox.width < 20 || newBox.height < 20) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                                anchorStroke="#3b82f6"
                                anchorFill="#1e40af"
                                anchorSize={10}
                                borderStroke="#3b82f6"
                                borderDash={[4, 4]}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};

export default Canvas;
