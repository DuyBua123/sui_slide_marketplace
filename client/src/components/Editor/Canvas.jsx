import { useRef, useEffect, useState, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Text,
  Transformer,
  Image as KonvaImage,
  Star,
  RegularPolygon,
  Path,
} from "react-konva";
import { motion, AnimatePresence } from "framer-motion";
import { VideoElement } from "./VideoElement";
import { MediaOverlay } from "./MediaOverlay";
import { useSlideStore } from "../../store/useSlideStore";

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
    img.crossOrigin = "anonymous";
    img.src = element.src;
    img.onload = () => setImage(img);
    img.onerror = () => console.error("Failed to load image:", element.src);
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
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { x: "-100%", opacity: 0, transition: { duration: 0.3 } },
  },
  pushRight: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { x: "100%", opacity: 0, transition: { duration: 0.3 } },
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
  const {
    slides,
    currentSlideIndex,
    selectedId,
    selectedIds,
    selectElement,
    toggleSelectElement,
    clearSelection,
    updateElement,
    zoom,
    setZoom,
    drawingSettings,
    addElement,
  } = useSlideStore();

  const [showGuidelines, setShowGuidelines] = useState({ vertical: false, horizontal: false });
  const [currentLine, setCurrentLine] = useState(null); // { points, color, size, opacity }
  const isDrawing = useRef(false);

  const currentSlide = slides[currentSlideIndex];
  const elements = currentSlide?.elements || [];
  const background = currentSlide?.background || "#1a1a2e";
  const transition = currentSlide?.transition || "fade";

  const handleMouseDown = (e) => {
    if (readOnly || !drawingSettings.enabled) {
      if (e.target === e.target.getStage()) {
        clearSelection();
      }
      return;
    }

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    // Scale position back to 100% canvas coordinates
    const x = pos.x / zoom;
    const y = pos.y / zoom;

    setCurrentLine({
      points: [x, y],
      color: drawingSettings.color,
      size: drawingSettings.brushSize,
      opacity: drawingSettings.opacity,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !drawingSettings.enabled) {
      if (!readOnly && !drawingSettings.enabled && selectedId) {
        // Existing snap logic handleDragMove is separate, but we could add more here
      }
      return;
    }

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = pos.x / zoom;
    const y = pos.y / zoom;

    setCurrentLine((prev) => ({
      ...prev,
      points: [...prev.points, x, y],
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentLine && currentLine.points.length > 2) {
      addElement("line", {
        points: currentLine.points,
        stroke: currentLine.color,
        strokeWidth: currentLine.size,
        opacity: currentLine.opacity,
        tension: 0.5,
      });
    }
    setCurrentLine(null);
  };

  // Responsive initial scaling (Fit to container)
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && zoom === 1) { // Only auto-fit if at 100% or initial
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const padding = 40;
        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - padding;

        const scaleW = availableWidth / CANVAS_WIDTH;
        const scaleH = availableHeight / CANVAS_HEIGHT;
        const fitScale = Math.min(scaleW, scaleH, 1);

        setZoom(fitScale);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setZoom]); // Remove zoom from dependency to avoid loop if zoom changes manually

  // Update transformer when selection changes
  useEffect(() => {
    if (readOnly || !transformerRef.current || !stageRef.current) return;

    const ids = selectedIds.length > 0 ? selectedIds : selectedId ? [selectedId] : [];
    const nodes = ids.map((id) => stageRef.current.findOne(`#${id}`)).filter(Boolean);

    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedId, selectedIds, elements, readOnly, currentSlideIndex]);

  const handleElementClick = (e, id) => {
    if (readOnly || drawingSettings.enabled) return;
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

    if (element.type === "text") {
      // TRUE FONT RESIZING: Calculate new fontSize from scale
      const oldFontSize = element.fontSize || 24;
      const newFontSize = Math.round(oldFontSize * scaleY);

      updates.fontSize = Math.max(8, Math.min(200, newFontSize)); // Clamp 8-200
      updates.width = Math.max(20, node.width() * scaleX);

      // Reset scale to 1 (font size handles the sizing now)
      node.scaleX(1);
      node.scaleY(1);
    } else if (element.type === "rect" || element.type === "image" || element.type === "video" || element.type === "threeD") {
      updates.width = Math.max(20, node.width() * scaleX);
      updates.height = Math.max(20, node.height() * scaleY);
      node.scaleX(1);
      node.scaleY(1);
    } else if (element.type === "circle" || element.type === "regularPolygon") {
      // Uniform scaling for regular shapes
      const maxScale = Math.max(scaleX, scaleY);
      updates.radius = Math.max(10, element.radius * maxScale);
      node.scaleX(1);
      node.scaleY(1);
    } else if (element.type === "star") {
      const maxScale = Math.max(scaleX, scaleY);
      updates.innerRadius = Math.max(5, element.innerRadius * maxScale);
      updates.outerRadius = Math.max(10, element.outerRadius * maxScale);
      node.scaleX(1);
      node.scaleY(1);
    } else if (element.type === "path") {
      // For paths, we persist scale instead of changing path data
      updates.scaleX = scaleX;
      updates.scaleY = scaleY;
      // We don't reset scale to 1 here because we save the scale itself
    }

    updateElement(id, updates);
  };

  /**
   * Handle double-click on text for inline editing
   */
  const handleTextDblClick = useCallback(
    (e, element) => {
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
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      const areaPosition = {
        x: stageBox.left + textPosition.x * zoom,
        y: stageBox.top + textPosition.y * zoom,
      };

      textarea.value = element.text;
      textarea.style.position = "fixed";
      textarea.style.top = `${areaPosition.y}px`;
      textarea.style.left = `${areaPosition.x}px`;
      textarea.style.width = `${(element.width || 200) * zoom + 10}px`;
      textarea.style.height = "auto";
      textarea.style.minHeight = `${(element.fontSize || 24) * zoom * 1.5}px`;
      textarea.style.fontSize = `${(element.fontSize || 24) * zoom}px`;
      textarea.style.fontFamily = element.fontFamily || "Arial";
      textarea.style.fontWeight = element.fontWeight || "normal";
      textarea.style.fontStyle = element.fontStyle || "normal";
      textarea.style.color = element.fill || "#ffffff";
      textarea.style.background = "rgba(0,0,0,0.8)";
      textarea.style.border = "2px solid #3b82f6";
      textarea.style.borderRadius = "4px";
      textarea.style.padding = "8px";
      textarea.style.outline = "none";
      textarea.style.resize = "none";
      textarea.style.overflow = "hidden";
      textarea.style.lineHeight = "1.2";
      textarea.style.zIndex = "10000";
      textarea.style.transformOrigin = "left top";

      textarea.focus();
      textarea.select();

      // Auto-resize textarea
      const adjustHeight = () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      };
      textarea.addEventListener("input", adjustHeight);
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

      textarea.addEventListener("blur", finishEditing);
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          textarea.value = element.text; // Revert
          textarea.blur();
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          textarea.blur();
        }
      });
    },
    [readOnly, zoom, updateElement],
  );

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
      case "rect":
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
      case "circle":
        return (
          <Circle
            {...commonProps}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case "line":
        return (
          <Line
            {...commonProps}
            points={element.points}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            lineCap="round"
            lineJoin="round"
            tension={element.tension || 0}
          />
        );
      case "text":
        return (
          <Text
            {...commonProps}
            text={element.text}
            fontSize={element.fontSize || 24}
            fontFamily={element.fontFamily || "Arial"}
            fontStyle={
              `${element.fontWeight === "bold" ? "bold" : ""} ${element.fontStyle || ""}`.trim() ||
              "normal"
            }
            fill={element.fill}
            width={element.width}
            align={element.align || "left"}
            onDblClick={(e) => handleTextDblClick(e, element)}
            onDblTap={(e) => handleTextDblClick(e, element)}
          />
        );
      case "star":
        return (
          <Star
            {...commonProps}
            numPoints={element.numPoints}
            innerRadius={element.innerRadius}
            outerRadius={element.outerRadius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case "regularPolygon":
        return (
          <RegularPolygon
            {...commonProps}
            sides={element.sides}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case "path":
        return (
          <Path
            {...commonProps}
            data={element.data}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            scaleX={element.scaleX || 1}
            scaleY={element.scaleY || 1}
          />
        );
      case "image":
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
      case "video":
        return (
          <VideoElement
            key={element.id}
            element={element}
            onSelect={(e) => handleElementClick(e, element.id)}
            onDragMove={handleDragMove}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onTransformEnd={(e) => handleTransformEnd(e, element.id)}
            readOnly={readOnly}
          />
        );
      case "audio":
        return (
          <Rect
            {...commonProps}
            width={48}
            height={48}
            fill="#6366f1"
            cornerRadius={12}
            shadowBlur={10}
            shadowOpacity={0.2}
          />
        );
      case "threeD":
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            fill="#06b6d4"
            opacity={0.5}
            cornerRadius={12}
            dash={[10, 5]}
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

  const transitionVariant = slideTransitions[transition] || slideTransitions.fade;

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center bg-white rounded-xl p-4 overflow-auto custom-scrollbar"
      style={{
        minHeight: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlideIndex}
          initial={transitionVariant.initial}
          animate={transitionVariant.animate}
          exit={transitionVariant.exit}
          className="rounded-lg overflow-hidden shadow-2xl origin-center"
          style={{
            width: CANVAS_WIDTH * zoom,
            height: CANVAS_HEIGHT * zoom,
            transformOrigin: '50% 50%'
          }}
        >
          <Stage
            ref={stageRef}
            width={CANVAS_WIDTH * zoom}
            height={CANVAS_HEIGHT * zoom}
            scale={{ x: zoom, y: zoom }}
            style={{
              background,
              cursor: readOnly ? "default" : drawingSettings.enabled ? "crosshair" : "default"
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
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
              {!drawingSettings.enabled && showGuidelines.vertical && (
                <Line
                  points={[CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT]}
                  stroke="#f43f5e"
                  strokeWidth={1}
                  dash={[5, 5]}
                  listening={false}
                />
              )}
              {!drawingSettings.enabled && showGuidelines.horizontal && (
                <Line
                  points={[0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2]}
                  stroke="#f43f5e"
                  strokeWidth={1}
                  dash={[5, 5]}
                  listening={false}
                />
              )}

              {elements.map(renderElement)}

              {/* Active Drawing Preview */}
              {currentLine && (
                <Line
                  points={currentLine.points}
                  stroke={currentLine.color}
                  strokeWidth={currentLine.size}
                  opacity={currentLine.opacity}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.5}
                />
              )}

              {!readOnly && !drawingSettings.enabled && (
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
          <MediaOverlay zoom={zoom} readOnly={readOnly} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Canvas;
