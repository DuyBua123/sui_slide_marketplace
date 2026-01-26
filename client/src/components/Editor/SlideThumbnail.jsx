import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage, Star, RegularPolygon, Path } from "react-konva";
import { useMemo } from "react";

/**
 * SlideThumbnail - Renders a lightweight version of a slide using Konva
 * Used for Grid View and Filmstrip to show actual content instead of placeholders.
 */
export const SlideThumbnail = ({ slide, width = 200, height = 112 }) => {
    const CANVAS_WIDTH = 960;
    const CANVAS_HEIGHT = 540;

    const scale = width / CANVAS_WIDTH;

    const elements = slide?.elements || [];
    const background = slide?.background || "#ffffff";

    // Memoize elements to prevent unnecessary re-renders
    const renderedElements = useMemo(() => {
        return elements.map((element) => {
            const commonProps = {
                key: element.id,
                x: element.x,
                y: element.y,
                rotation: element.rotation || 0,
                opacity: element.opacity ?? 1,
                perfectDrawEnabled: false, // Optimize for thumbnails
                listening: false, // Disable interaction
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
                            tension={element.tension || 0}
                            lineCap="round"
                            lineJoin="round"
                        />
                    );
                case "text":
                    return (
                        <Text
                            {...commonProps}
                            text={element.text}
                            fontSize={element.fontSize || 24}
                            fontFamily={element.fontFamily || "Arial"}
                            fontStyle={element.fontStyle || "normal"}
                            fill={element.fill}
                            width={element.width}
                            align={element.align || "left"}
                        />
                    );
                case "image":
                    // Fallback for image in thumbnail
                    return (
                        <Rect
                            {...commonProps}
                            width={element.width}
                            height={element.height}
                            fill="#e5e7eb"
                        />
                    );
                case "video":
                    return (
                        <>
                            <Rect
                                {...commonProps}
                                width={element.width}
                                height={element.height}
                                fill="#000000"
                                opacity={0.8}
                            />
                            {/* Play Icon Triangle */}
                            <RegularPolygon
                                x={element.x + element.width / 2}
                                y={element.y + element.height / 2}
                                sides={3}
                                radius={Math.min(element.width, element.height) * 0.2}
                                fill="#ffffff"
                                rotation={90}
                                listening={false}
                            />
                        </>
                    );
                case "audio":
                    return (
                        <Rect
                            {...commonProps}
                            width={48} // Hardcoded size from library
                            height={48}
                            fill="#6366f1"
                            cornerRadius={12}
                        />
                    );
                case "threeD":
                    return (
                        <Rect
                            {...commonProps}
                            width={element.width}
                            height={element.height}
                            fill={element.color || "#06b6d4"}
                            opacity={0.5}
                            stroke={element.color || "#06b6d4"}
                            strokeWidth={2}
                            cornerRadius={4}
                            dash={[5, 5]}
                        />
                    );
                default:
                    return null;
            }
        });
    }, [elements]);

    return (
        <Stage width={width} height={height} scaleX={scale} scaleY={scale}>
            <Layer>
                <Rect
                    x={0}
                    y={0}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    fill={background}
                    listening={false}
                />
                {renderedElements}
            </Layer>
        </Stage>
    );
};

export default SlideThumbnail;
