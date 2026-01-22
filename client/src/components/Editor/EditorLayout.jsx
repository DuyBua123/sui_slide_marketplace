import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { LeftIconRail } from "./LeftIconRail";
import { TopHeader } from "./TopHeader";
import { FilmstripBar } from "./FilmstripBar";
import { CanvasWithRulers } from "./CanvasWithRulers";
import { TextToolbar } from "./TextToolbar";
import { ImageToolbar } from "./ImageToolbar";
import { SlideToolbar } from "./SlideToolbar";
import { ElementsPanel } from "./ElementsPanel";
import { TextPanel } from "./TextPanel";
import { UploadsPanel } from "./UploadsPanel";
import { DesignPanel } from "./DesignPanel";
import { BrandPanel } from "./BrandPanel";
import { AnimatePanel } from "./AnimatePanel";
import { ChartsPanel } from "./ChartsPanel";
import { SellSlideModal } from "./SellSlideModal";
import { MintSlideModal } from "./MintSlideModal";
import { useSlideStore, useTemporalStore } from "../../store/useSlideStore";
import { useAutoSave } from "../../hooks/useAutoSave";
import { useUpdateSlide } from "../../hooks/useUpdateSlide";
import { saveSlideToBlockchain } from "../../services/blockchain/blockchainSave";
import { fetchFromIPFS } from "../../services/exports/exportToIPFS";

/**
 * EditorLayout - Canva-style grid layout
 * Grid structure: Icon Rail (48px) | Canvas + Sidebar | Filmstrip (80px)
 */
export const EditorLayout = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const account = useCurrentAccount();

  const [activeTab, setActiveTab] = useState("elements");
  const [showSellModal, setShowSellModal] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [currentSlideData, setCurrentSlideData] = useState(null);
  const [isMinted, setIsMinted] = useState(false);
  const [suiObjectId, setSuiObjectId] = useState(null);
  const [blockchainSaveStatus, setBlockchainSaveStatus] = useState(null); // null | 'saving' | 'success' | 'error'
  const [blockchainSaveError, setBlockchainSaveError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    title,
    slides,
    currentSlideIndex,
    selectedId,
    selectedIds,
    exportToJSON,
    loadFromJSON,
    clearCanvas,
    setTitle,
    deleteSelectedElements,
    clearSelection,
    copySelected,
    paste,
    nudgeSelected,
  } = useSlideStore();

  const { saveStatus } = useAutoSave(id, 2000);
  const { updateSlide, isLoading: isUpdating } = useUpdateSlide();

  // Get selected element
  const currentSlide = slides[currentSlideIndex];
  const elements = currentSlide?.elements || [];
  const selectedElement = elements.find((el) => el.id === selectedId);

  // Undo/Redo
  const temporalStore = useTemporalStore();
  const { undo, redo, pastStates, futureStates } = temporalStore.getState();
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  // Load presentation
  useEffect(() => {
    const loadInitialData = async () => {
      const source = location.state?.source;
      const slideMeta = location.state?.slide;

      console.log('[EDITOR] Loading presentation, id:', id, 'source:', source);

      if (id) {
        setIsLoading(true);
        try {
          if (source === 'blockchain' && slideMeta?.contentUrl) {
            console.log('[EDITOR] Fetching minted content from IPFS:', slideMeta.contentUrl);
            const data = await fetchFromIPFS(slideMeta.contentUrl);
            if (data) {
              console.log('[EDITOR] Successfully fetched minted content');
              loadFromJSON(data);
              setCurrentSlideData({ ...slideMeta, data });
              setIsMinted(true);
              setSuiObjectId(slideMeta.suiObjectId || slideMeta.id);
              setIsLoading(false);
              return;
            }
          }

          // Fallback to localStorage
          const savedSlides = JSON.parse(localStorage.getItem("slides") || "[]");
          const slide = savedSlides.find((s) => s.id === id);
          if (slide?.data) {
            console.log('[EDITOR] Loading from local storage');
            loadFromJSON(slide.data);
            setCurrentSlideData(slide);
            if (slide.suiObjectId) {
              setIsMinted(true);
              setSuiObjectId(slide.suiObjectId);
            }
          }
        } catch (error) {
          console.error('[EDITOR] Error loading slide data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        const autoSaved = localStorage.getItem("current_project");
        if (autoSaved) {
          try {
            const data = JSON.parse(autoSaved);
            if (data.slides) loadFromJSON(data);
          } catch (e) {
            clearCanvas();
          }
        } else {
          clearCanvas();
        }
        setTitle("Untitled Presentation");
      }
    };

    loadInitialData();
  }, [id, loadFromJSON, clearCanvas, setTitle, location.state]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";

      if ((e.key === "Delete" || e.key === "Backspace") && !isInput) {
        if (selectedId || selectedIds.length > 0) {
          e.preventDefault();
          deleteSelectedElements();
        }
      }

      if (e.key === "Escape") clearSelection();

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !isInput) {
        e.preventDefault();
        copySelected();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "v" && !isInput) {
        e.preventDefault();
        paste();
      }

      if (!isInput && (selectedId || selectedIds.length > 0)) {
        const step = e.shiftKey ? 10 : 1;
        if (e.key.startsWith("Arrow")) {
          e.preventDefault();
          const deltaMap = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step],
          };
          const [dx, dy] = deltaMap[e.key] || [0, 0];
          nudgeSelected(dx, dy);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedId,
    selectedIds,
    canUndo,
    canRedo,
    undo,
    redo,
    deleteSelectedElements,
    clearSelection,
    copySelected,
    paste,
    nudgeSelected,
  ]);

  const handleMintSuccess = ({ txDigest }) => {
    console.log("[EDITOR] Mint Success - Object ID:", txDigest);
    console.log("[EDITOR] Full transaction digest:", txDigest);
    setIsMinted(true);
    setSuiObjectId(txDigest);
    console.log("[EDITOR] State updated - isMinted: true, suiObjectId:", txDigest);
  };

  // Handle animate button click
  const handleAnimateClick = () => {
    setActiveTab("animate");
  };

  // Save changes to blockchain
  const handleSaveToBlockchain = useCallback(async () => {
    console.log("[BLOCKCHAIN] Save initiated - isMinted:", isMinted, "suiObjectId:", suiObjectId);
    
    if (!isMinted || !suiObjectId) {
      console.warn("[BLOCKCHAIN] Cannot save - Slide must be minted first");
      setBlockchainSaveError("Slide must be minted before saving to blockchain");
      return;
    }

    setBlockchainSaveStatus("saving");
    setBlockchainSaveError(null);

    try {
      console.log("[BLOCKCHAIN] Calling saveSlideToBlockchain with object ID:", suiObjectId);
      const result = await saveSlideToBlockchain({
        suiObjectId,
        title,
        slides,
        onUpdate: updateSlide,
      });

      console.log("[BLOCKCHAIN] Save successful! Transaction digest:", result.txDigest);
      console.log("[BLOCKCHAIN] Content URL:", result.contentUrl);
      console.log("[BLOCKCHAIN] Full result:", result);
      
      setBlockchainSaveStatus("success");

      // Reset success status after 3 seconds
      setTimeout(() => {
        setBlockchainSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error("[BLOCKCHAIN] Save error:", error);
      console.error("[BLOCKCHAIN] Error message:", error.message);
      setBlockchainSaveError(error.message);
      setBlockchainSaveStatus("error");
    }
  }, [isMinted, suiObjectId, title, slides, updateSlide]);

  // Render contextual toolbar
  const renderContextualToolbar = () => {
    if (selectedElement?.type === "text") {
      return <TextToolbar element={selectedElement} onAnimateClick={handleAnimateClick} />;
    }
    if (selectedElement?.type === "image") {
      return <ImageToolbar element={selectedElement} onAnimateClick={handleAnimateClick} />;
    }
    return <SlideToolbar />;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#f8f9fa] dark:bg-[#0a0a0f] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading slide from blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f8f9fa] dark:bg-[#0a0a0f] text-gray-900 dark:text-white flex flex-col overflow-hidden transition-colors duration-300">
      {/* Top Header */}
      <TopHeader 
        projectId={id}
        onSaveToBlockchain={handleSaveToBlockchain}
        isMinted={isMinted}
        blockchainSaveStatus={blockchainSaveStatus}
        blockchainSaveError={blockchainSaveError}
        isUpdating={isUpdating}
        onMintClick={() => setShowMintModal(true)}
      />

      {/* Contextual Toolbar */}
      <div className="h-14 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-white/5 flex items-center justify-center shadow-sm z-20 transition-colors">
        {renderContextualToolbar()}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Icon Rail */}
        <LeftIconRail activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Sidebar Drawer */}
        {activeTab && (
          <div className="w-72 bg-white dark:bg-[#0d0d0d] border-r border-gray-200 dark:border-white/5 overflow-y-auto z-10 transition-all shadow-lg dark:shadow-none">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-white">
                  {activeTab}
                </h3>
                {/* Có thể thêm nút đóng nhanh sidebar ở đây */}
              </div>

              <div className="text-gray-700 dark:text-gray-300">
                {activeTab === "elements" && <ElementsPanel />}
                {activeTab === "text" && <TextPanel />}
                {activeTab === "uploads" && <UploadsPanel />}
                {activeTab === "design" && <DesignPanel />}
                {activeTab === "brand" && <BrandPanel />}
                {activeTab === "animate" && <AnimatePanel />}
                {activeTab === "charts" && <ChartsPanel />}
              </div>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f2f5] dark:bg-[#0a0a0f]">
          {/* Canvas container with Rulers */}
          <div className="flex-1 relative">
            <CanvasWithRulers />
          </div>
        </div>
      </div>

      {/* Bottom Filmstrip - Thanh trượt slide phía dưới */}
      <div className="bg-white dark:bg-[#0d0d0d] border-t py-2 border-gray-200 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
        <FilmstripBar />
      </div>

      {/* Modals */}
      <MintSlideModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        slideData={currentSlideData}
        onMintSuccess={handleMintSuccess}
      />

      <SellSlideModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        slideId={suiObjectId}
        slideTitle={title}
      />
    </div>
  );
};

export default EditorLayout;
