import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, X, Maximize, Minimize,
  Play, Pause, Settings
} from 'lucide-react';

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
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.4 } },
  },
  pushRight: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.4 } },
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
    img.crossOrigin = 'anonymous';
    img.src = element.src;
    img.onload = () => setImage(img);
  }, [element.src]);

  if (!image) return null;

  return (
    <KonvaImage
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
  const containerRef = useRef(null);
  const [presentation, setPresentation] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [autoplayInterval, setAutoplayInterval] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeout = useRef(null);

  // Load presentation
  useEffect(() => {
    const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
    const slide = savedSlides.find((s) => s.id === id);
    if (slide?.data) {
      setPresentation(slide.data);
    }
  }, [id]);

  // Calculate scale for fullscreen
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (container) {
        const scaleX = window.innerWidth / CANVAS_WIDTH;
        const scaleY = window.innerHeight / CANVAS_HEIGHT;
        setScale(Math.min(scaleX, scaleY) * 0.95);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          nextSlide();
          break;
        case 'ArrowLeft':
          prevSlide();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            navigate(-1);
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

  const renderElement = (element) => {
    switch (element.type) {
      case 'rect':
        return (
          <Rect
            key={element.id}
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
      case 'circle':
        return (
          <Circle
            key={element.id}
            x={element.x}
            y={element.y}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation || 0}
          />
        );
      case 'line':
        return (
          <Line
            key={element.id}
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
      case 'text':
        return (
          <Text
            key={element.id}
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
      case 'image':
        return <URLImage key={element.id} element={element} />;
      default:
        return null;
    }
  };

  if (!presentation) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading presentation...</div>
      </div>
    );
  }

  const slides = presentation.slides || [];
  const currentSlide = slides[currentIndex];
  const transition = currentSlide?.transition || 'fade';
  const transitionVariant = slideTransitions[transition] || slideTransitions.fade;

  return (
    <div
      ref={containerRef}
      className="h-screen bg-black flex items-center justify-center relative overflow-hidden"
    >
      {/* Slide Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={transitionVariant.initial}
          animate={transitionVariant.animate}
          exit={transitionVariant.exit}
          className="rounded-lg overflow-hidden shadow-2xl"
          style={{
            width: CANVAS_WIDTH * scale,
            height: CANVAS_HEIGHT * scale,
          }}
        >
          <Stage
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            scaleX={scale}
            scaleY={scale}
            style={{ background: currentSlide?.background || '#1a1a2e' }}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                fill={currentSlide?.background || '#1a1a2e'}
              />
              {currentSlide?.elements?.map(renderElement)}
            </Layer>
          </Stage>
        </motion.div>
      </AnimatePresence>

      {/* Controls Overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-auto bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white font-medium">
            {presentation.title || 'Presentation'}
          </div>
          <div className="flex items-center gap-2">
            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            {/* Close */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-16 right-4 bg-gray-900 border border-white/10 rounded-xl p-4 pointer-events-auto w-64">
            <h3 className="text-sm font-medium mb-3">Autoplay Settings</h3>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isAutoplay ? 'bg-green-600' : 'bg-white/10 hover:bg-white/20'
                  }`}
              >
                {isAutoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isAutoplay ? 'Pause' : 'Autoplay'}
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Interval (seconds)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={autoplayInterval}
                onChange={(e) => setAutoplayInterval(parseInt(e.target.value) || 5)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors pointer-events-auto disabled:opacity-30"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentIndex >= slides.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors pointer-events-auto disabled:opacity-30"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Bottom Progress */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                    ? 'bg-blue-500 scale-125'
                    : 'bg-white/30 hover:bg-white/50'
                  }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-400">
            {currentIndex + 1} / {slides.length}
          </div>
        </div>
      </motion.div>

      {/* Keyboard hint */}
      {showControls && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs text-gray-500">
          ← → Navigate • F Fullscreen • ESC Exit
        </div>
      )}
    </div>
  );
};

export default Slide;
