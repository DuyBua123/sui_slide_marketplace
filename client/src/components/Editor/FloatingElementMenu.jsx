import { Copy, Trash2, Lock, Unlock, ArrowUpCircle, ArrowDownCircle, MoreHorizontal } from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';

/**
 * Floating Element Menu - appears above selected element (Canva-style)
 */
export const FloatingElementMenu = ({ element, position }) => {
    const { duplicateElement, deleteElement, bringToFront, sendToBack } = useSlideStore();

    if (!element || !position) return null;

    const handleDuplicate = (e) => {
        e.stopPropagation();
        // Create new element with offset position
        const { id, ...elementProps } = element;
        const newElement = {
            ...elementProps,
            x: element.x + 20,
            y: element.y + 20,
        };
        duplicateElement(element.id);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteElement(element.id);
    };

    const handleBringForward = (e) => {
        e.stopPropagation();
        bringToFront(element.id);
    };

    const handleSendBackward = (e) => {
        e.stopPropagation();
        sendToBack(element.id);
    };

    return (
        <div
            className="absolute z-50 pointer-events-auto"
            style={{
                left: `${position.x}px`,
                top: `${position.y - 50}px`, // Position above element
                transform: 'translateX(-50%)',
            }}
        >
            <div className="bg-gray-900 border border-white/20 rounded-lg shadow-2xl flex items-center gap-1 p-1">
                {/* Duplicate */}
                <button
                    onClick={handleDuplicate}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="Duplicate"
                >
                    <Copy className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-white/10" />

                {/* Bring Forward */}
                <button
                    onClick={handleBringForward}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="Bring to Front"
                >
                    <ArrowUpCircle className="w-4 h-4" />
                </button>

                {/* Send Backward */}
                <button
                    onClick={handleSendBackward}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="Send to Back"
                >
                    <ArrowDownCircle className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-white/10" />

                {/* More Options */}
                <button
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="More Options"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Arrow pointing down to element */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/20" />
            </div>
        </div>
    );
};

export default FloatingElementMenu;
