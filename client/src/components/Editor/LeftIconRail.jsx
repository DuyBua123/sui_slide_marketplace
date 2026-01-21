import {
    LayoutTemplate, Shapes, Type, Palette, Upload, PenTool, BarChart3
} from 'lucide-react';

/**
 * Left Icon Rail - Slim 48px sidebar matching Canva
 */
export const LeftIconRail = ({ activeTab, onTabChange }) => {
    const tabs = [
        // { id: 'design', icon: LayoutTemplate, label: 'Design' },
        { id: 'elements', icon: Shapes, label: 'Elements' },
        { id: 'text', icon: Type, label: 'Text' },
        // { id: 'brand', icon: Palette, label: 'Brand' },
        { id: 'uploads', icon: Upload, label: 'Uploads' },
        // { id: 'charts', icon: BarChart3, label: 'Charts' },
        // { id: 'draw', icon: PenTool, label: 'Draw' },
    ];

    return (
        <div className="w-12 bg-[#0d0d0d] border-r border-white/5 flex flex-col items-center py-3 gap-1">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`group relative w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isActive
                            ? 'bg-white/10 text-white'
                            : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                            }`}
                        title={tab.label}
                    >
                        <Icon className="w-5 h-5" />

                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                            {tab.label}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default LeftIconRail;
