import {
  Home,
  User,
  Settings,
  Mail,
  Phone,
  Calendar,
  FileText,
  Folder,
  Download,
  Upload,
  Save,
  Trash2,
} from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";

const icons = [
  { id: "home", label: "Home", icon: Home },
  { id: "user", label: "User", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "mail", label: "Mail", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "file", label: "File", icon: FileText },
  { id: "folder", label: "Folder", icon: Folder },
  { id: "download", label: "Download", icon: Download },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "save", label: "Save", icon: Save },
  { id: "trash", label: "Trash", icon: Trash2 },
];

/**
 * Icons Library - Basic icon set
 */
export const IconsLibrary = () => {
  const { addElement } = useSlideStore();

  const handleAddIcon = (icon) => {
    // For now, we'll add as text noting this is a placeholder
    // In a real implementation, you'd convert icons to SVG and add as images
    addElement("text", {
      text: `[${icon.label} Icon]`,
      fontSize: 24,
      fill: "#8b5cf6",
      x: 400,
      y: 250,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">
          Abstract Icons
        </h3>
        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
          {icons.length} items
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {icons.map((icon) => {
          const Icon = icon.icon;
          return (
            <button
              key={icon.id}
              onClick={() => handleAddIcon(icon)}
              className="cursor-pointer group aspect-square rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-md dark:hover:shadow-none transition-all duration-200 flex flex-col items-center justify-center gap-2 p-2"
            >
              {/* Icon Container */}
              <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 group-hover:bg-white dark:group-hover:bg-purple-900/20 transition-colors shadow-inner">
                <Icon className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300" />
              </div>

              <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white truncate w-full px-1 text-center transition-colors">
                {icon.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IconsLibrary;
