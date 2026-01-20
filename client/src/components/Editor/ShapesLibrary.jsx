import {
    Square, Circle, Triangle, Star, Heart, Diamond,
    Hexagon, Octagon, Pentagon, ArrowRight, ArrowDown
} from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';

const shapes = [
    {
        id: 'circle',
        label: 'Circle',
        icon: Circle,
        create: () => ({ type: 'circle', radius: 50, fill: '#8b5cf6', x: 400, y: 250 })
    },
    {
        id: 'square',
        label: 'Square',
        icon: Square,
        create: () => ({ type: 'rect', width: 100, height: 100, fill: '#3b82f6', x: 400, y: 200 })
    },
    {
        id: 'rectangle',
        label: 'Rectangle',
        icon: Square,
        create: () => ({ type: 'rect', width: 150, height: 80, fill: '#10b981', x: 400, y: 220 })
    },
    {
        id: 'triangle',
        label: 'Triangle',
        icon: Triangle,
        create: () => ({
            type: 'line',
            points: [0, 100, 50, 0, 100, 100, 0, 100],
            fill: '#f59e0b',
            stroke: '#f59e0b',
            strokeWidth: 2,
            closed: true,
            x: 400,
            y: 200
        })
    },
    {
        id: 'star',
        label: 'Star',
        icon: Star,
        create: () => ({
            type: 'line',
            points: [50, 0, 61, 35, 98, 35, 68, 57, 79, 91, 50, 70, 21, 91, 32, 57, 2, 35, 39, 35],
            fill: '#fbbf24',
            stroke: '#fbbf24',
            strokeWidth: 2,
            closed: true,
            x: 400,
            y: 200
        })
    },
    {
        id: 'heart',
        label: 'Heart',
        icon: Heart,
        create: () => ({
            type: 'line',
            points: [50, 30, 35, 15, 20, 15, 10, 25, 10, 40, 50, 80, 90, 40, 90, 25, 80, 15, 65, 15, 50, 30],
            fill: '#ef4444',
            stroke: '#ef4444',
            strokeWidth: 2,
            closed: true,
            x: 400,
            y: 200
        })
    },
    {
        id: 'hexagon',
        label: 'Hexagon',
        icon: Hexagon,
        create: () => ({
            type: 'line',
            points: [50, 0, 93.3, 25, 93.3, 75, 50, 100, 6.7, 75, 6.7, 25],
            fill: '#06b6d4',
            stroke: '#06b6d4',
            strokeWidth: 2,
            closed: true,
            x: 400,
            y: 200
        })
    },
    {
        id: 'pentagon',
        label: 'Pentagon',
        icon: Pentagon,
        create: () => ({
            type: 'line',
            points: [50, 0, 95, 38, 79, 100, 21, 100, 5, 38],
            fill: '#8b5cf6',
            stroke: '#8b5cf6',
            strokeWidth: 2,
            closed: true,
            x: 400,
            y: 200
        })
    },
    {
        id: 'arrow-right',
        label: 'Arrow →',
        icon: ArrowRight,
        create: () => ({
            type: 'line',
            points: [0, 25, 60, 25, 60, 0, 100, 50, 60, 100, 60, 75, 0, 75],
            fill: '#6366f1',
            stroke: '#6366f1',
            strokeWidth: 2,
            closed: true,
            x: 400,
            y: 200
        })
    },
    {
        id: 'arrow-down',
        label: 'Arrow ↓',
        icon: ArrowDown,
        create: () => ({
            type: 'line',
            points: [25, 0, 75, 0, 75, 60, 100, 60, 50, 100, 0, 60, 25, 60],
            fill: '#14b8a6',
            stroke: '#14b8a6',
            strokeWidth: 2,
            closed: true,
            x: 400,
            y: 200
        })
    },
    {
        id: 'line-horizontal',
        label: 'Line —',
        icon: Square,
        create: () => ({
            type: 'line',
            points: [0, 0, 150, 0],
            stroke: '#6b7280',
            strokeWidth: 4,
            x: 400,
            y: 270
        })
    },
];

/**
 * Extended Shapes Library - 10+ shapes
 */
export const ShapesLibrary = () => {
    const { addElement } = useSlideStore();

    const handleAddShape = (shape) => {
        const elementProps = shape.create();
        addElement(elementProps.type, elementProps);
    };

    return (
        <div>
            <h3 className="text-xs font-semibold mb-3">Shapes</h3>
            <div className="grid grid-cols-2 gap-2">
                {shapes.map((shape) => {
                    const Icon = shape.icon;
                    return (
                        <button
                            key={shape.id}
                            onClick={() => handleAddShape(shape)}
                            className="group aspect-square rounded-lg border border-white/10 hover:border-purple-500 bg-gray-800/50 hover:bg-gray-800 transition-all flex flex-col items-center justify-center gap-2 p-3"
                        >
                            <Icon className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
                            <span className="text-[10px] text-gray-400 group-hover:text-white">
                                {shape.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ShapesLibrary;
