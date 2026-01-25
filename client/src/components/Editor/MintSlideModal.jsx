import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useMintSlide } from "../../hooks/useMintSlide";
import { usePublishVersion } from "../../hooks/usePublishVersion";
import { uploadJSONToWalrus, uploadDataUrlToWalrus } from "../../utils/walrus";

/**
 * Modal for minting a slide to SUI blockchain
 */
export const MintSlideModal = ({ isOpen, onClose, slideData, onMintSuccess }) => {
  const [price, setPrice] = useState("1");
  const [salePrice, setSalePrice] = useState("10"); // Default sale price
  const [isForSale, setIsForSale] = useState(false);
  const [step, setStep] = useState("input"); // 'input' | 'uploading' | 'minting' | 'success'
  const [error, setError] = useState(null);
  const [objectId, setObjectId] = useState(null);

  const { mintSlide } = useMintSlide();
  const { publishVersion } = usePublishVersion();

  const isAlreadyMinted = !!slideData?.objectId;

  if (!isOpen) return null;

  const handleMint = async (e) => {
    e.preventDefault();
    setError(null);

    const priceInMist = Math.floor(parseFloat(price) * 1_000_000_000);
    const salePriceInMist = Math.floor(parseFloat(salePrice) * 1_000_000_000);

    if (priceInMist <= 0) {
      setError("Please enter a valid license price");
      return;
    }

    if (isForSale && salePriceInMist <= 0) {
      setError("Please enter a valid sale price");
      return;
    }

    try {
      // Step 1: Upload content to IPFS
      setStep("uploading");

      let contentUrl = "";
      let thumbnailUrl = "";

      // Upload slide JSON data to Walrus
      if (slideData?.data) {
        const contentResult = await uploadJSONToWalrus(
          slideData.data
        );
        contentUrl = contentResult.url;
      }

      // Upload thumbnail to Walrus if it's a data URL
      if (slideData?.thumbnail && slideData.thumbnail.startsWith("data:")) {
        const thumbnailResult = await uploadDataUrlToWalrus(
          slideData.thumbnail
        );
        thumbnailUrl = thumbnailResult.url;
      } else if (slideData?.thumbnail) {
        thumbnailUrl = slideData.thumbnail;
      }

      // Step 2: Mint or Publish on SUI
      let result;
      if (isAlreadyMinted) {
        setStep("minting"); // We'll reuse the minting UI state for publishing
        result = await publishVersion(slideData.objectId);
        console.log("[PUBLISH] Transaction Digest:", result.digest);
        setObjectId(slideData.objectId); // Keep the same ID
      } else {
        setStep("minting");
        result = await mintSlide({
          title: slideData?.title || "Untitled Slide",
          contentUrl: contentUrl || "",
          thumbnailUrl: thumbnailUrl || "",
          price: priceInMist,
          salePrice: salePriceInMist,
          isForSale: isForSale,
        });
        console.log("[MINT] Transaction Digest:", result.digest);
        setObjectId(result.digest); // Just to show something
      }
      setStep("success");

      // Callback to update parent with mint info
      if (onMintSuccess) {
        console.log("[MINT] Calling onMintSuccess with txDigest:", result.digest);
        onMintSuccess({
          txDigest: result.digest,
          contentUrl,
          thumbnailUrl,
        });
      }

      setTimeout(() => {
        onClose();
        setStep("input");
        setPrice("1");
      }, 3000);
    } catch (err) {
      console.error("Mint failed:", err);
      setError(err.message || "Failed to mint slide");
      setStep("input");
    }
  };

  const renderContent = () => {
    switch (step) {
      case "uploading":
        return (
          <div className="text-center py-10 transition-colors">
            {/* Spinner Container */}
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg
                className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-spin"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-10 dark:opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  className="opacity-100"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            {/* Loading Title */}
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
              Uploading to Walrus...
            </h3>

            {/* Description Text */}
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm max-w-[280px] mx-auto leading-relaxed">
              Storing your slide data permanently on the decentralized web
            </p>
          </div>
        );

      case "minting":
        return (
          <div className="text-center py-10 transition-colors">
            {/* SUI Transaction Visualizer */}
            <div className="w-20 h-20 bg-cyan-50 dark:bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <div className="relative">
                <svg
                  className="w-10 h-10 text-cyan-600 dark:text-cyan-400 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>

                {/* Hiệu ứng vòng tròn lan tỏa cho cảm giác đang giao dịch */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan-600 dark:border-cyan-400 animate-ping opacity-20 transition-colors"></div>
              </div>
            </div>

            {/* Minting Status Title */}
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
              Minting on SUI...
            </h3>

            {/* Instruction Text */}
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm max-w-[250px] mx-auto leading-relaxed">
              Please approve the transaction in your wallet to finalize the minting
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-10 transition-colors">
            {/* Success Icon Container */}
            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200/50 dark:shadow-green-500/10 transition-all">
              <svg
                className="w-10 h-10 text-green-600 dark:text-green-400"
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

            {/* Success Message */}
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
              {isAlreadyMinted ? "Version Published!" : "Minted Successfully!"}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">
              Your slide is now on the SUI blockchain
            </p>

            {/* Transaction/Object Details Card */}
            {objectId && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl mx-auto max-w-xs transition-all">
                <p className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 mb-1.5 tracking-[0.15em]">
                  Object ID
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 break-all leading-relaxed font-semibold">
                    {objectId}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
                {isAlreadyMinted ? "Publish New Version" : "Mint to SUI"}
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

            {/* Slide Preview Info */}
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 mb-6 transition-all">
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Asset for Minting
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {slideData?.title || "Untitled Slide"}
              </p>
            </div>

            {/* Minting Form */}
            <form onSubmit={handleMint}>
              <div className="mb-6">
                <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-[0.1em]">
                  License Price (SUI)
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-5 py-4 bg-white dark:bg-black/30 border-2 border-gray-100 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white text-xl font-black focus:border-blue-500 dark:focus:border-cyan-500 focus:outline-none transition-all shadow-sm focus:shadow-blue-500/10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.0001"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-gray-100 dark:bg-black/40 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/5">
                    <svg
                      className="w-5 h-5 text-blue-500 dark:text-cyan-400 shadow-sm"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 font-black text-xs">
                      SUI
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Ownership Sale Section */}
              <div className="mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    List for Full Ownership Sale
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isForSale}
                      onChange={(e) => setIsForSale(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {isForSale && (
                  <div className="relative group animate-in zoom-in-95 duration-200">
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full px-5 py-4 bg-white dark:bg-black/30 border-2 border-gray-100 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white text-xl font-black focus:border-blue-500 dark:focus:border-cyan-500 focus:outline-none transition-all shadow-sm focus:shadow-blue-500/10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="10"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-gray-100 dark:bg-black/40 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/5">
                      <span className="text-gray-700 dark:text-gray-300 font-black text-xs">
                        SUI
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-medium leading-relaxed">
                  {isForSale
                    ? "* Others can purchase full ownership of this slide object."
                    : "* Only licensing is enabled by default."}
                </p>
              </div>

              {/* Smart Contract Info Box */}
              <div className="bg-blue-50 dark:bg-cyan-500/10 border border-blue-100 dark:border-cyan-500/20 rounded-2xl p-4 mb-8 transition-all">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 dark:bg-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-cyan-400 font-black tracking-tight">
                      On-chain Finalization
                    </p>
                    <p className="text-xs text-blue-700/70 dark:text-cyan-400/70 mt-1 leading-relaxed font-medium">
                      Your slide will be permanently stored on IPFS and minted as a unique SUI
                      Object. You will gain full ownership and licensing rights.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
                  <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    {error}
                  </p>
                </div>
              )}

              {/* Action Footer */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer flex-1 px-4 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/10 rounded-2xl font-black text-gray-600 dark:text-gray-300 transition-all active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer flex-[1.8] px-4 py-4 bg-gray-900 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 hover:bg-black dark:hover:from-cyan-500 dark:hover:to-blue-500 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-900/10 dark:shadow-blue-500/25 active:scale-[0.97]"
                >
                  <span>{isAlreadyMinted ? "Publish Version" : "Mint NFT Asset"}</span>
                </button>
              </div>
            </form>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300">
      {/* Backdrop with different opacity for 2 modes */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm transition-colors"
        onClick={step === "input" ? onClose : undefined}
      />

      {/* Modal Box */}
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full mx-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden">
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-600 dark:via-cyan-500 dark:to-blue-500 rounded-t-3xl" />

        {/* Content Area */}
        <div className="mt-2 transition-opacity">{renderContent()}</div>

        {/* Footer Text */}
        {step === "input" && (
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-white/5">
            <p className="text-center text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-[0.15em] font-bold">
              Secured by SUI Network • Decentralized Storage
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MintSlideModal;
