import { Palette, Film, Image } from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';

const backgroundColors = [
  '#1a1a2e',
  '#0f172a',
  '#18181b',
  '#1e1b4b',
  '#14532d',
  '#7f1d1d',
  '#78350f',
  '#ffffff',
];

const transitions = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade' },
  { id: 'pushLeft', label: 'Push Left' },
  { id: 'pushRight', label: 'Push Right' },
  { id: 'scale', label: 'Scale' },
];

/**
 * Slide toolbar - shown when nothing is selected
 */
export const SlideToolbar = () => {
  const {
    slides,
    currentSlideIndex,
    setSlideBackground,
    setSlideTransition,
    setSlideBackgroundImage,
  } = useSlideStore();

  const currentSlide = slides[currentSlideIndex];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSlideBackgroundImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
      {/* Background Color */}
      <div className="flex items-center gap-2 px-2">
        <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Background
        </span>
        <div className="flex items-center gap-1">
          {backgroundColors.map((color) => (
            <button
              key={color}
              onClick={() => setSlideBackground(color)}
              className={`cursor-pointer w-6 h-6 rounded border-2 transition-all ${currentSlide?.background === color
                  ? 'border-blue-500 scale-110 shadow-sm'
                  : 'border-gray-100 dark:border-transparent hover:border-blue-300 dark:hover:border-white/30'
                }`}
              style={{ background: color }}
            />
          ))}
          <input
            type="color"
            value={currentSlide?.background || '#1a1a2e'}
            onChange={(e) => setSlideBackground(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
            title="Custom Color"
          />
          {/* Upload Background Image */}
          <label
            className="w-6 h-6 rounded border-2 border-gray-100 dark:border-transparent hover:border-blue-300 dark:hover:border-white/30 flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-700"
            title="Upload Background Image"
          >
            <Image className="w-4 h-4 text-gray-400" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

      {/* Transition */}
      <div className="flex items-center gap-2 px-2">
        <Film className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Transition
        </span>
        <select
          value={currentSlide?.transition || 'fade'}
          onChange={(e) => setSlideTransition(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          {transitions.map((t) => (
            <option
              key={t.id}
              value={t.id}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SlideToolbar;
