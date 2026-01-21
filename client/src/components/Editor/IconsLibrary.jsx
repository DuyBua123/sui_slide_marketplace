import {
    Home, User, Settings, Mail, Phone, Calendar,
    FileText, Folder, Download, Upload, Save, Trash2
} from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';

const icons = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'user', label: 'User', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'mail', label: 'Mail', icon: Mail },
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'file', label: 'File', icon: FileText },
    { id: 'folder', label: 'Folder', icon: Folder },
    { id: 'download', label: 'Download', icon: Download },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'save', label: 'Save', icon: Save },
    { id: 'trash', label: 'Trash', icon: Trash2 },
];

/**
 * Icons Library - Basic icon set
 */
export const IconsLibrary = () => {
    const { addElement } = useSlideStore();

    const handleAddIcon = (icon) => {
        // For now, we'll add as text noting this is a placeholder
        // In a real implementation, you'd convert icons to SVG and add as images
        addElement('text', {
            text: `[${icon.label} Icon]`,
            fontSize: 24,
            fill: '#8b5cf6',
            x: 400,
            y: 250,
        });
    };

    return (
        <div>
            <h3 className="text-xs font-semibold mb-3">Icons</h3>
            <div className="grid grid-cols-3 gap-2">
                {icons.map((icon) => {
                    const Icon = icon.icon;
                    return (
                        <button
                            key={icon.id}
                            onClick={() => handleAddIcon(icon)}
                            className="group aspect-square rounded-lg border border-white/10 hover:border-purple-500 bg-gray-800/50 hover:bg-gray-800 transition-all flex flex-col items-center justify-center gap-1 p-2"
                        >
                            <Icon className="w-6 h-6 text-gray-400 group-hover:text-purple-400" />
                            <span className="text-[9px] text-gray-400 group-hover:text-white">
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
