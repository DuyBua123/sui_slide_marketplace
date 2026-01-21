import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

/**
 * Chart Data Modal - Edit chart data values
 */
export const ChartDataModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [rows, setRows] = useState(
    initialData || [
      { label: "Q1", value: 400 },
      { label: "Q2", value: 300 },
      { label: "Q3", value: 500 },
      { label: "Q4", value: 450 },
    ],
  );

  const handleLabelChange = (index, newLabel) => {
    const newRows = [...rows];
    newRows[index].label = newLabel;
    setRows(newRows);
  };

  const handleValueChange = (index, newValue) => {
    const newRows = [...rows];
    newRows[index].value = parseFloat(newValue) || 0;
    setRows(newRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { label: `Item ${rows.length + 1}`, value: 0 }]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length <= 2) {
      alert("Chart must have at least 2 data points");
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (rows.some((row) => !row.label.trim())) {
      alert("All labels must be filled");
      return;
    }
    onSave(rows);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-[500px] max-h-[600px] flex flex-col border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Edit Chart Data</h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white dark:bg-gray-900">
          <div className="space-y-4">
            {/* Table Header Labels */}
            <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100 dark:border-white/10">
              <div className="col-span-5 px-1">Label</div>
              <div className="col-span-5 px-1">Value</div>
              <div className="col-span-2 text-center">Action</div>
            </div>

            {/* Data Rows */}
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 group animate-in fade-in slide-in-from-top-1"
                >
                  {/* Label Input */}
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    placeholder="Category Name"
                    className="col-span-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
                  />

                  {/* Value Input */}
                  <input
                    type="number"
                    value={row.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    placeholder="0"
                    className="col-span-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                  />

                  {/* Remove Action */}
                  <button
                    onClick={() => handleRemoveRow(index)}
                    disabled={rows.length <= 2}
                    className="cursor-pointer col-span-2 flex items-center justify-center p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-10 disabled:cursor-not-allowed group"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Row Button (Dashed Border Style) */}
            <button
              onClick={handleAddRow}
              className="cursor-pointer w-full flex items-center justify-center gap-2 px-3 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border-2 border-gray-200 dark:border-white/10 border-dashed rounded-2xl transition-all mt-2 group hover:border-purple-400 dark:hover:border-purple-500/50"
            >
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Add New Data Point
              </span>
            </button>
          </div>

          {/* Info Tip - Blue Box */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex gap-3">
            <span className="text-lg">💡</span>
            <p className="text-[12px] text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
              <strong className="block mb-0.5">Presentation Tip:</strong>
              Charts work best with 2-10 data points. Too many rows can make your chart
              unreadable on a slide.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="cursor-pointer px-5 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="cursor-pointer px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-purple-600/20 active:scale-95 text-sm"
          >
            Update Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartDataModal;
