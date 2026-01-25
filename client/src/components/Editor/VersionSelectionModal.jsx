import React from 'react';
import { X, History, ArrowRight, Clock } from 'lucide-react';

export const VersionSelectionModal = ({ isOpen, onClose, versions, onSelect, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0d0d0d] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black dark:text-white tracking-tight">Select Version</h2>
                            <p className="text-xs text-gray-500 font-medium">Choose a snapshot to start your edit</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Loading history...</p>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            No versions found for this slide.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((v) => (
                                <button
                                    key={v.version}
                                    onClick={() => onSelect(v)}
                                    className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl group transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-12 h-12 bg-white dark:bg-black/30 rounded-xl flex items-center justify-center font-black text-lg text-blue-600 dark:text-blue-400 shadow-sm">
                                            v{v.version}
                                        </div>
                                        <div>
                                            <p className="font-bold dark:text-white">Version {v.version}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                {new Date(v.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-white/2 border-t border-gray-100 dark:border-white/5">
                    <p className="text-[10px] text-center uppercase font-black tracking-widest text-gray-400">
                        Blockchain Verified History
                    </p>
                </div>
            </div>
        </div>
    );
};
