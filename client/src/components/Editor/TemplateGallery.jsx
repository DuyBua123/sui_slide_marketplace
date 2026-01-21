import { useState } from "react";
import { Search, Sparkles, Layout, Plus } from "lucide-react";
import templates, { templateCategories } from "./templates";
import { useSlideStore } from "../../store/useSlideStore";

/**
 * Template Gallery - Display and apply templates
 */
export const TemplateGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { setSlides } = useSlideStore();

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleApplyTemplate = (template) => {
    // Apply template by setting the slides
    setSlides(
      template.slides.map((slide, index) => ({
        id: `slide-${Date.now()}-${index}`,
        ...slide,
      })),
    );
  };

  return (
    <div className="space-y-6">
      {/* Category Filter - Scrollable horizontally if many categories */}
      <div className="flex gap-2 flex-wrap">
        {templateCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`cursor-pointer px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 ${
              selectedCategory === category
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleApplyTemplate(template)}
            className="cursor-pointer group aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-white/5 hover:border-purple-500 dark:hover:border-purple-500 transition-all relative bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:shadow-purple-500/10"
          >
            {/* Thumbnail Placeholder / Image */}
            <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center transition-colors group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10">
              <Layout className="w-10 h-10 text-gray-300 dark:text-gray-700 group-hover:text-purple-300 dark:group-hover:text-purple-700 transition-transform group-hover:scale-110" />
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-purple-600/90 dark:bg-purple-900/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
              <div className="bg-white text-purple-600 p-2 rounded-full shadow-lg">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black text-white uppercase tracking-tighter">
                Apply Template
              </span>
            </div>

            {/* Template Info (Visible by default in Light Mode for clarity) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md border-t border-gray-100 dark:border-white/5">
              <p className="text-[11px] font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">
                {template.name}
              </p>
              <p className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase opacity-80">
                {template.category}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5">
          <div className="bg-gray-50 dark:bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            No templates found
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
