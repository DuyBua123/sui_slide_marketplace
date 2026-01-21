import { AlertCircle, RotateCcw, X } from 'lucide-react';

/**
 * Auto Recovery Banner - Shows when recovery data is available
 */
export const AutoRecoveryBanner = ({ hasRecovery, recoveryData, onRecover, onDismiss, onClear }) => {
    if (!hasRecovery || !recoveryData) return null;

    const lastUpdate = new Date(recoveryData.updatedAt);
    const timeAgo = Math.round((new Date() - lastUpdate) / (1000 * 60)); // minutes ago

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-900/80 border-b border-amber-600 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-300" />
                    <div>
                        <p className="text-sm font-semibold text-amber-100">
                            Recovery available
                        </p>
                        <p className="text-xs text-amber-200">
                            Unsaved changes detected from {timeAgo} minute{timeAgo !== 1 ? 's' : ''} ago
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={onRecover}
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded text-xs font-semibold text-white transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Recover
                    </button>
                    
                    <button
                        onClick={onDismiss}
                        className="px-3 py-1.5 hover:bg-white/10 rounded text-xs text-amber-200 transition-colors"
                    >
                        Dismiss
                    </button>
                    
                    <button
                        onClick={onClear}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-4 h-4 text-amber-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutoRecoveryBanner;
