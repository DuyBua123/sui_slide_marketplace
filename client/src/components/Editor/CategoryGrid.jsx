import {
  Square,
  Circle,
  Palette,
  Image,
  Video,
  Box,
  FileText,
  Wand2,
  Music,
  Smile,
} from "lucide-react";

const categories = [
  { id: "shapes", label: "Shapes", icon: Square, color: "bg-blue-500" },
  { id: "graphics", label: "Graphics", icon: Palette, color: "bg-purple-500" },
  { id: "photos", label: "Photos", icon: Image, color: "bg-green-500" },
  { id: "videos", label: "Videos", icon: Video, color: "bg-red-500" },
  { id: "3d", label: "3D", icon: Box, color: "bg-cyan-500" },
  { id: "forms", label: "Forms", icon: FileText, color: "bg-yellow-500" },
  { id: "animations", label: "Animations", icon: Wand2, color: "bg-pink-500" },
  { id: "audio", label: "Audio", icon: Music, color: "bg-indigo-500" },
  { id: "stickers", label: "Stickers", icon: Smile, color: "bg-orange-500" },
];

/**
 * Category Grid - 3x3 grid of element categories
 */
export const CategoryGrid = ({ onSelectCategory }) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="cursor-pointer group aspect-square rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-500 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-all flex flex-col items-center justify-center gap-2 p-3 active:scale-95"
          >
            {/* Icon Container */}
            <div
              className={`${category.color} w-10 h-10 rounded-lg flex items-center justify-center shadow-md shadow-inner group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>

            {/* Category Label */}
            <span className="text-[10px] text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-white font-bold text-center uppercase tracking-tight transition-colors">
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
