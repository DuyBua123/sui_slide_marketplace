import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMySlides } from "../hooks/useMySlides";
import { useDeleteSlide } from "../hooks/useDeleteSlide";
import { deleteLocalSlideRecord } from "../utils/deletedSlidesTracker";
import { ManageAccessModal } from "../components/Editor/ManageAccessModal";
import { SellSlideModal } from "../components/Editor/SellSlideModal";
import { fetchFromWalrus } from "../services/exports/exportToWalrus";
import { getWalrusUrl } from "../utils/walrus";
import { ShieldCheck, Play, Edit, Trash2, Settings2, Store, Clock } from "lucide-react";

/**
 * My Slides Page - Gallery of user's owned slides (from blockchain + localStorage)
 */
export const MySlide = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { slides: blockchainSlides, isLoading: isLoadingBlockchain } = useMySlides();
  const { deleteSlide, isLoading: isDeletingBlockchain } = useDeleteSlide();
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useBlockchain, setUseBlockchain] = useState(true);
  const [selectedSlideForAccess, setSelectedSlideForAccess] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedSlideForSale, setSelectedSlideForSale] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);

  // Helper functions
  const checkIsExpired = (slide) => {
    if (!slide.expiresAt || slide.expiresAt === "0") return false;
    return Date.now() > parseInt(slide.expiresAt);
  };

  const getTimeRemaining = (slide) => {
    if (!slide.expiresAt || slide.expiresAt === "0") return "Unlimited";
    const remaining = parseInt(slide.expiresAt) - Date.now();
    if (remaining <= 0) return "Expired";
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    return `${hours}h`;
  };

  // Load slides from both blockchain and localStorage
  useEffect(() => {
    const loadSlides = () => {
      if (useBlockchain) {
        if (isLoadingBlockchain) {
          setIsLoading(true);
        } else {
          // Map expiry status
          const processed = blockchainSlides.map(s => ({
            ...s,
            isExpired: checkIsExpired(s),
            remainingText: getTimeRemaining(s)
          }));
          setSlides(processed);
          setIsLoading(false);
        }
      } else {
        const savedSlides = JSON.parse(localStorage.getItem("slides") || "[]");
        const userSlides = savedSlides.filter(
          (s) => s.owner === account?.address || s.owner === "local",
        ).map(s => ({
          ...s,
          isOwner: true,
          isLicensed: false,
          isExpired: false, // Local slides don't expire usually
          remainingText: "Unlimited"
        }));
        setSlides(userSlides);
        setIsLoading(false);
      }
    };

    loadSlides();

    const handleStorageChange = (e) => {
      if (e.key === "slides" || e.key === "current_project") {
        loadSlides();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [account?.address, blockchainSlides, useBlockchain, isLoadingBlockchain]);

  // Handle forking a licensed slide
  const handleFork = async (slide) => {
    setIsLoading(true);
    try {
      console.log('Forking slide:', slide.title);
      let content = null;

      // Fetch content from Walrus if available
      if (slide.contentUrl) {
        content = await fetchFromWalrus(slide.contentUrl);
      }

      if (!content) {
        throw new Error('Could not fetch slide content');
      }

      // Create new local slide
      const newId = crypto.randomUUID();
      const newSlide = {
        id: newId,
        title: `${content.title || slide.title} (Copy)`,
        thumbnail: slide.thumbnail, // Use original thumbnail initially
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: 'local',
        data: {
          ...content,
          id: newId,
          title: `${content.title || slide.title} (Copy)`,
        }
      };

      // Save to localStorage
      const savedSlides = JSON.parse(localStorage.getItem("slides") || "[]");
      savedSlides.push(newSlide);
      localStorage.setItem("slides", JSON.stringify(savedSlides));

      // Navigate to editor with local source
      navigate(`/editor/${newId}`, { state: { source: 'local', slide: newSlide } });

    } catch (error) {
      console.error('Error forking slide:', error);
      alert('Failed to create a local copy of this slide. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = useCallback((slide) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      if (useBlockchain && slide.suiObjectId) {
        deleteSlide({
          slideObjectId: slide.suiObjectId,
          onSuccess: () => {
            deleteLocalSlideRecord(slide.suiObjectId);
            setSlides(prev => prev.filter((s) => s.id !== slide.id));
            localStorage.setItem("marketplace_refresh", Date.now().toString());
          },
          onError: (error) => {
            alert('Failed to delete slide: ' + (error.message || error.toString()));
          },
        });
      } else {
        const savedSlides = JSON.parse(localStorage.getItem("slides") || "[]");
        const updated = savedSlides.filter((s) => s.id !== slide.id);
        localStorage.setItem("slides", JSON.stringify(updated));
        setSlides(prev => prev.filter((s) => s.id !== slide.id));
        localStorage.setItem("marketplace_refresh", Date.now().toString());
      }
    }
  }, [useBlockchain, deleteSlide]);

  return (
    <div className="py-10 transition-colors duration-500 max-w-[1400px] mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">My Slides</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Manage and edit your slide presentations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-white/10">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Source</span>
            <button
              onClick={() => setUseBlockchain(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${useBlockchain ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Blockchain
            </button>
            <button
              onClick={() => setUseBlockchain(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!useBlockchain ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Local
            </button>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('current_project');
              navigate("/editor");
            }}
            className="cursor-pointer flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-500/25 active:scale-95"
          >
            New Slide
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Sycing with SUI...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50 dark:bg-white/2 rounded-[40px] border border-dashed border-gray-200 dark:border-white/5">
          <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Empty Gallery</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">Start your journey by creating or purchasing your first slide.</p>
          <button onClick={() => navigate("/editor")} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">Create First Slide</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {slides.map((slide) => (
            <div key={slide.id} className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-black/40">
                {slide.thumbnail ? (
                  <img src={slide.thumbnail.startsWith('walrus://') ? getWalrusUrl(slide.thumbnail.replace('walrus://', '')) : slide.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700"><Settings2 className="w-12 h-12" /></div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                  <button
                    onClick={() => {
                      if (slide.isExpired) return;
                      if (slide.isLicensed) {
                        handleFork(slide);
                      } else {
                        navigate(`/editor/${slide.id}`, { state: { source: useBlockchain ? 'blockchain' : 'local', slide } });
                      }
                    }}
                    disabled={slide.isExpired}
                    title={slide.isExpired ? "License expired" : "Edit slide"}
                    className={`p-3 text-white rounded-xl shadow-lg transition-all ${slide.isExpired ? 'bg-gray-500/50 cursor-not-allowed' : 'bg-blue-600 hover:scale-110'}`}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {slide.isOwner && slide.suiObjectId && (
                    <button onClick={() => { setSelectedSlideForAccess(slide); setShowAccessModal(true); }} className="p-3 bg-red-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all"><ShieldCheck className="w-5 h-5" /></button>
                  )}
                  <button
                    onClick={() => {
                      if (slide.isExpired) return;
                      navigate(`/slide/${slide.id}`, { state: { source: useBlockchain ? 'blockchain' : 'local', slide } });
                    }}
                    disabled={slide.isExpired}
                    title={slide.isExpired ? "License expired" : "Play slide"}
                    className={`p-3 text-white rounded-xl shadow-lg transition-all ${slide.isExpired ? 'bg-gray-500/50 cursor-not-allowed' : 'bg-cyan-600 hover:scale-110'}`}
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  {slide.isOwner && slide.suiObjectId && (
                    <button onClick={() => { setSelectedSlideForSale(slide); setShowSellModal(true); }} className="p-3 bg-purple-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all"><Store className="w-5 h-5" /></button>
                  )}
                  <button onClick={() => handleDelete(slide)} disabled={isDeletingBlockchain} className="p-3 bg-white/10 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-black text-gray-900 dark:text-white truncate text-lg tracking-tight">{slide.title}</h3>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${slide.isOwner ? 'bg-green-500/10 text-green-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                      {slide.isOwner ? 'Owner' : 'License'}
                    </span>
                  </div>

                  {slide.isLicensed && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3 h-3 ${slide.isExpired ? 'text-red-500' : 'text-cyan-500'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${slide.isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                          {slide.isExpired ? 'Expired' : `Expires in ${slide.remainingText}`}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 font-bold">{slide.createdAt ? new Date(slide.createdAt).toLocaleDateString() : 'Active'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlideForAccess && (
        <ManageAccessModal
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          slide={selectedSlideForAccess}
        />
      )}

      {selectedSlideForSale && (
        <SellSlideModal
          isOpen={showSellModal}
          onClose={() => setShowSellModal(false)}
          slideId={selectedSlideForSale.suiObjectId}
          slideTitle={selectedSlideForSale.title}
          initialData={{
            price: selectedSlideForSale.price,
            salePrice: selectedSlideForSale.salePrice,
            isListed: selectedSlideForSale.isListed,
            isForSale: selectedSlideForSale.isForSale
          }}
        />
      )}
    </div>
  );
};

export default MySlide;
