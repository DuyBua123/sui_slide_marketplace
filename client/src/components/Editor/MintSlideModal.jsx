import { useState } from "react";
import { useMintSlide } from "../../hooks/useMintSlide";
import { uploadJSONToPinata, uploadDataUrlToPinata } from "../../utils/pinata";

/**
 * Modal for minting a slide to SUI blockchain
 */
export const MintSlideModal = ({ isOpen, onClose, slideData, onMintSuccess }) => {
  const [price, setPrice] = useState("1");
  const [step, setStep] = useState("input"); // 'input' | 'uploading' | 'minting' | 'success'
  const [error, setError] = useState(null);
  const [objectId, setObjectId] = useState(null);

  const { mintSlide, isLoading: isMinting } = useMintSlide();

  if (!isOpen) return null;

  const handleMint = async (e) => {
    e.preventDefault();
    setError(null);

    const priceInMist = Math.floor(parseFloat(price) * 1_000_000_000);

    if (priceInMist <= 0) {
      setError("Please enter a valid price");
      return;
    }

    try {
      // Step 1: Upload content to IPFS
      setStep("uploading");

      let contentUrl = "";
      let thumbnailUrl = "";

      // Upload slide JSON data to IPFS
      if (slideData?.data) {
        const contentResult = await uploadJSONToPinata(
          slideData.data,
          `${slideData.title || "slide"}-content.json`,
        );
        contentUrl = contentResult.url;
      }

      // Upload thumbnail to IPFS if it's a data URL
      if (slideData?.thumbnail && slideData.thumbnail.startsWith("data:")) {
        const thumbnailResult = await uploadDataUrlToPinata(
          slideData.thumbnail,
          `${slideData.title || "slide"}-thumbnail.png`,
        );
        thumbnailUrl = thumbnailResult.url;
      } else if (slideData?.thumbnail) {
        thumbnailUrl = slideData.thumbnail;
      }

      // Step 2: Mint on SUI
      setStep("minting");

      const result = await mintSlide({
        title: slideData?.title || "Untitled Slide",
        contentUrl: contentUrl || "ipfs://placeholder",
        thumbnailUrl: thumbnailUrl || "",
        price: priceInMist,
      });

      // Get the created object ID from transaction effects
      // This is a simplified version - in production you'd parse the effects
      setObjectId(result.digest);
      setStep("success");

      // Callback to update parent with mint info
      if (onMintSuccess) {
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
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Uploading to IPFS...</h3>
            <p className="text-gray-400">Storing your slide data permanently</p>
          </div>
        );

      case "minting":
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-cyan-400 animate-pulse"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Minting on SUI...</h3>
            <p className="text-gray-400">Please approve the transaction in your wallet</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Minted Successfully!</h3>
            <p className="text-gray-400">Your slide is now on the SUI blockchain</p>
            {objectId && (
              <p className="text-xs text-gray-500 mt-2 break-all">TX: {objectId}</p>
            )}
          </div>
        );

      default:
        return (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mint to SUI</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Slide info */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400">Minting</p>
              <p className="text-lg font-semibold text-white truncate">
                {slideData?.title || "Untitled Slide"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleMint}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  License Price (SUI)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-lg font-semibold focus:border-cyan-500 focus:outline-none"
                    placeholder="1.0"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-cyan-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span className="text-gray-400 font-medium">SUI</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is the price others pay to license your slide
                </p>
              </div>

              {/* Info */}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-cyan-400 font-medium">What happens</p>
                    <p className="text-xs text-cyan-400/70 mt-1">
                      Your slide will be uploaded to IPFS and minted as a SUI Object. You'll
                      own it and can sell licenses or transfer ownership.
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Mint NFT</span>
                </button>
              </div>
            </form>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300">
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={step === "input" ? onClose : undefined}
      />
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-500">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-2xl" />

        <div className="mt-2">{renderContent()}</div>
        {step === "input" && (
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-6 uppercase tracking-widest font-medium">
            Secured by SUI Network • Decentralized Storage
          </p>
        )}
      </div>
    </div>
  );
};

export default MintSlideModal;
