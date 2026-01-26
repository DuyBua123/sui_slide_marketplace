/**
 * Premium Shapes - Advanced shapes only for premium users
 */

export const premiumShapes = [
    {
        id: 'starburst',
        name: 'Star Burst',
        icon: '✨',
        premium: true,
        create: () => ({
            type: 'star',
            numPoints: 12,
            innerRadius: 30,
            outerRadius: 60,
            fill: '#fbbf24',
            stroke: '#f59e0b',
            strokeWidth: 2,
        }),
    },
    {
        id: 'polygon',
        name: 'Hexagon',
        icon: '⬡',
        premium: true,
        create: () => ({
            type: 'regularPolygon',
            sides: 6,
            radius: 50,
            fill: '#8b5cf6',
            stroke: '#7c3aed',
            strokeWidth: 2,
        }),
    },
    {
        id: 'pentagon',
        name: 'Pentagon',
        icon: '⬟',
        premium: true,
        create: () => ({
            type: 'regularPolygon',
            sides: 5,
            radius: 50,
            fill: '#ec4899',
            stroke: '#db2777',
            strokeWidth: 2,
        }),
    },
    {
        id: 'octagon',
        name: 'Octagon',
        icon: '⯃',
        premium: true,
        create: () => ({
            type: 'regularPolygon',
            sides: 8,
            radius: 50,
            fill: '#14b8a6',
            stroke: '#0d9488',
            strokeWidth: 2,
        }),
    },
    {
        id: 'triangle',
        name: 'Triangle',
        icon: '▲',
        premium: true,
        create: () => ({
            type: 'regularPolygon',
            sides: 3,
            radius: 50,
            fill: '#f97316',
            stroke: '#ea580c',
            strokeWidth: 2,
        }),
    },
    {
        id: 'cloud',
        name: 'Cloud Shape',
        icon: '☁️',
        premium: true,
        create: () => ({
            type: 'path',
            data: 'M 50 10 Q 30 0, 20 20 Q 0 20, 10 40 Q 0 60, 30 60 Q 40 80, 60 60 Q 90 60, 80 40 Q 100 20, 70 20 Q 60 0, 50 10 Z',
            fill: '#93c5fd',
            stroke: '#60a5fa',
            strokeWidth: 2,
            scaleX: 1.5,
            scaleY: 1.5,
        }),
    },
    {
        id: 'heart',
        name: 'Heart',
        icon: '❤️',
        premium: true,
        create: () => ({
            type: 'path',
            data: 'M50,90 C20,70 10,50 10,35 C10,20 20,10 35,10 C42,10 48,13 50,18 C52,13 58,10 65,10 C80,10 90,20 90,35 C90,50 80,70 50,90 Z',
            fill: '#ef4444',
            stroke: '#dc2626',
            strokeWidth: 2,
        }),
    },
    {
        id: 'diamond',
        name: 'Diamond',
        icon: '💎',
        premium: true,
        create: () => ({
            type: 'path',
            data: 'M50,10 L90,40 L50,90 L10,40 Z',
            fill: '#6366f1',
            stroke: '#4f46e5',
            strokeWidth: 2,
        }),
    },
];

// Helper to check if shape is premium
export const isPremiumShape = (shapeId) => {
    return premiumShapes.some(shape => shape.id === shapeId && shape.premium);
};
