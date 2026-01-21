import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Plus,
  Edit3,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useSlideStore } from "../../store/useSlideStore";
import { Chart as ChartJS } from "chart.js/auto";
import { ChartDataModal } from "./ChartDataModal";

const chartTypes = [
  { id: "bar", label: "Bar Chart", icon: BarChart3, description: "Compare values" },
  { id: "line", label: "Line Chart", icon: LineChart, description: "Show trends" },
  { id: "pie", label: "Pie Chart", icon: PieChart, description: "Show proportions" },
  { id: "area", label: "Area Chart", icon: TrendingUp, description: "Cumulative data" },
];

// Default chart data templates
const defaultChartData = [
  { label: "Q1", value: 400 },
  { label: "Q2", value: 300 },
  { label: "Q3", value: 500 },
  { label: "Q4", value: 450 },
];

/**
 * Charts Panel - Insert and customize charts
 */
export const ChartsPanel = () => {
  const [selectedType, setSelectedType] = useState("bar");
  const [showDataModal, setShowDataModal] = useState(false);
  const [customData, setCustomData] = useState(null); // null = use default
  const { addElement } = useSlideStore();

  const currentData = customData || defaultChartData;

  const generateChartImage = async (type, data) => {
    // Create temporary canvas
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    // Chart configuration
    const config = {
      type: type === "area" ? "line" : type,
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: "Data",
            data: data.map((d) => d.value),
            backgroundColor:
              type === "pie"
                ? ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
                : "rgba(139, 92, 246, 0.8)",
            borderColor: "#8b5cf6",
            borderWidth: 2,
            fill: type === "area",
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: type === "pie",
            labels: { color: "#fff" },
          },
        },
        scales:
          type !== "pie"
            ? {
                y: {
                  beginAtZero: true,
                  ticks: { color: "#9ca3af" },
                  grid: { color: "rgba(255,255,255,0.1)" },
                },
                x: {
                  ticks: { color: "#9ca3af" },
                  grid: { color: "rgba(255,255,255,0.1)" },
                },
              }
            : {},
      },
    };

    // Generate chart
    const chart = new ChartJS(ctx, config);

    // Wait for render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Convert to data URL
    const imageUrl = canvas.toDataURL("image/png");

    // Cleanup
    chart.destroy();

    return imageUrl;
  };

  const handleInsertChart = async () => {
    try {
      // Generate chart image with current data
      const imageUrl = await generateChartImage(selectedType, currentData);

      // Add as image element
      addElement("image", {
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
      console.error("Failed to generate chart:", error);
      alert("Failed to create chart. Please try again.");
    }
  };

  const handleSaveData = (newData) => {
    setCustomData(newData);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-white/10">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
          <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Charts
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Add data visualizations to your slide
        </p>
      </div>

      {/* Chart Types Selection Area */}
      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Select Type
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {chartTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`cursor-pointer p-3 rounded-2xl border transition-all flex flex-col items-center text-center group ${
                  isSelected
                    ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-500 shadow-sm shadow-purple-200 dark:shadow-none"
                    : "border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50"
                }`}
              >
                <Icon
                  className={`w-8 h-8 mb-2 transition-transform group-hover:scale-110 ${
                    isSelected
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                />
                <p
                  className={`text-xs font-bold ${
                    isSelected
                      ? "text-purple-700 dark:text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {type.label}
                </p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 leading-tight font-medium">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions & Templates */}
      <div className="p-4 border-t border-gray-100 dark:border-white/10 space-y-4 bg-gray-50/30 dark:bg-transparent">
        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Configuration
        </h3>

        {/* Custom Data Trigger */}
        <button
          onClick={() => setShowDataModal(true)}
          className="cursor-pointer w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-200 dark:border-white/10 shadow-sm group"
        >
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <Edit3 className="w-4 h-4 text-purple-500 dark:text-gray-400" />
            <span className="text-sm font-bold">Edit Chart Data</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Primary Insert Action */}
        <button
          onClick={handleInsertChart}
          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-purple-600/20 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Insert to Slide
        </button>

        <div className="flex items-center justify-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${customData ? "bg-green-500" : "bg-gray-300"}`}
          />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium italic">
            {customData ? `Active: ${customData.length} data points` : "Using sample data set"}
          </p>
        </div>
      </div>

      {/* Footer Tip Area */}
      <div className="mt-auto p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/10">
        <div className="flex gap-2">
          <span className="text-xs">💡</span>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong>Tip:</strong> You can double-click any chart on the canvas later to quickly
            reopen the data editor.
          </p>
        </div>
      </div>

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
