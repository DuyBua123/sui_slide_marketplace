import { useState } from "react";
import { useListSlide } from "../../hooks/useMarketplace";

/**
 * Modal for listing a slide for sale
 */
export const SellSlideModal = ({ isOpen, onClose, slideId, slideTitle, initialData = null }) => {
  const [monthlyPriceSui, setMonthlyPriceSui] = useState("1");
  const [yearlyPriceSui, setYearlyPriceSui] = useState("10");
  const [lifetimePriceSui, setLifetimePriceSui] = useState("50");
  const [salePriceSui, setSalePriceSui] = useState("100");
  const [isListed, setIsListed] = useState(false);
  const [isForSale, setIsForSale] = useState(false);
  const { listSlide, isLoading, error } = useListSlide();
  const [success, setSuccess] = useState(false);

  // Initialize with existing data if provided
  useState(() => {
    if (initialData) {
      setMonthlyPriceSui(initialData.monthlyPrice ? (initialData.monthlyPrice / 1_000_000_000).toString() : "1");
      setYearlyPriceSui(initialData.yearlyPrice ? (initialData.yearlyPrice / 1_000_000_000).toString() : "10");
      setLifetimePriceSui(initialData.lifetimePrice ? (initialData.lifetimePrice / 1_000_000_000).toString() : "50");
      setSalePriceSui(initialData.salePrice ? (initialData.salePrice / 1_000_000_000).toString() : "100");
      setIsListed(initialData.isListed ?? true);
      setIsForSale(initialData.isForSale ?? false);
    }
  }, [initialData, isOpen]);

  // Reset/Sync when opening
  if (isOpen && initialData && monthlyPriceSui === "1" && !initialData.wasReset) {
    // Logic to sync handled in effect below
  }

  useState(() => {
    // Quick fix: re-sync when isOpen changes to true
    if (isOpen && initialData) {
      setMonthlyPriceSui(initialData.monthlyPrice ? (initialData.monthlyPrice / 1_000_000_000).toString() : "1");
      setYearlyPriceSui(initialData.yearlyPrice ? (initialData.yearlyPrice / 1_000_000_000).toString() : "10");
      setLifetimePriceSui(initialData.lifetimePrice ? (initialData.lifetimePrice / 1_000_000_000).toString() : "50");

      setSalePriceSui(initialData.salePrice ? (initialData.salePrice / 1_000_000_000).toString() : "100");
      setIsListed(initialData.isListed);
      setIsForSale(initialData.isForSale);
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert SUI to MIST
    const monthlyPriceMist = Math.floor(parseFloat(monthlyPriceSui) * 1_000_000_000);
    const yearlyPriceMist = Math.floor(parseFloat(yearlyPriceSui) * 1_000_000_000);
    const lifetimePriceMist = Math.floor(parseFloat(lifetimePriceSui) * 1_000_000_000);
    const salePriceMist = Math.floor(parseFloat(salePriceSui) * 1_000_000_000);

    try {
      await listSlide({
        slideId,
        monthlyPrice: monthlyPriceMist,
        yearlyPrice: yearlyPriceMist,
        lifetimePrice: lifetimePriceMist,
        isListed: isListed,
        price: salePriceMist, // Mapping price to sale_price for useListSlide hook
        isForSale: isForSale,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to list/update slide:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-all">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl transition-all max-h-[90vh] overflow-y-auto custom-scrollbar">
        {success ? (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              Listed Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">
              Your slide is now live on the marketplace
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {initialData ? "Manage Listing" : "Sell Slide Asset"}
              </h2>
              <button
                onClick={onClose}
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-400 dark:text-gray-500 transition-all active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Preview Card */}
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 mb-6 transition-all">
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                {initialData ? "Editing Asset" : "Listing Asset"}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {slideTitle || "Untitled Slide"}
              </p>
            </div>

            {/* Pricing Form */}
            <form onSubmit={handleSubmit}>
              {/* License Section */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Enable Licensing (Multi-Tier)
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isListed} onChange={(e) => setIsListed(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {isListed && (
                  <div className="space-y-4">
                    {/* Monthly */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-1 block">Monthly Price (SUI)</label>
                      <input
                        type="number" step="0.1" min="0" value={monthlyPriceSui}
                        onChange={(e) => setMonthlyPriceSui(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-black/30 border border-gray-100 dark:border-white/10 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
                        placeholder="1.0"
                      />
                    </div>
                    {/* Yearly */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-1 block">Yearly Price (SUI)</label>
                      <input
                        type="number" step="0.1" min="0" value={yearlyPriceSui}
                        onChange={(e) => setYearlyPriceSui(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-black/30 border border-gray-100 dark:border-white/10 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
                        placeholder="10.0"
                      />
                    </div>
                    {/* Lifetime */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-1 block">Lifetime Price (SUI)</label>
                      <input
                        type="number" step="0.1" min="0" value={lifetimePriceSui}
                        onChange={(e) => setLifetimePriceSui(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-black/30 border border-gray-100 dark:border-white/10 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
                        placeholder="50.0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ownership Section */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Enable Ownership Sale
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isForSale} onChange={(e) => setIsForSale(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>
                {isForSale && (
                  <div className="relative group">
                    <input
                      type="number" step="0.1" min="0" value={salePriceSui}
                      onChange={(e) => setSalePriceSui(e.target.value)}
                      className="w-full px-5 py-3 bg-white dark:bg-black/30 border-2 border-gray-100 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-lg font-black focus:border-green-500 outline-none transition-all"
                      placeholder="10.0"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">SUI</div>
                  </div>
                )}
              </div>

              {/* Warning Box */}
              <div className="bg-orange-50 dark:bg-yellow-500/10 border border-orange-100 dark:border-yellow-500/20 rounded-2xl p-4 mb-8 transition-all">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-orange-500 dark:bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-orange-800 dark:text-yellow-500 font-black tracking-tight">
                      Ownership Transfer
                    </p>
                    <p className="text-xs text-orange-700/70 dark:text-yellow-500/60 mt-1 leading-relaxed font-medium">
                      Once purchased, ownership is transferred on-chain. You will lose all
                      editing permissions for this slide.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 mb-6">
                  <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {error}
                  </p>
                </div>
              )}

              {/* Action Footer */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer flex-1 px-4 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl font-black text-gray-600 dark:text-gray-300 transition-all active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (!isListed && !isForSale)}
                  className="cursor-pointer flex-[1.5] px-4 py-4 bg-gray-900 dark:bg-gradient-to-r dark:from-green-600 dark:to-emerald-600 hover:bg-black dark:hover:from-green-500 dark:hover:to-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-gray-900/10 dark:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.97]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <span>{isLoading ? "Processing..." : (initialData ? "Update Listing" : "List for Sale")}</span>
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
