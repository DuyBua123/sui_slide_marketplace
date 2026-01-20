/**
 * Starter Templates Configuration
 * 7 professional presentation templates
 */

export const templates = [
    {
        id: 'minimal-white',
        name: 'Minimal White',
        category: 'Professional',
        thumbnail: 'https://via.placeholder.com/300x200/ffffff/333333?text=Minimal+White',
        slides: [
            {
                background: '#ffffff',
                elements: [
                    {
                        type: 'text',
                        text: 'Your Title Here',
                        fontSize: 64,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fill: '#000000',
                        x: 100,
                        y: 200,
                        width: 700,
                    },
                    {
                        type: 'text',
                        text: 'Subtitle',
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#666666',
                        x: 100,
                        y: 290,
                        width: 500,
                    },
                ],
            },
        ],
    },
    {
        id: 'dark-modern',
        name: 'Dark Modern',
        category: 'Creative',
        thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=Dark+Modern',
        slides: [
            {
                background: '#1a1a1a',
                elements: [
                    {
                        type: 'text',
                        text: 'Bold Statement',
                        fontSize: 72,
                        fontFamily: 'Arial Black',
                        fontWeight: 'bold',
                        fill: '#ffffff',
                        x: 100,
                        y: 180,
                        width: 800,
                    },
                    {
                        type: 'rect',
                        width: 150,
                        height: 4,
                        fill: '#8b5cf6',
                        x: 100,
                        y: 280,
                    },
                ],
            },
        ],
    },
    {
        id: 'gradient-colorful',
        name: 'Gradient Colorful',
        category: 'Creative',
        thumbnail: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Gradient',
        slides: [
            {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                elements: [
                    {
                        type: 'text',
                        text: 'Creative Design',
                        fontSize: 68,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fill: '#ffffff',
                        x: 120,
                        y: 220,
                        width: 700,
                    },
                ],
            },
        ],
    },
    {
        id: 'business-blue',
        name: 'Business Blue',
        category: 'Professional',
        thumbnail: 'https://via.placeholder.com/300x200/1e3a8a/ffffff?text=Business+Blue',
        slides: [
            {
                background: '#f8fafc',
                elements: [
                    {
                        type: 'rect',
                        width: 1000,
                        height: 100,
                        fill: '#1e3a8a',
                        x: 0,
                        y: 0,
                    },
                    {
                        type: 'text',
                        text: 'Professional Title',
                        fontSize: 56,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fill: '#ffffff',
                        x: 100,
                        y: 20,
                        width: 700,
                    },
                    {
                        type: 'text',
                        text: 'Content goes here',
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fill: '#1e293b',
                        x: 100,
                        y: 180,
                        width: 800,
                    },
                ],
            },
        ],
    },
    {
        id: 'photo-minimal',
        name: 'Photo Minimal',
        category: 'Photo',
        thumbnail: 'https://via.placeholder.com/300x200/94a3b8/ffffff?text=Photo+Minimal',
        slides: [
            {
                background: '#f1f5f9',
                elements: [
                    {
                        type: 'text',
                        text: 'Your Story',
                        fontSize: 60,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fill: '#0f172a',
                        x: 100,
                        y: 400,
                        width: 400,
                    },
                ],
            },
        ],
    },
    {
        id: 'tech-startup',
        name: 'Tech Startup',
        category: 'Creative',
        thumbnail: 'https://via.placeholder.com/300x200/10b981/000000?text=Tech+Startup',
        slides: [
            {
                background: '#000000',
                elements: [
                    {
                        type: 'text',
                        text: 'INNOVATION',
                        fontSize: 80,
                        fontFamily: 'Arial Black',
                        fontWeight: 'bold',
                        fill: '#10b981',
                        x: 100,
                        y: 200,
                        width: 800,
                    },
                    {
                        type: 'text',
                        text: 'Disrupting the future',
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#ffffff',
                        x: 100,
                        y: 300,
                        width: 600,
                    },
                ],
            },
        ],
    },
    {
        id: 'elegant-serif',
        name: 'Elegant Serif',
        category: 'Professional',
        thumbnail: 'https://via.placeholder.com/300x200/fef3c7/000000?text=Elegant+Serif',
        slides: [
            {
                background: '#fffbeb',
                elements: [
                    {
                        type: 'text',
                        text: 'Elegant Presentation',
                        fontSize: 64,
                        fontFamily: 'Georgia',
                        fill: '#78350f',
                        x: 100,
                        y: 220,
                        width: 700,
                    },
                    {
                        type: 'line',
                        points: [100, 310, 400, 310],
                        stroke: '#d97706',
                        strokeWidth: 2,
                    },
                ],
            },
        ],
    },
];

export const templateCategories = [
    'All',
    'Professional',
    'Creative',
    'Photo',
];

export default templates;
