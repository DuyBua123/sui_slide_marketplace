import { useState } from 'react';
import { useListSlide } from '../../hooks/useMarketplace';

/**
 * Modal for listing a slide for sale
 */
export const SellSlideModal = ({ isOpen, onClose, slideId, slideTitle }) => {
    const [price, setPrice] = useState('');
    const [priceInSui, setPriceInSui] = useState('1');
    const { listSlide, isLoading, error } = useListSlide();
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert SUI to MIST (1 SUI = 1e9 MIST)
        const priceInMist = Math.floor(parseFloat(priceInSui) * 1_000_000_000);

        if (priceInMist <= 0) {
            alert('Please enter a valid price');
            return;
        }

        try {
            await listSlide({
                slideId,
                price: priceInMist,
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setPriceInSui('1');
            }, 2000);
        } catch (err) {
            console.error('Failed to list slide:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Listed Successfully!</h3>
                        <p className="text-gray-400">Your slide is now on the marketplace</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Sell Slide</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Slide info */}
                        <div className="bg-white/5 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-400">Listing</p>
                            <p className="text-lg font-semibold text-white truncate">{slideTitle || 'Untitled Slide'}</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Sale Price (SUI)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={priceInSui}
                                        onChange={(e) => setPriceInSui(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-lg font-semibold focus:border-blue-500 focus:outline-none"
                                        placeholder="1.0"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                        <span className="text-gray-400 font-medium">SUI</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    ≈ {(parseFloat(priceInSui) * 1_000_000_000).toLocaleString()} MIST
                                </p>
                            </div>

                            {/* Warning */}
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-yellow-400 font-medium">Ownership Transfer</p>
                                        <p className="text-xs text-yellow-400/70 mt-1">
                                            When someone buys this slide, they will become the new owner. You will no longer be able to edit it.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !priceInSui}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Listing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>List for Sale</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default SellSlideModal;
