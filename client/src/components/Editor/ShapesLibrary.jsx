import { useState } from "react";
import {
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Diamond,
  Hexagon,
  Octagon,
  Pentagon,
  ArrowRight,
  ArrowDown,
  Crown,
  Lock,
} from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";
import { premiumShapes } from "./premiumShapes";
import { usePremiumStatus } from "../../hooks/usePremiumStatus";
import { PremiumModal } from "../PremiumModal";

const shapes = [
  {
    id: "circle",
    label: "Circle",
    icon: Circle,
    create: () => ({ type: "circle", radius: 50, fill: "#8b5cf6", x: 400, y: 250 }),
  },
  {
    id: "square",
    label: "Square",
    icon: Square,
    create: () => ({ type: "rect", width: 100, height: 100, fill: "#3b82f6", x: 400, y: 200 }),
  },
  {
    id: "rectangle",
    label: "Rectangle",
    icon: Square,
    create: () => ({ type: "rect", width: 150, height: 80, fill: "#10b981", x: 400, y: 220 }),
  },
  {
    id: "triangle",
    label: "Triangle",
    icon: Triangle,
    create: () => ({
      type: "line",
      points: [0, 100, 50, 0, 100, 100, 0, 100],
      fill: "#f59e0b",
      stroke: "#f59e0b",
      strokeWidth: 2,
      closed: true,
      x: 400,
      y: 200,
    }),
  },
  {
    id: "star",
    label: "Star",
    icon: Star,
    create: () => ({
      type: "line",
      points: [50, 0, 61, 35, 98, 35, 68, 57, 79, 91, 50, 70, 21, 91, 32, 57, 2, 35, 39, 35],
      fill: "#fbbf24",
      stroke: "#fbbf24",
      strokeWidth: 2,
      closed: true,
      x: 400,
      y: 200,
    }),
  },
  {
    id: "heart",
    label: "Heart",
    icon: Heart,
    create: () => ({
      type: "line",
      points: [
        50, 30, 35, 15, 20, 15, 10, 25, 10, 40, 50, 80, 90, 40, 90, 25, 80, 15, 65, 15, 50, 30,
      ],
      fill: "#ef4444",
      stroke: "#ef4444",
      strokeWidth: 2,
      closed: true,
      x: 400,
      y: 200,
    }),
  },
  {
    id: "hexagon",
    label: "Hexagon",
    icon: Hexagon,
    create: () => ({
      type: "line",
      points: [50, 0, 93.3, 25, 93.3, 75, 50, 100, 6.7, 75, 6.7, 25],
      fill: "#06b6d4",
      stroke: "#06b6d4",
      strokeWidth: 2,
      closed: true,
      x: 400,
      y: 200,
    }),
  },
  {
    id: "pentagon",
    label: "Pentagon",
    icon: Pentagon,
    create: () => ({
      type: "line",
      points: [50, 0, 95, 38, 79, 100, 21, 100, 5, 38],
      fill: "#8b5cf6",
      stroke: "#8b5cf6",
      strokeWidth: 2,
      closed: true,
      x: 400,
      y: 200,
    }),
  },
  {
    id: "arrow-right",
    label: "Arrow →",
    icon: ArrowRight,
    create: () => ({
      type: "line",
      points: [0, 25, 60, 25, 60, 0, 100, 50, 60, 100, 60, 75, 0, 75],
      fill: "#6366f1",
      stroke: "#6366f1",
      strokeWidth: 2,
      closed: true,
      x: 400,
      y: 200,
    }),
  },
  {
    id: "arrow-down",
    label: "Arrow ↓",
    icon: ArrowDown,
    create: () => ({
      type: "line",
      points: [25, 0, 75, 0, 75, 60, 100, 60, 50, 100, 0, 60, 25, 60],
      fill: "#14b8a6",
      stroke: "#14b8a6",
      strokeWidth: 2,
      closed: true,
      x: 400,
      y: 200,
    }),
  },
  {
    id: "line-horizontal",
    label: "Line —",
    icon: Square,
    create: () => ({
      type: "line",
      points: [0, 0, 150, 0],
      stroke: "#6b7280",
      strokeWidth: 4,
      x: 400,
      y: 270,
    }),
  },
];

// Merge basic shapes with premium shapes
const allShapes = [...shapes, ...premiumShapes];

/**
 * Extended Shapes Library - 10+ shapes + Premium
 */
export const ShapesLibrary = () => {
  const { addElement } = useSlideStore();
  const { isPremium } = usePremiumStatus();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleAddShape = (shape) => {
    // Check if shape is premium and user is not
    if (shape.premium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }

    // Execute the create function to get props
    const elementProps = shape.create ? shape.create() : shape.render();

    // If it's a premium shape from the new file, it might just return props directly or via render() 
    // The previous implementation used 'create', premiumShapes uses 'render'.
    // Let's normalize it.

    addElement(elementProps.type, elementProps);
  };

  return (
    <>
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => setShowPremiumModal(false)}
      />

      <div>
        <h3 className="text-[11px] font-black mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em]">
          Shapes
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {allShapes.map((shape) => {
            const Icon = shape.icon;
            // Check if shape is premium
            const isLocked = shape.premium && !isPremium;

            return (
              <button
                key={shape.id}
                onClick={() => handleAddShape(shape)}
                className={`cursor-pointer group aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 p-3 shadow-sm hover:shadow-xl active:scale-95 relative overflow-hidden ${isLocked
                  ? "border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-900/50 opacity-80"
                  : "border-gray-100 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:shadow-purple-500/10"
                  }`}
              >
                {/* Premium Badge */}
                {shape.premium && (
                  <div className="absolute top-2 right-2 z-10">
                    {isLocked ? (
                      <div className="bg-black/10 dark:bg-white/10 p-1 rounded-full backdrop-blur-sm">
                        <Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </div>
                    ) : (
                      <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                )}

                {/* Icon wrapper */}
                <div className={`p-2 rounded-xl transition-all ${isLocked
                  ? "grayscale opacity-50"
                  : "group-hover:bg-white dark:group-hover:bg-purple-500/20"
                  }`}>
                  {/* Render icon component or string (emoji) */}
                  {typeof Icon === 'string' ? (
                    <span className="text-2xl filter drop-shadow-sm leading-none">{Icon}</span>
                  ) : (
                    <Icon className={`w-7 h-7 transition-colors ${isLocked
                      ? "text-gray-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                      }`} />
                  )}
                </div>

                <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${isLocked
                  ? "text-gray-400"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-purple-700 dark:group-hover:text-purple-300"
                  }`}>
                  {shape.label || shape.name}
                </span>

                {/* Locked Overlay (Optional, but gives better feedback) */}
                {isLocked && (
                  <div className="absolute inset-0 bg-gray-100/10 dark:bg-black/20 z-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ShapesLibrary;
