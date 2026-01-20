/**
 * Animation Presets Configuration
 * 8 Canva-style animation effects for text and elements
 */

import Konva from 'konva';

export const animationPresets = {
    typewriter: {
        name: 'Typewriter',
        description: 'Text appears letter by letter',
        icon: 'Type',
        type: 'text-only',
        defaultDuration: 2,
        animate: (node, duration = 2) => {
            // Typewriter effect for text (character reveal)
            const text = node.text();
            node.text('');
            let index = 0;
            const interval = (duration * 1000) / text.length;

            const timer = setInterval(() => {
                if (index < text.length) {
                    node.text(text.substring(0, index + 1));
                    index++;
                } else {
                    clearInterval(timer);
                }
            }, interval);

            return () => clearInterval(timer);
        },
    },

    ascend: {
        name: 'Ascend',
        description: 'Element slides up while fading in',
        icon: 'ArrowUp',
        type: 'all',
        defaultDuration: 0.8,
        konvaTween: (node, duration = 0.8) => ({
            node,
            duration,
            y: node.y(),
            opacity: 1,
            easing: Konva.Easings.EaseOut,
            onFinish: () => node.opacity(1),
        }),
        setup: (node) => {
            node.y(node.y() + 50);
            node.opacity(0);
        },
    },

    shift: {
        name: 'Shift',
        description: 'Element slides from left or right',
        icon: 'MoveHorizontal',
        type: 'all',
        defaultDuration: 0.6,
        konvaTween: (node, duration = 0.6, direction = 'left') => ({
            node,
            duration,
            x: node.x(),
            opacity: 1,
            easing: Konva.Easings.EaseOut,
        }),
        setup: (node, direction = 'left') => {
            node.x(direction === 'left' ? node.x() - 100 : node.x() + 100);
            node.opacity(0);
        },
    },

    bounce: {
        name: 'Bounce',
        description: 'Element bounces into place',
        icon: 'Circle',
        type: 'all',
        defaultDuration: 1,
        konvaTween: (node, duration = 1) => ({
            node,
            duration,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            easing: Konva.Easings.ElasticEaseOut,
        }),
        setup: (node) => {
            node.scaleX(0.3);
            node.scaleY(0.3);
            node.opacity(0);
        },
    },

    merge: {
        name: 'Merge',
        description: 'Element zooms in from center',
        icon: 'Maximize2',
        type: 'all',
        defaultDuration: 0.7,
        konvaTween: (node, duration = 0.7) => ({
            node,
            duration,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            easing: Konva.Easings.BackEaseOut,
        }),
        setup: (node) => {
            node.scaleX(0);
            node.scaleY(0);
            node.opacity(0);
        },
    },

    block: {
        name: 'Block',
        description: 'Block-style reveal animation',
        icon: 'Square',
        type: 'all',
        defaultDuration: 0.8,
        konvaTween: (node, duration = 0.8) => ({
            node,
            duration,
            scaleX: 1,
            opacity: 1,
            easing: Konva.Easings.EaseInOut,
        }),
        setup: (node) => {
            node.scaleX(0);
            node.opacity(0);
        },
    },

    burst: {
        name: 'Burst',
        description: 'Element bursts outward',
        icon: 'Sparkles',
        type: 'all',
        defaultDuration: 0.9,
        konvaTween: (node, duration = 0.9) => ({
            node,
            duration,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            opacity: 1,
            easing: Konva.Easings.StrongEaseOut,
        }),
        setup: (node) => {
            const originalRotation = node.rotation() || 0;
            node.scaleX(0.1);
            node.scaleY(0.1);
            node.rotation(originalRotation - 180);
            node.opacity(0);
        },
    },

    clarify: {
        name: 'Clarify',
        description: 'Blur to focus effect',
        icon: 'Focus',
        type: 'all',
        defaultDuration: 1.2,
        konvaTween: (node, duration = 1.2) => ({
            node,
            duration,
            opacity: 1,
            // Note: Konva doesn't support blur directly in Tween
            // This would need custom implementation
            easing: Konva.Easings.EaseInOut,
        }),
        setup: (node) => {
            node.opacity(0.3);
        },
    },
};

export const animationCategories = [
    'All',
    'Text',
    'Entrance',
    'Emphasis',
];

export default animationPresets;
