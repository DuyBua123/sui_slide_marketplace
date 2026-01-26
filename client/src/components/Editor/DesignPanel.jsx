import { Search, Sparkles, ArrowLeft, Layers, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useMySlides } from "../../hooks/useMySlides";
import { fetchFromWalrus } from "../../services/exports/exportToWalrus";
import { useSlideStore } from "../../store/useSlideStore"; // Import store
import { useCurrentAccount } from "@mysten/dapp-kit";

/**
 * Design Panel - Browse and import pages from user's slides
 */
export const DesignPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'license', 'owner', 'local'
  const [selectedSlide, setSelectedSlide] = useState(null); // For detail view
  const [fetchedSlideData, setFetchedSlideData] = useState(null); // Content of selected slide
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Store actions
  const { insertSlide } = useSlideStore();

  // Blockchain slides
  const { slides: blockchainSlides, isLoading: isLoadingBlockchain } = useMySlides();
  const account = useCurrentAccount();

  const [localSlides, setLocalSlides] = useState([]);

  // Load local slides
  useEffect(() => {
    const loadLocalSlides = () => {
      const saved = JSON.parse(localStorage.getItem("slides") || "[]");
      // Filter out those that are just cached blockchain slides (if any logic exists for that),
      // but usually 'local' owner means local.
      setLocalSlides(saved.filter(s => s.owner === 'local' || !s.suiObjectId));
    };
    loadLocalSlides();
  }, []);

  // Combine and Filter Slides
  const filteredSlides = useMemo(() => {
    let all = [];

    // Normalize structure
    const normalizedBlockchain = blockchainSlides.map(s => ({ ...s, type: s.isLicensed ? 'license' : 'owner' }));
    const normalizedLocal = localSlides.map(s => ({ ...s, type: 'local', isOwner: true }));

    if (activeFilter === 'local') {
      all = normalizedLocal;
    } else if (activeFilter === 'license') {
      all = normalizedBlockchain.filter(s => s.type === 'license');
    } else if (activeFilter === 'owner') { // Blockchain Owner
      all = normalizedBlockchain.filter(s => s.type === 'owner');
    } else {
      all = [...normalizedBlockchain, ...normalizedLocal];
    }

    if (searchQuery) {
      all = all.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return all;
  }, [blockchainSlides, localSlides, activeFilter, searchQuery]);

  // Handle Slide Selection
  const handleSlideClick = async (slide) => {
    setSelectedSlide(slide);
    setFetchedSlideData(null);

    // Valid local data?
    if (slide.data && slide.data.slides) {
      setFetchedSlideData(slide.data);
      return;
    }

    // Need to fetch from Walrus?
    if (slide.contentUrl) {
      setIsLoadingDetails(true);
      try {
        const data = await fetchFromWalrus(slide.contentUrl);
        setFetchedSlideData(data);
      } catch (err) {
        console.error("Failed to load slide details", err);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  const handleApplyAll = () => {
    if (!fetchedSlideData?.slides) return;
    fetchedSlideData.slides.forEach(slide => {
      insertSlide(slide); // Insert all pages sequentially
    });
  };

  const handleInsertPage = (page) => {
    insertSlide(page);
  };

  // Render Detail View
  if (selectedSlide) {
    return (
      <div className={`flex flex-col h-full bg-white dark:bg-gray-950 transition-colors ${isBlocked ? 'grayscale-[0.5]' : ''}`}>
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
          <button
            onClick={() => setSelectedSlide(null)}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate dark:text-white">{selectedSlide.title}</h3>
            <p className="text-xs text-gray-500 truncate">
              {selectedSlide.type === 'license' ? 'Licensed' : (selectedSlide.type === 'local' ? 'Local Draft' : 'Owned')}
            </p>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-white/5">
          {isBlocked ? (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-2">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-tight">
                License Expired. Renew to enable insertion.
              </p>
            </div>
          ) : null}
          <button
            onClick={handleApplyAll}
            disabled={!fetchedSlideData || isBlocked}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Apply All {fetchedSlideData?.slides?.length || ''} Pages
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Loading pages...</p>
            </div>
          ) : fetchedSlideData?.slides ? (
            <div className="grid grid-cols-2 gap-3">
              {fetchedSlideData.slides.map((page, idx) => (
                <div
                  key={idx}
                  onClick={() => !isBlocked && handleInsertPage(page)}
                  className={`group relative aspect-video bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden ${isBlocked ? 'cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-purple-500'} transition-all`}
                >
                  {/* Mini thumbnail visualization could go here, for now using color */}
                  <div className="w-full h-full" style={{ background: page.background || '#fff' }}>
                    {/* Simple representation of elements count */}
                    <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 ${isBlocked ? 'bg-black/60' : 'bg-black/40'} transition-opacity`}>
                      <span className="text-white text-xs font-bold flex items-center gap-1">
                        {isBlocked ? 'Locked' : <><CheckCircle2 className="w-3 h-3" /> Insert</>}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/50 rounded text-[9px] text-white">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-gray-500">
              Failed to load content.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render List View
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 transition-colors">
      {/* Search */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5 pb-2">
        <div className="relative group mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your slides..."
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 dark:focus:border-purple-400 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'license', 'owner', 'local'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === filter
                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300'
                : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoadingBlockchain ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSlides.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-500">
            No slides found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredSlides.map((slide) => (
              <div
                key={slide.id}
                onClick={() => handleSlideClick(slide)}
                className="group cursor-pointer bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-500/30 transition-all"
              >
                <div className="aspect-video bg-gray-100 dark:bg-black/20 relative">
                  {slide.thumbnail ? (
                    <img src={slide.thumbnail} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                    {slide.type}
                  </div>
                </div>
                <div className="p-2.5">
                  <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate mb-0.5">{slide.title}</h4>
                  <p className="text-[10px] text-gray-500 truncate">
                    {new Date(slide.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignPanel;
