import { BarChart3, LineChart, PieChart, TrendingUp, Plus, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { useSlideStore } from '../../store/useSlideStore';
import { Chart as ChartJS } from 'chart.js/auto';
import { ChartDataModal } from './ChartDataModal';

const chartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3, description: 'Compare values' },
    { id: 'line', label: 'Line Chart', icon: LineChart, description: 'Show trends' },
    { id: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Show proportions' },
    { id: 'area', label: 'Area Chart', icon: TrendingUp, description: 'Cumulative data' },
];

// Default chart data templates
const defaultChartData = [
    { label: 'Q1', value: 400 },
    { label: 'Q2', value: 300 },
    { label: 'Q3', value: 500 },
    { label: 'Q4', value: 450 },
];

/**
 * Charts Panel - Insert and customize charts
 */
export const ChartsPanel = () => {
    const [selectedType, setSelectedType] = useState('bar');
    const [showDataModal, setShowDataModal] = useState(false);
    const [customData, setCustomData] = useState(null); // null = use default
    const { addElement } = useSlideStore();

    const currentData = customData || defaultChartData;


    const generateChartImage = async (type, data) => {
        // Create temporary canvas
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Chart configuration
        const config = {
            type: type === 'area' ? 'line' : type,
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    label: 'Data',
                    data: data.map(d => d.value),
                    backgroundColor: type === 'pie'
                        ? ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                        : 'rgba(139, 92, 246, 0.8)',
                    borderColor: '#8b5cf6',
                    borderWidth: 2,
                    fill: type === 'area',
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: type === 'pie',
                        labels: { color: '#fff' }
                    }
                },
                scales: type !== 'pie' ? {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                } : {}
            }
        };

        // Generate chart
        const chart = new ChartJS(ctx, config);

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100));

        // Convert to data URL
        const imageUrl = canvas.toDataURL('image/png');

        // Cleanup
        chart.destroy();

        return imageUrl;
    };

    const handleInsertChart = async () => {
        try {
            // Generate chart image with current data
            const imageUrl = await generateChartImage(selectedType, currentData);

            // Add as image element
            addElement('image', {
                src: imageUrl,
                width: 400,
                height: 267,
                x: 100,
                y: 100,
                // Store chart metadata for editing
                chartType: selectedType,
                chartData: currentData,
                isChart: true,
            });
        } catch (error) {
            console.error('Failed to generate chart:', error);
            alert('Failed to create chart. Please try again.');
        }
    };

    const handleSaveData = (newData) => {
        setCustomData(newData);
    };

    return (
        <div className="flex flex-col h-full bg-gray-950">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Charts
                </h2>
                <p className="text-xs text-gray-400 mt-1">Add data visualizations</p>
            </div>

            {/* Chart Types */}
            <div className="p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase">Chart Type</h3>
                <div className="grid grid-cols-2 gap-2">
                    {chartTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedType === type.id;

                        return (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`p-3 rounded-lg border transition-all ${isSelected
                                    ? 'border-purple-500 bg-purple-900/30'
                                    : 'border-white/10 bg-gray-800 hover:border-purple-500/50'
                                    }`}
                            >
                                <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-purple-400' : 'text-gray-400'
                                    }`} />
                                <p className="text-xs font-medium">{type.label}</p>
                                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quick Templates */}
            <div className="p-4 border-t border-white/10 space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase">Quick Start</h3>

                {/* Edit Data Button */}
                <button
                    onClick={() => setShowDataModal(true)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-white/10"
                >
                    <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Custom Data</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Insert Button */}
                <button
                    onClick={handleInsertChart}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Insert Chart
                </button>

                <p className="text-xs text-gray-500 text-center">
                    {customData ? `Using ${customData.length} custom data points` : 'Using default quarterly data'}
                </p>
            </div>

            {/* Instructions */}
            <div className="mt-auto p-4 bg-gray-900/50 border-t border-white/10">
                <p className="text-xs text-gray-500">
                    💡 <strong>Tip:</strong> Charts are inserted as images. Click "Custom Data" to edit values before inserting.
                </p>
            </div>

            {/* Chart Data Modal */}
            <ChartDataModal
                isOpen={showDataModal}
                onClose={() => setShowDataModal(false)}
                initialData={customData || defaultChartData}
                onSave={handleSaveData}
            />
        </div>
    );
};

export default ChartsPanel;
