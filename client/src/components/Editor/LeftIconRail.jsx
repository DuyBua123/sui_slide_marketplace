import {
  LayoutTemplate,
  Shapes,
  Type,
  Palette,
  Upload,
  PenTool,
  BarChart3,
} from "lucide-react";

/**
 * Left Icon Rail - Slim 48px sidebar matching Canva
 */
export const LeftIconRail = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "design", icon: LayoutTemplate, label: "Design" },
    { id: "elements", icon: Shapes, label: "Elements" },
    { id: "text", icon: Type, label: "Text" },
    { id: "brand", icon: Palette, label: "Brand" },
    { id: "uploads", icon: Upload, label: "Uploads" },
    { id: "charts", icon: BarChart3, label: "Charts" },
    { id: "draw", icon: PenTool, label: "Draw" },
  ];

  return (
    <div className="w-12 bg-white dark:bg-[#0d0d0d] border-r border-gray-200 dark:border-white/5 flex flex-col items-center py-3 gap-1 transition-colors">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`cursor-pointer group relative w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              isActive
                ? "bg-purple-50 dark:bg-white/10 text-purple-600 dark:text-white shadow-sm"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            title={tab.label}
          >
            <Icon className="w-5 h-5" />

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-medium rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] transition-opacity border border-white/10">
              {tab.label}
              {/* Tooltip Arrow */}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 border-l border-b border-white/10 dark:border-none rotate-45" />
            </div>

            {/* Active Indicator Line */}
            {isActive && (
              <div className="absolute left-0 w-0.5 h-6 bg-purple-500 rounded-r-full shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default LeftIconRail;
