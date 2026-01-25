import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage } from "react-konva";
import { motion, AnimatePresence } from "framer-motion";
import Konva from "konva";
import { animationPresets } from "../components/Editor/animationPresets";
import { ChevronLeft, ChevronRight, X, Maximize, Minimize, Play, Pause } from "lucide-react";
import { fetchFromWalrus } from "../services/exports/exportToWalrus";

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const slideTransitions = {
  none: { initial: {}, animate: {}, exit: {} },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  },
  pushLeft: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { x: "-100%", opacity: 0, transition: { duration: 0.4 } },
  },
  pushRight: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { x: "100%", opacity: 0, transition: { duration: 0.4 } },
  },
};

const URLImage = ({ element }) => {
  const [image, setImage] = useState(null);
  useEffect(() => {
    if (!element.src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = element.src;
    img.onload = () => setImage(img);
  }, [element.src]);

  if (!image) return null;
  return (
    <KonvaImage
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width || 200}
      height={element.height || 150}
      image={image}
      rotation={element.rotation || 0}
    />
  );
};

export const Slide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const [presentation, setPresentation] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [autoplayInterval] = useState(5);
  const [animatedElements, setAnimatedElements] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeout = useRef(null);

  // --- LOGIC 1: ẨN CON TRỎ & CONTROL BAR ---
  useEffect(() => {
    const handleInteraction = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => setShowControls(false), 2000);
    };
    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, []);

  // --- LOGIC 2: LOAD DATA ---
  useEffect(() => {
    const loadPresentation = async () => {
      setIsLoading(true);
      try {
        const source = location.state?.source;
        const slideMeta = location.state?.slide;
        if (source === "blockchain" && slideMeta?.contentUrl) {
          const data = await fetchFromWalrus(slideMeta.contentUrl);
          if (data) {
            setPresentation(data);
            return;
          }
        }
        const slides = JSON.parse(localStorage.getItem("slides") || "[]");
        const found = slides.find((s) => s.id === id);
        if (found?.data) setPresentation(found.data);
        else navigate("/my-slide");
      } catch (error) {
        console.error("Load error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPresentation();
  }, [id, navigate, location.state]);

  // --- LOGIC 3: SCALE & FULLSCREEN (ĐÃ TỐI ƯU) ---
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scaleX = width / CANVAS_WIDTH;
    const scaleY = height / CANVAS_HEIGHT;

    // Khi fullscreen thì lấy 100%, khi thoát thì lấy 95% để có lề
    const newScale = Math.min(scaleX, scaleY) * (document.fullscreenElement ? 1 : 0.95);
    setScale(newScale);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Gọi nhiều lần để đảm bảo bắt đúng kích thước sau khi trình duyệt render lại layout
      handleResize();
      setTimeout(handleResize, 100);
      setTimeout(handleResize, 400);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [handleResize]);

  // --- LOGIC 4: ANIMATION ---
  const playAnimation = useCallback((element) => {
    if (!stageRef.current) return;
    const node = stageRef.current.findOne(`#${element.id}`);
    if (!node) return;
    const preset = animationPresets[element.animation.type];
    if (!preset) return;
    node.visible(true);
    if (preset.setup) preset.setup(node);
    if (preset.konvaTween) {
      new Konva.Tween(preset.konvaTween(node, element.animation.duration || 1)).play();
    } else if (preset.animate) {
      node.opacity(1);
      preset.animate(node, element.animation.duration || 1);
    }
  }, []);

  // --- LOGIC 5: NAVIGATION ---
  const handleNextAction = useCallback(() => {
    if (!presentation) return;
    const currentSlide = presentation.slides[currentIndex];
    const clickElements = currentSlide.elements
      .filter(
        (el) =>
          el.animation?.enabled && el.animation.appearOnClick && !animatedElements.has(el.id),
      )
      .sort((a, b) => (a.animation.clickOrder || 0) - (b.animation.clickOrder || 0));

    if (clickElements.length === 0) {
      if (currentIndex < presentation.slides.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsAutoplay(false);
      }
    } else {
      const nextEl = clickElements[0];
      playAnimation(nextEl);
      setAnimatedElements((prev) => new Set([...prev, nextEl.id]));
    }
  }, [presentation, currentIndex, animatedElements, playAnimation]);

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  // --- LOGIC 6: AUTOPLAY ---
  useEffect(() => {
    let interval;
    if (isAutoplay && presentation) {
      interval = setInterval(() => {
        handleNextAction();
      }, autoplayInterval * 1000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, presentation, handleNextAction, autoplayInterval]);

  // --- LOGIC 7: KEYBOARD ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNextAction();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key.toLowerCase() === "f") {
        if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
        else document.exitFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextAction]);

  useEffect(() => {
    if (!presentation) return;
    const currentSlide = presentation.slides[currentIndex];
    setAnimatedElements(new Set());
    setTimeout(() => {
      currentSlide.elements.forEach((el) => {
        const node = stageRef.current?.findOne(`#${el.id}`);
        if (el.animation?.enabled && el.animation.appearOnClick) {
          if (node) {
            node.opacity(0);
            node.visible(false);
          }
        } else if (el.animation?.enabled) {
          playAnimation(el);
        }
      });
    }, 50);
  }, [currentIndex, presentation, playAnimation]);

  if (isLoading || !presentation)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white font-medium">
        Loading...
      </div>
    );

  const currentSlide = presentation.slides[currentIndex];
  const transition = slideTransitions[currentSlide?.transition] || slideTransitions.fade;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 bg-black flex items-center justify-center overflow-hidden transition-all duration-300 ${!showControls ? "cursor-none" : "cursor-default"}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={transition.initial}
          animate={transition.animate}
          exit={transition.exit}
          className="relative flex items-center justify-center w-full h-full"
        >
          <Stage
            ref={stageRef}
            width={CANVAS_WIDTH * scale}
            height={CANVAS_HEIGHT * scale}
            scaleX={scale}
            scaleY={scale}
            onClick={(e) => e.target === e.target.getStage() && handleNextAction()}
            style={{
              backgroundColor: currentSlide?.background || "#ffffff",
              boxShadow: isFullscreen ? "none" : "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Layer>
              <Rect
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                fill={currentSlide?.background || "#ffffff"}
              />
              {currentSlide.elements.map((el) => {
                // Tách key và các thuộc tính dùng chung
                const commonProps = {
                  id: el.id,
                  x: el.x,
                  y: el.y,
                  rotation: el.rotation || 0,
                };

                if (el.type === "rect")
                  return (
                    <Rect
                      key={el.id}
                      {...commonProps}
                      width={el.width}
                      height={el.height}
                      fill={el.fill}
                      cornerRadius={el.cornerRadius}
                    />
                  );
                if (el.type === "circle")
                  return (
                    <Circle key={el.id} {...commonProps} radius={el.radius} fill={el.fill} />
                  );
                if (el.type === "text")
                  return (
                    <Text
                      key={el.id}
                      {...commonProps}
                      text={el.text}
                      fontSize={el.fontSize}
                      fill={el.fill}
                      width={el.width}
                      align={el.align}
                    />
                  );
                if (el.type === "image") return <URLImage key={el.id} element={el} />;
                return null;
              })}
            </Layer>
          </Stage>
        </motion.div>
      </AnimatePresence>

      {/* Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full z-50 shadow-2xl"
        style={{ pointerEvents: showControls ? "auto" : "none" }}
      >
        <button
          onClick={prevSlide}
          className="cursor-pointer text-white hover:text-blue-400 disabled:opacity-30"
          disabled={currentIndex === 0}
        >
          <ChevronLeft />
        </button>
        <span className="text-white text-sm font-mono">
          {currentIndex + 1} / {presentation.slides.length}
        </span>
        <button
          onClick={handleNextAction}
          className="cursor-pointer text-white hover:text-blue-400 disabled:opacity-30"
          disabled={
            currentIndex === presentation.slides.length - 1 &&
            animatedElements.size >=
              currentSlide.elements.filter((e) => e.animation?.appearOnClick).length
          }
        >
          <ChevronRight />
        </button>

        <div className="w-px h-4 bg-white/20 mx-2" />

        <button
          onClick={() => setIsAutoplay(!isAutoplay)}
          className={`cursor-pointer transition-colors ${isAutoplay ? "text-blue-500" : "text-white"}`}
        >
          {isAutoplay ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          onClick={() => {
            if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
            else document.exitFullscreen();
          }}
          className="cursor-pointer text-white hover:text-blue-400"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        <button
          onClick={() => navigate("/my-slide")}
          className="cursor-pointer text-red-400 hover:bg-red-500/10 p-1 rounded"
        >
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
};

export default Slide;
