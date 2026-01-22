/**
 * Premium Animations - Advanced animations only for premium users
 */

export const premiumAnimations = {
    '3d-flip': {
        name: '3D Flip',
        icon: '🔄',
        premium: true,
        description: '3D card flip effect',
        duration: 1,
        config: {
            scaleX: -1,
            duration: 0.5,
            yoyo: true,
            easing: 'EaseInOut',
        },
    },
    'typewriter': {
        name: 'Typewriter',
        icon: '⌨️',
        premium: true,
        description: 'Typewriter text reveal',
        custom: true, // Requires custom implementation
        duration: 2,
    },
    'neon-glow': {
        name: 'Neon Glow',
        icon: '💫',
        premium: true,
        description: 'Pulsing neon glow effect',
        duration: 2,
        config: {
            shadowBlur: 30,
            shadowColor: '#00ff00',
            duration: 1,
            yoyo: true,
            repeat: -1,
            easing: 'EaseInOut',
        },
    },
    'elastic-bounce': {
        name: 'Elastic Bounce',
        icon: '🎾',
        premium: true,
        description: 'Elastic bounce animation',
        duration: 1.5,
        config: {
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 0.75,
            yoyo: true,
            easing: 'ElasticEaseOut',
        },
    },
    'glitch': {
        name: 'Glitch Effect',
        icon: '⚡',
        premium: true,
        description: 'Digital glitch animation',
        custom: true,
        duration: 0.5,
    },
    'morphing': {
        name: 'Morphing',
        icon: '🔮',
        premium: true,
        description: 'Shape morphing effect',
        duration: 2,
        config: {
            rotation: 360,
            scaleX: 1.5,
            scaleY: 0.7,
            duration: 1,
            yoyo: true,
            easing: 'EaseInOut',
        },
    },
    'spotlight': {
        name: 'Spotlight',
        icon: '💡',
        premium: true,
        description: 'Spotlight reveal effect',
        duration: 1.5,
        config: {
            opacity: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 0.75,
            easing: 'EaseOut',
        },
    },
    'particles': {
        name: 'Particle Burst',
        icon: '✨',
        premium: true,
        description: 'Particle explosion effect',
        custom: true,
        duration: 2,
    },
};

// Helper to check if animation is premium
export const isPremiumAnimation = (animationId) => {
    return premiumAnimations[animationId]?.premium === true;
};

// Get all premium animation ids
export const getPremiumAnimationIds = () => {
    return Object.keys(premiumAnimations).filter(id => premiumAnimations[id].premium);
};
