import { X, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

/**
 * Chart Data Modal - Edit chart data values
 */
export const ChartDataModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [rows, setRows] = useState(initialData || [
        { label: 'Q1', value: 400 },
        { label: 'Q2', value: 300 },
        { label: 'Q3', value: 500 },
        { label: 'Q4', value: 450 },
    ]);

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
            alert('Chart must have at least 2 data points');
            return;
        }
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (rows.some(row => !row.label.trim())) {
            alert('All labels must be filled');
            return;
        }
        onSave(rows);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg w-[500px] max-h-[600px] flex flex-col border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold">Edit Chart Data</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 pb-2 border-b border-white/10">
                            <div className="col-span-5">Label</div>
                            <div className="col-span-5">Value</div>
                            <div className="col-span-2">Action</div>
                        </div>

                        {/* Data Rows */}
                        {rows.map((row, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2">
                                {/* Label Input */}
                                <input
                                    type="text"
                                    value={row.label}
                                    onChange={(e) => handleLabelChange(index, e.target.value)}
                                    placeholder="Label"
                                    className="col-span-5 bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                                />

                                {/* Value Input */}
                                <input
                                    type="number"
                                    value={row.value}
                                    onChange={(e) => handleValueChange(index, e.target.value)}
                                    placeholder="Value"
                                    className="col-span-5 bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                                />

                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemoveRow(index)}
                                    disabled={rows.length <= 2}
                                    className="col-span-2 p-2 hover:bg-red-900/30 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Remove row"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        ))}

                        {/* Add Row Button */}
                        <button
                            onClick={handleAddRow}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-lg transition-colors mt-3"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm">Add Row</span>
                        </button>
                    </div>

                    {/* Info */}
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <p className="text-xs text-blue-300">
                            💡 <strong>Tip:</strong> Chart must have at least 2 data points. Maximum 10 rows recommended for readability.
                        </p>
                    </div>
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
                        Save Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChartDataModal;
