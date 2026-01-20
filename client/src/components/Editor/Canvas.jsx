import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Image as KonvaImage } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { useSlideStore } from '../../store/useSlideStore';

// Aspect ratio 16:9
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

/**
 * URLImage component - loads image from URL and renders on Konva
 */
const URLImage = ({ element, onSelect, onDragMove, onDragEnd, onTransformEnd, readOnly }) => {
    const [image, setImage] = useState(null);
    const imageRef = useRef(null);

    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = element.src;
        img.onload = () => setImage(img);
        img.onerror = () => console.error('Failed to load image:', element.src);
    }, [element.src]);

    if (!image) {
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
            opacity={element.opacity ?? 1}
            scaleX={element.flipX ? -1 : 1}
            scaleY={element.flipY ? -1 : 1}
            draggable={!readOnly}
            onClick={onSelect}
            onTap={onSelect}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
        />
    );
};

// Slide transition variants
const slideTransitions = {
    none: { initial: {}, animate: {}, exit: {} },
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    },
    pushLeft: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
        exit: { x: '-100%', opacity: 0, transition: { duration: 0.3 } },
    },
    pushRight: {
        initial: { x: '-100%', opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
        exit: { x: '100%', opacity: 0, transition: { duration: 0.3 } },
    },
    scale: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
        exit: { scale: 1.2, opacity: 0, transition: { duration: 0.2 } },
    },
};

/**
 * Main Canvas component with true text resizing
 */
export const Canvas = ({ readOnly = false }) => {
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [showGuidelines, setShowGuidelines] = useState({ vertical: false, horizontal: false });

    const {
        slides,
        currentSlideIndex,
        selectedId,
        selectedIds,
        selectElement,
        toggleSelectElement,
        clearSelection,
        updateElement
    } = useSlideStore();

    const currentSlide = slides[currentSlideIndex];
    const elements = currentSlide?.elements || [];
    const background = currentSlide?.background || '#1a1a2e';
    const transition = currentSlide?.transition || 'fade';

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

        const ids = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        const nodes = ids.map(id => stageRef.current.findOne(`#${id}`)).filter(Boolean);

        transformerRef.current.nodes(nodes);
        transformerRef.current.getLayer()?.batchDraw();
    }, [selectedId, selectedIds, elements, readOnly, currentSlideIndex]);

    const handleStageClick = (e) => {
        if (readOnly) return;
        if (e.target === e.target.getStage()) {
            clearSelection();
        }
    };

    const handleElementClick = (e, id) => {
        if (readOnly) return;
        if (e.evt?.shiftKey) {
            toggleSelectElement(id);
        } else {
            selectElement(id);
        }
    };

    const handleDragMove = (e) => {
        if (readOnly) return;
        const node = e.target;
        const x = node.x();
        const y = node.y();
        const width = node.width ? node.width() : 0;
        const height = node.height ? node.height() : 0;

        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        const nodeCenterX = x + width / 2;
        const nodeCenterY = y + height / 2;

        const snapThreshold = 10;
        let newGuidelines = { vertical: false, horizontal: false };

        if (Math.abs(nodeCenterX - centerX) < snapThreshold) {
            node.x(centerX - width / 2);
            newGuidelines.vertical = true;
        }
        if (Math.abs(nodeCenterY - centerY) < snapThreshold) {
            node.y(centerY - height / 2);
            newGuidelines.horizontal = true;
        }

        setShowGuidelines(newGuidelines);
    };

    const handleDragEnd = (e, id) => {
        if (readOnly) return;
        setShowGuidelines({ vertical: false, horizontal: false });
        updateElement(id, {
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    /**
     * Handle transform end with TRUE FONT RESIZING for text
     */
    const handleTransformEnd = (e, id) => {
        if (readOnly) return;
        const node = e.target;
        const element = elements.find((el) => el.id === id);
        if (!element) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        const updates = {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
        };

        if (element.type === 'text') {
            // TRUE FONT RESIZING: Calculate new fontSize from scale
            const oldFontSize = element.fontSize || 24;
            const newFontSize = Math.round(oldFontSize * scaleY);

            updates.fontSize = Math.max(8, Math.min(200, newFontSize)); // Clamp 8-200
            updates.width = Math.max(20, node.width() * scaleX);

            // Reset scale to 1 (font size handles the sizing now)
            node.scaleX(1);
            node.scaleY(1);
        } else if (element.type === 'rect' || element.type === 'image') {
            updates.width = Math.max(20, node.width() * scaleX);
            updates.height = Math.max(20, node.height() * scaleY);
            node.scaleX(1);
            node.scaleY(1);
        } else if (element.type === 'circle') {
            updates.radius = Math.max(10, element.radius * Math.max(scaleX, scaleY));
            node.scaleX(1);
            node.scaleY(1);
        }

        updateElement(id, updates);
    };

    /**
     * Handle double-click on text for inline editing
     */
    const handleTextDblClick = useCallback((e, element) => {
        if (readOnly) return;

        const textNode = e.target;
        const stage = stageRef.current;
        if (!stage) return;

        const stageBox = stage.container().getBoundingClientRect();
        const textPosition = textNode.absolutePosition();

        // Hide the text node while editing
        textNode.hide();
        if (transformerRef.current) {
            transformerRef.current.hide();
        }
        stage.getLayer()?.batchDraw();

        // Create textarea overlay
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        const areaPosition = {
            x: stageBox.left + textPosition.x * scale,
            y: stageBox.top + textPosition.y * scale,
        };

        textarea.value = element.text;
        textarea.style.position = 'fixed';
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;
        textarea.style.width = `${(element.width || 200) * scale + 10}px`;
        textarea.style.height = 'auto';
        textarea.style.minHeight = `${(element.fontSize || 24) * scale * 1.5}px`;
        textarea.style.fontSize = `${(element.fontSize || 24) * scale}px`;
        textarea.style.fontFamily = element.fontFamily || 'Arial';
        textarea.style.fontWeight = element.fontWeight || 'normal';
        textarea.style.fontStyle = element.fontStyle || 'normal';
        textarea.style.color = element.fill || '#ffffff';
        textarea.style.background = 'rgba(0,0,0,0.8)';
        textarea.style.border = '2px solid #3b82f6';
        textarea.style.borderRadius = '4px';
        textarea.style.padding = '8px';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.overflow = 'hidden';
        textarea.style.lineHeight = '1.2';
        textarea.style.zIndex = '10000';
        textarea.style.transformOrigin = 'left top';

        textarea.focus();
        textarea.select();

        // Auto-resize textarea
        const adjustHeight = () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        };
        textarea.addEventListener('input', adjustHeight);
        adjustHeight();

        const finishEditing = () => {
            const newText = textarea.value;
            updateElement(element.id, { text: newText });

            textarea.remove();
            textNode.show();
            if (transformerRef.current) {
                transformerRef.current.show();
            }
            stage.getLayer()?.batchDraw();
        };

        textarea.addEventListener('blur', finishEditing);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                textarea.value = element.text; // Revert
                textarea.blur();
            }
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                textarea.blur();
            }
        });
    }, [readOnly, scale, updateElement]);

    const renderElement = (element) => {
        const commonProps = {
            key: element.id,
            id: element.id,
            x: element.x,
            y: element.y,
            rotation: element.rotation || 0,
            draggable: !readOnly,
            onClick: (e) => handleElementClick(e, element.id),
            onTap: (e) => handleElementClick(e, element.id),
            onDragMove: handleDragMove,
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
                        fontSize={element.fontSize || 24}
                        fontFamily={element.fontFamily || 'Arial'}
                        fontStyle={`${element.fontWeight === 'bold' ? 'bold' : ''} ${element.fontStyle || ''}`.trim() || 'normal'}
                        fill={element.fill}
                        width={element.width}
                        align={element.align || 'left'}
                        onDblClick={(e) => handleTextDblClick(e, element)}
                        onDblTap={(e) => handleTextDblClick(e, element)}
                    />
                );
            case 'image':
                return (
                    <URLImage
                        key={element.id}
                        element={element}
                        onSelect={(e) => handleElementClick(e, element.id)}
                        onDragMove={handleDragMove}
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
        return () => { window.__slideStage = null; };
    }, []);

    const transitionVariant = slideTransitions[transition] || slideTransitions.fade;

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center bg-gray-950 rounded-xl p-4 overflow-hidden"
            style={{ minHeight: CANVAS_HEIGHT * scale + 40 }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlideIndex}
                    initial={transitionVariant.initial}
                    animate={transitionVariant.animate}
                    exit={transitionVariant.exit}
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
                        style={{ background, cursor: readOnly ? 'default' : 'crosshair' }}
                        onClick={handleStageClick}
                        onTap={handleStageClick}
                    >
                        <Layer>
                            <Rect
                                x={0}
                                y={0}
                                width={CANVAS_WIDTH}
                                height={CANVAS_HEIGHT}
                                fill={background}
                                listening={false}
                            />

                            {/* Smart Guidelines */}
                            {showGuidelines.vertical && (
                                <Line
                                    points={[CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT]}
                                    stroke="#f43f5e"
                                    strokeWidth={1}
                                    dash={[5, 5]}
                                    listening={false}
                                />
                            )}
                            {showGuidelines.horizontal && (
                                <Line
                                    points={[0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2]}
                                    stroke="#f43f5e"
                                    strokeWidth={1}
                                    dash={[5, 5]}
                                    listening={false}
                                />
                            )}

                            {elements.map(renderElement)}

                            {!readOnly && (
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        if (newBox.width < 20 || newBox.height < 20) return oldBox;
                                        return newBox;
                                    }}
                                    anchorStroke="#3b82f6"
                                    anchorFill="#1e40af"
                                    anchorSize={10}
                                    borderStroke="#3b82f6"
                                    borderDash={[4, 4]}
                                    keepRatio={false}
                                />
                            )}
                        </Layer>
                    </Stage>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Canvas;
