import { useRef, useEffect, useState } from "react";
import { Image as KonvaImage, Rect } from "react-konva";
import Konva from "konva";

export const VideoElement = ({ element, onSelect, onDragMove, onDragEnd, onTransformEnd, readOnly }) => {
    const imageRef = useRef(null);
    const videoRef = useRef(null);
    const [size, setSize] = useState({ width: element.width, height: element.height });

    useEffect(() => {
        const video = document.createElement("video");
        video.src = element.src;
        video.muted = element.muted ?? true;
        video.loop = element.loop ?? true;
        video.crossOrigin = "anonymous";

        if (element.autoPlay) {
            video.play().catch(e => console.warn("Video autoplay blocked:", e));
        }

        videoRef.current = video;

        const anim = new Konva.Animation(() => {
            // Re-draw layer on every frame
        }, imageRef.current?.getLayer());

        anim.start();

        return () => {
            anim.stop();
            video.pause();
            video.src = "";
            video.load();
        };
    }, [element.src, element.autoPlay, element.muted, element.loop]);

    return (
        <KonvaImage
            ref={imageRef}
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            image={videoRef.current}
            draggable={!readOnly}
            onClick={onSelect}
            onTap={onSelect}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
        />
    );
};

export default VideoElement;
