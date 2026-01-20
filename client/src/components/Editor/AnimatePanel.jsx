import { Play, Clock, MousePointer, Sparkles, Type, ArrowUp, MoveHorizontal, Circle, Maximize2, Square, Focus, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { animationPresets } from './animationPresets';
import { useSlideStore } from '../../store/useSlideStore';
import { ClickOrderModal } from './ClickOrderModal';

// Icon mapping for animation presets
const iconMap = {
    Type,
    ArrowUp,
    MoveHorizontal,
    Circle,
    Maximize2,
    Square,
    Sparkles,
    Focus,
};

/**
 * Animate Panel - Canva-style animations sidebar
 */
export const AnimatePanel = () => {
    const [appearOnClick, setAppearOnClick] = useState(false);
    const [duration, setDuration] = useState(1);
    const [showClickOrderModal, setShowClickOrderModal] = useState(false);
    const runningAnimationRef = useRef(null); // Track running animation
    const resetTimeoutRef = useRef(null); // Track reset timeout
    const { selectedId, updateElement, slides, currentSlideIndex } = useSlideStore();

    const currentSlide = slides[currentSlideIndex];
    const selectedElement = currentSlide?.elements?.find(el => el.id === selectedId);

    // Load animation settings from selected element
    useEffect(() => {
        if (selectedElement?.animation?.enabled) {
            setDuration(selectedElement.animation.duration || 1);
            setAppearOnClick(selectedElement.animation.appearOnClick || false);
        } else {
            // Reset to defaults when no animation or switching to element without animation
            setDuration(1);
            setAppearOnClick(false);
        }
    }, [selectedId, selectedElement?.animation]);

    const handleApplyAnimation = (presetKey) => {
        if (!selectedId) {
            alert('Please select an element first');
            return;
        }

        const preset = animationPresets[presetKey];

        // Check if text-only animation is applied to non-text element
        if (preset.type === 'text-only' && selectedElement?.type !== 'text') {
            alert('This animation only works with text elements');
            return;
        }

        // Get next click order if appearOnClick is enabled
        let clickOrder = null;
        if (appearOnClick) {
            // Find highest click order in current slide
            const animatedElements = currentSlide?.elements?.filter(el =>
                el.animation?.enabled && el.animation?.appearOnClick
            ) || [];

            const maxOrder = animatedElements.reduce((max, el) =>
                Math.max(max, el.animation?.clickOrder || 0), 0
            );

            clickOrder = maxOrder + 1;
        }

        // Update element with animation data
        updateElement(selectedId, {
            animation: {
                type: presetKey,
                duration: duration,
                appearOnClick: appearOnClick,
                clickOrder: clickOrder,
                enabled: true,
            },
        });

        console.log('✅ Animation applied:', {
            elementId: selectedId,
            animationType: presetKey,
            duration,
            appearOnClick,
            clickOrder
        });
    };

    const handlePreview = (presetKey) => {
        if (!selectedId) return;

        // Cancel any running animation first
        if (runningAnimationRef.current) {
            cancelAnimationFrame(runningAnimationRef.current);
            runningAnimationRef.current = null;
        }

        // Clear any pending reset timeout
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
            resetTimeoutRef.current = null;
        }

        // Find the Konva node
        const stage = window.__slideStage;
        if (!stage) {
            console.warn('Stage not found');
            return;
        }

        const node = stage.findOne(`#${selectedId}`);
        if (!node) {
            console.warn('Node not found:', selectedId);
            return;
        }

        const preset = animationPresets[presetKey];
        const layer = node.getLayer();

        // Get element's ACTUAL current state from store (not animated state)
        const currentSlide = slides[currentSlideIndex];
        const element = currentSlide?.elements?.find(el => el.id === selectedId);

        if (!element) return;

        // The TRUE original state from the store
        const originalState = {
            x: element.x,
            y: element.y,
            scaleX: element.scaleX || 1,
            scaleY: element.scaleY || 1,
            opacity: element.opacity ?? 1,
            rotation: element.rotation || 0,
        };

        // IMMEDIATE RESET to original state before starting new animation
        // This prevents objects from staying in weird states when rapidly hovering
        node.x(originalState.x);
        node.y(originalState.y);
        node.scaleX(originalState.scaleX);
        node.scaleY(originalState.scaleY);
        node.opacity(originalState.opacity);
        node.rotation(originalState.rotation);
        layer?.batchDraw();


        // Animation helper using requestAnimationFrame
        const animate = (fromValues, toValues, durationMs, easingFn = (t) => t) => {
            const startTime = performance.now();

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / durationMs, 1);
                const eased = easingFn(progress);

                // Update node properties
                Object.keys(toValues).forEach(key => {
                    const from = fromValues[key];
                    const to = toValues[key];
                    const current = from + (to - from) * eased;
                    node[key](current);
                });

                layer?.batchDraw();

                if (progress < 1) {
                    runningAnimationRef.current = requestAnimationFrame(step);
                } else {
                    runningAnimationRef.current = null;
                    // Animation complete - reset to original
                    resetTimeoutRef.current = setTimeout(() => {
                        node.x(originalState.x);
                        node.y(originalState.y);
                        node.scaleX(originalState.scaleX);
                        node.scaleY(originalState.scaleY);
                        node.opacity(originalState.opacity);
                        node.rotation(originalState.rotation);
                        layer?.batchDraw();
                        resetTimeoutRef.current = null;
                    }, 200);
                }
            };

            runningAnimationRef.current = requestAnimationFrame(step);
        };

        // Easing functions
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const easeOutElastic = (t) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        };
        const easeOutBack = (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };

        const durationMs = duration * 1000;

        // Apply animation based on preset type
        switch (presetKey) {
            case 'ascend':
                animate(
                    { y: originalState.y + 50, opacity: 0 },
                    { y: originalState.y, opacity: originalState.opacity },
                    durationMs,
                    easeOutCubic
                );
                break;

            case 'shift':
                animate(
                    { x: originalState.x - 100, opacity: 0 },
                    { x: originalState.x, opacity: originalState.opacity },
                    durationMs,
                    easeOutCubic
                );
                break;

            case 'bounce':
                node.scaleX(0.3);
                node.scaleY(0.3);
                node.opacity(0);
                layer?.batchDraw();
                animate(
                    { scaleX: 0.3, scaleY: 0.3, opacity: 0 },
                    { scaleX: originalState.scaleX, scaleY: originalState.scaleY, opacity: originalState.opacity },
                    durationMs,
                    easeOutElastic
                );
                break;

            case 'merge':
                node.scaleX(0);
                node.scaleY(0);
                node.opacity(0);
                layer?.batchDraw();
                animate(
                    { scaleX: 0, scaleY: 0, opacity: 0 },
                    { scaleX: originalState.scaleX, scaleY: originalState.scaleY, opacity: originalState.opacity },
                    durationMs,
                    easeOutBack
                );
                break;

            case 'block':
                node.scaleX(0);
                node.opacity(0);
                layer?.batchDraw();
                animate(
                    { scaleX: 0, opacity: 0 },
                    { scaleX: originalState.scaleX, opacity: originalState.opacity },
                    durationMs,
                    easeOutCubic
                );
                break;

            case 'burst':
                node.scaleX(0.1);
                node.scaleY(0.1);
                node.rotation((originalState.rotation || 0) - 180);
                node.opacity(0);
                layer?.batchDraw();
                animate(
                    { scaleX: 0.1, scaleY: 0.1, rotation: (originalState.rotation || 0) - 180, opacity: 0 },
                    { scaleX: originalState.scaleX, scaleY: originalState.scaleY, rotation: originalState.rotation || 0, opacity: originalState.opacity },
                    durationMs,
                    easeOutBack
                );
                break;

            case 'clarify':
                animate(
                    { opacity: 0.3 },
                    { opacity: originalState.opacity },
                    durationMs * 1.2,
                    (t) => t
                );
                break;

            case 'typewriter':
                // Typewriter is text-only - skip for now
                console.log('Typewriter animation requires special text handling');
                break;

            default:
                console.warn('Unknown animation:', presetKey);
        }
    };


    return (
        <div className="flex flex-col h-full">
            {/* Click Order Modal */}
            <ClickOrderModal
                isOpen={showClickOrderModal}
                onClose={() => setShowClickOrderModal(false)}
            />

            {/* Selected Element Info */}
            <div className="p-3 border-b border-white/5">
                {selectedId ? (
                    <div className="bg-gray-800/50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Selected element:</p>
                        <p className="text-sm font-medium capitalize">{selectedElement?.type || 'Unknown'}</p>
                        {selectedElement?.animation?.enabled && (
                            <p className="text-xs text-purple-400 mt-1">
                                ✓ {animationPresets[selectedElement.animation.type]?.name} applied
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-xs text-gray-500 text-center py-2">
                        Select an element to apply animations
                    </div>
                )}
            </div>

            {/* Animation Controls */}
            <div className="p-3 border-b border-white/5 space-y-3">
                {/* Appear On Click Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MousePointer className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium">Appear: on click</span>
                    </div>
                    <button
                        onClick={() => setAppearOnClick(!appearOnClick)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${appearOnClick ? 'bg-purple-600' : 'bg-gray-700'
                            }`}
                    >
                        <div
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${appearOnClick ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                        />
                    </button>
                </div>

                {/* Click Order Button - Shows when appearOnClick is enabled */}
                {appearOnClick && (
                    <button
                        onClick={() => setShowClickOrderModal(true)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors mt-2"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span className="text-xs font-medium">Click Order</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Duration Slider */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium">Duration</span>
                        </div>
                        <span className="text-xs text-gray-400">{duration}s</span>
                    </div>
                    <input
                        type="range"
                        min="0.3"
                        max="3"
                        step="0.1"
                        value={duration}
                        onChange={(e) => setDuration(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
                    />
                </div>
            </div>

            {/* Animation Presets */}
            <div className="flex-1 overflow-y-auto p-3">
                <h3 className="text-xs font-semibold text-gray-400 mb-3">Suggested</h3>

                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(animationPresets).map(([key, preset]) => {
                        const Icon = iconMap[preset.icon] || Sparkles;
                        const isActive = selectedElement?.animation?.enabled && selectedElement.animation.type === key;

                        return (
                            <div key={key} className="space-y-1">
                                <button
                                    onClick={() => handleApplyAnimation(key)}
                                    onMouseEnter={() => selectedId && handlePreview(key)}
                                    disabled={!selectedId}
                                    className={`w-full aspect-square rounded-lg border transition-all group relative overflow-hidden ${isActive
                                            ? 'border-purple-500 bg-purple-900/30'
                                            : selectedId
                                                ? 'border-white/10 hover:border-purple-500 bg-gray-800 hover:bg-gray-700'
                                                : 'border-white/5 bg-gray-900 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon className={`w-8 h-8 ${isActive
                                                ? 'text-purple-400'
                                                : selectedId ? 'text-gray-400 group-hover:text-purple-400' : 'text-gray-600'
                                            }`} />
                                    </div>

                                    {/* Active Checkmark */}
                                    {isActive && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    {selectedId && !isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </button>

                                {/* Preset Name & Preview */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium truncate">{preset.name}</span>
                                    <button
                                        onClick={() => handlePreview(key)}
                                        disabled={!selectedId}
                                        className={`p-1 rounded ${selectedId
                                            ? 'hover:bg-gray-700 text-gray-400 hover:text-purple-400'
                                            : 'text-gray-600 cursor-not-allowed'
                                            }`}
                                        title="Preview animation"
                                    >
                                        <Play className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Description of selected animation */}
                <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                        Select an element, choose an animation, and adjust the duration.
                        Click the play icon to preview the animation before applying.
                    </p>
                </div>
            </div>

            {/* Remove Animation Button */}
            {selectedElement?.animation?.enabled && (
                <div className="p-3 border-t border-white/5">
                    <button
                        onClick={() => updateElement(selectedId, { animation: { enabled: false } })}
                        className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
                    >
                        Remove animation
                    </button>
                </div>
            )}
        </div>
    );
};

export default AnimatePanel;
