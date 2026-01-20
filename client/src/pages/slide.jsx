import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Circle, Line, Text } from 'react-konva';

// Canvas dimensions (same as editor)
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

/**
 * Slide Presentation View (Read-Only Mode)
 */
export const Slide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slideData, setSlideData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);

  // Load slide data
  useEffect(() => {
    setIsLoading(true);
    const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
    const slide = savedSlides.find((s) => s.id === id);

    if (slide) {
      setSlideData(slide);
    }
    setIsLoading(false);
  }, [id]);

  // Handle window resize for responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (isFullscreen) {
        const scaleX = window.innerWidth / CANVAS_WIDTH;
        const scaleY = window.innerHeight / CANVAS_HEIGHT;
        setScale(Math.min(scaleX, scaleY));
      } else {
        const containerWidth = Math.min(window.innerWidth - 100, 1200);
        setScale(containerWidth / CANVAS_WIDTH);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle ESC to exit fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        navigate('/my-slide');
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const renderElement = (element) => {
    const commonProps = {
      key: element.id,
      x: element.x,
      y: element.y,
      rotation: element.rotation || 0,
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
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!slideData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-4">Slide Not Found</h2>
        <button
          onClick={() => navigate('/my-slide')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors"
        >
          Go to My Slides
        </button>
      </div>
    );
  }

  const elements = slideData.data?.elements || [];

  return (
    <div className={`min-h-screen bg-black flex flex-col items-center justify-center ${isFullscreen ? 'p-0' : 'p-8'}`}>
      {/* Controls (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="fixed top-4 left-4 right-4 flex items-center justify-between z-50">
          <button
            onClick={() => navigate('/my-slide')}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h1 className="text-lg font-semibold text-white">{slideData.title}</h1>

          <button
            onClick={toggleFullscreen}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors"
            title="Press F for fullscreen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      )}

      {/* Stage */}
      <div
        className="shadow-2xl rounded-lg overflow-hidden"
        style={{
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
          boxShadow: isFullscreen ? 'none' : '0 0 100px rgba(59, 130, 246, 0.1)',
        }}
      >
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          scaleX={scale}
          scaleY={scale}
          style={{ background: '#1a1a2e' }}
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
          </Layer>
        </Stage>
      </div>

      {/* Fullscreen hint */}
      {!isFullscreen && (
        <p className="text-gray-500 text-sm mt-4">
          Press <kbd className="px-2 py-1 bg-gray-800 rounded">F</kbd> for fullscreen
        </p>
      )}
    </div>
  );
};
