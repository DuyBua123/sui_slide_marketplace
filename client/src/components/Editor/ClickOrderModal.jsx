import { X, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { useSlideStore } from '../../store/useSlideStore';

/**
 * Click Order Modal - Manage animation click sequence
 */
export const ClickOrderModal = ({ isOpen, onClose }) => {
    const { slides, currentSlideIndex, updateElement } = useSlideStore();
    const currentSlide = slides[currentSlideIndex];

    // Get elements with appearOnClick animations
    const clickOrderElements = (currentSlide?.elements || [])
        .filter(el => el.animation?.enabled && el.animation?.appearOnClick)
        .sort((a, b) => (a.animation?.clickOrder || 0) - (b.animation?.clickOrder || 0));

    const [localOrder, setLocalOrder] = useState(clickOrderElements);

    const handleReorder = (fromIndex, toIndex) => {
        const newOrder = [...localOrder];
        const [moved] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, moved);
        setLocalOrder(newOrder);
    };

    const handleSave = () => {
        // Update click orders
        localOrder.forEach((el, index) => {
            updateElement(el.id, {
                animation: {
                    ...el.animation,
                    clickOrder: index + 1,
                },
            });
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg w-96 max-h-[600px] flex flex-col border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold">Click Order</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {localOrder.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No elements with "Appear on click" enabled
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {localOrder.map((element, index) => (
                                <div
                                    key={element.id}
                                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-white/5 hover:border-purple-500/50 transition-colors"
                                >
                                    {/* Drag Handle */}
                                    <button className="cursor-move text-gray-500 hover:text-gray-300">
                                        <GripVertical className="w-5 h-5" />
                                    </button>

                                    {/* Order Number */}
                                    <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full text-sm font-bold">
                                        {index + 1}
                                    </div>

                                    {/* Element Info */}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium capitalize">
                                            {element.type}
                                            {element.text && `: "${element.text.substring(0, 30)}${element.text.length > 30 ? '...' : ''}"`}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Animation: {element.animation?.type || 'Unknown'}
                                        </p>
                                    </div>

                                    {/* Reorder Buttons */}
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => handleReorder(index, Math.max(0, index - 1))}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleReorder(index, Math.min(localOrder.length - 1, index + 1))}
                                            disabled={index === localOrder.length - 1}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 p-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors font-medium"
                    >
                        Save Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClickOrderModal;
