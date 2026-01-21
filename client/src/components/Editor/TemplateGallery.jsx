import { useState } from 'react';
import { Search, Sparkles, Layout } from 'lucide-react';
import templates, { templateCategories } from './templates';
import { useSlideStore } from '../../store/useSlideStore';

/**
 * Template Gallery - Display and apply templates
 */
export const TemplateGallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { setSlides } = useSlideStore();

    const filteredTemplates = selectedCategory === 'All'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    const handleApplyTemplate = (template) => {
        // Apply template by setting the slides
        setSlides(template.slides.map((slide, index) => ({
            id: `slide-${Date.now()}-${index}`,
            ...slide,
        })));
    };

    return (
        <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {templateCategories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === category
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => handleApplyTemplate(template)}
                        className="group aspect-[3/2] rounded-lg overflow-hidden border border-white/10 hover:border-purple-500 transition-all relative"
                    >
                        {/* Thumbnail */}
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <Layout className="w-12 h-12 text-gray-600" />
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                            <span className="text-xs font-medium">Use template</span>
                            <span className="text-[10px] text-gray-400">Click to apply</span>
                        </div>

                        {/* Template Name */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-xs font-medium">{template.name}</p>
                            <p className="text-[9px] text-gray-400">{template.category}</p>
                        </div>
                    </button>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-500">
                    No templates found in this category
                </div>
            )}
        </div>
    );
};

export default TemplateGallery;
