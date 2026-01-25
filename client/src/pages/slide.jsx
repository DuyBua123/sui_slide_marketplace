import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ManageAccessModal } from '../components/Editor/ManageAccessModal';
import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import Konva from 'konva';
import { animationPresets } from '../components/Editor/animationPresets';
import { fetchFromWalrus } from '../services/exports/exportToWalrus';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize,
  Minimize,
  Play,
  Pause,
  Settings,
  ShieldCheck,
} from "lucide-react";

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

// Slide transition variants
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
  scale: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.4 } },
    exit: { scale: 1.5, opacity: 0, transition: { duration: 0.3 } },
  },
};

// Image loader component
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

/**
 * Presentation Mode - Full screen slide viewer with navigation
 */
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
  const [autoplayInterval, setAutoplayInterval] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const account = useCurrentAccount();
  const [clickSequence, setClickSequence] = useState(0);
  const [animatedElements, setAnimatedElements] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeout = useRef(null);

  // Load presentation
  useEffect(() => {
    const loadPresentation = async () => {
      setIsLoading(true);
      const source = location.state?.source;
      const slideMeta = location.state?.slide;

      console.log('Loading presentation, id:', id, 'source:', source);

      try {
        if (source === 'blockchain' && slideMeta?.contentUrl) {
          console.log('Fetching from Walrus:', slideMeta.contentUrl);
          const data = await fetchFromWalrus(slideMeta.contentUrl);
          if (data) {
            console.log('Successfully fetched from Walrus:', data.title);
            setPresentation(data);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to localStorage
        const slides = JSON.parse(localStorage.getItem("slides") || "[]");
        console.log('Available local slides:', slides.map(s => ({ id: s.id, title: s.title || s.data?.title })));

        const found = slides.find((s) => s.id === id);

        if (found?.data) {
          console.log('Found local presentation:', found.data.title);
          setPresentation(found.data);
        } else {
          console.warn('Presentation not found for id:', id);
          navigate("/my-slide");
        }
      } catch (error) {
        console.error('Error loading presentation:', error);
        // Maybe show alert or navigate back
      } finally {
        setIsLoading(false);
      }
    };

    loadPresentation();
  }, [id, navigate, location.state]);

  // Responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const scaleX = containerWidth / CANVAS_WIDTH;
        const scaleY = containerHeight / CANVAS_HEIGHT;
        setScale(Math.min(scaleX, scaleY));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape" && isFullscreen) exitFullscreen();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, currentIndex, presentation]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoplay || !presentation) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= presentation.slides.length - 1) {
          setIsAutoplay(false);
          return prev;
        }
        return prev + 1;
      });
    }, autoplayInterval * 1000);
    return () => clearInterval(timer);
  }, [isAutoplay, autoplayInterval, presentation]);

  // Hide controls after inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const nextSlide = () => {
    if (presentation && currentIndex < presentation.slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Play animation for an element
  const playAnimation = useCallback((element) => {
    if (!stageRef.current || !element.animation?.enabled) return;

    const node = stageRef.current.findOne(`#${element.id}`);
    if (!node) {
      console.warn('Animation node not found:', element.id);
      return;
    }

    const preset = animationPresets[element.animation.type];
    if (!preset) return;

    // Make element visible (important for both auto-play and click-sequenced)
    node.visible(true);

    // Apply initial state (setup) - this may set opacity to 0
    if (preset.setup) {
      preset.setup(node);
    }

    // Play animation using appropriate method
    if (preset.konvaTween) {
      // Konva Tween-based animation
      const tweenConfig = preset.konvaTween(node, element.animation.duration || 1);
      const tween = new Konva.Tween(tweenConfig);
      tween.play();
    } else if (preset.animate) {
      // Custom animation function (e.g., typewriter)
      // First make sure element is visible
      node.opacity(1);
      preset.animate(node, element.animation.duration || preset.defaultDuration);
    }
  }, []);

  // Start animations when slide changes
  useEffect(() => {
    if (!stageRef.current || !presentation) return;

    const currentSlide = presentation.slides[currentIndex];
    if (!currentSlide?.elements) return;

    // Reset state
    setClickSequence(0);
    setAnimatedElements(new Set());

    // Wait for stage to render, then setup initial visibility and play animations
    setTimeout(() => {
      // First, hide all click-sequenced elements
      currentSlide.elements.forEach(element => {
        if (element.animation?.enabled && element.animation.appearOnClick) {
          const node = stageRef.current.findOne(`#${element.id}`);
          if (node) {
            node.opacity(0);
            node.visible(false);
          }
        }
      });

      // Then, play non-click animations
      const nonClickElements = currentSlide.elements.filter(
        el => el.animation?.enabled && !el.animation.appearOnClick
      );

      nonClickElements.forEach(element => {
        playAnimation(element);
        setAnimatedElements(prev => new Set([...prev, element.id]));
      });
    }, 100); // Reduced delay since we're just manipulating existing nodes
  }, [currentIndex, presentation, playAnimation]);

  // Handle click for sequenced animations
  const handleSlideClick = useCallback(() => {
    if (!presentation) return;

    const currentSlide = presentation.slides[currentIndex];
    if (!currentSlide?.elements) return;

    // Get elements that have click animations and haven't been animated yet
    const clickElements = currentSlide.elements
      .filter(el =>
        el.animation?.enabled &&
        el.animation.appearOnClick &&
        !animatedElements.has(el.id)
      )
      .sort((a, b) => (a.animation.clickOrder || 0) - (b.animation.clickOrder || 0));

    if (clickElements.length === 0) {
      // No more animations, go to next slide
      nextSlide();
      return;
    }

    // Play next animation in sequence
    const nextElement = clickElements[0];
    playAnimation(nextElement);
    setAnimatedElements(prev => new Set([...prev, nextElement.id]));
    setClickSequence(prev => prev + 1);
  }, [presentation, currentIndex, clickSequence, playAnimation]);

  const renderElement = (element) => {
    switch (element.type) {
      case "rect":
        return (
          <Rect
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            cornerRadius={element.cornerRadius}
            rotation={element.rotation || 0}
          />
        );
      case "circle":
        return (
          <Circle
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation || 0}
          />
        );
      case "line":
        return (
          <Line
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            points={element.points}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            lineCap="round"
            lineJoin="round"
            rotation={element.rotation || 0}
          />
        );
      case "text":
        return (
          <Text
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            text={element.text}
            fontSize={element.fontSize}
            fontFamily={element.fontFamily}
            fill={element.fill}
            width={element.width}
            align={element.align}
            rotation={element.rotation || 0}
          />
        );
      case "image":
        return <URLImage key={element.id} element={element} />;
      default:
        return null;
    }
  };

  if (isLoading || !presentation) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-white text-xl">
            {isLoading ? 'Loading content from blockchain...' : 'Preparing presentation...'}
          </div>
        </div>
      </div>
    );
  }

  const currentSlide = presentation.slides[currentIndex];
  const transitionVariant = slideTransitions[currentSlide?.transition] || slideTransitions.fade;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black/95 flex items-center justify-center relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={transitionVariant.initial}
          animate={transitionVariant.animate}
          exit={transitionVariant.exit}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Stage
            ref={stageRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            scaleX={scale}
            scaleY={scale}
            style={{ background: currentSlide?.background || '#1a1a2e' }}
            onClick={handleSlideClick}
            onTap={handleSlideClick}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                fill={currentSlide?.background || "#1a1a2e"}
                listening={false}
              />
              {currentSlide?.elements?.map(renderElement)}
            </Layer>
          </Stage>
        </motion.div>
      </AnimatePresence>

      {/* Access Management Modal */}
      {location.state?.slide && (
        <ManageAccessModal
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          slide={location.state.slide}
        />
      )}

      {/* Navigation Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md rounded-full px-6 py-3"
        >
          {/* Previous */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="cursor-pointer p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Slide Counter */}
          <div className="text-white text-sm font-medium px-2">
            {currentIndex + 1} / {presentation.slides.length}
          </div>

          {/* Next */}
          <button
            onClick={nextSlide}
            disabled={currentIndex >= presentation.slides.length - 1}
            className="cursor-pointer p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20" />

          {/* Autoplay */}
          <button
            onClick={() => setIsAutoplay(!isAutoplay)}
            className={`cursor-pointer p-2 rounded-full transition-colors ${isAutoplay ? "bg-blue-600 text-white" : "hover:bg-white/10 text-white"
              }`}
            title={isAutoplay ? "Stop Autoplay" : "Start Autoplay"}
          >
            {isAutoplay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="cursor-pointer p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Manage Access (Owner Only) */}
          {location.state?.slide?.isOwner && location.state?.slide?.suiObjectId && (
            <button
              onClick={() => setShowAccessModal(true)}
              className="cursor-pointer p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              title="Manage Access"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="cursor-pointer p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {/* Exit */}
          <button
            onClick={() => navigate("/my-slide")}
            className="cursor-pointer p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-8 right-8 bg-black/70 backdrop-blur-md rounded-lg p-4 text-white">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Autoplay Interval (seconds):</span>
              <input
                type="number"
                min="1"
                max="60"
                value={autoplayInterval}
                onChange={(e) => setAutoplayInterval(parseInt(e.target.value) || 5)}
                className="w-16 px-2 py-1 bg-white/10 rounded text-center"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slide;

