import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { LeftIconRail } from './LeftIconRail';
import { TopHeader } from './TopHeader';
import { FilmstripBar } from './FilmstripBar';
import { CanvasWithRulers } from './CanvasWithRulers';
import { TextToolbar } from './TextToolbar';
import { ImageToolbar } from './ImageToolbar';
import { SlideToolbar } from './SlideToolbar';
import { ElementsPanel } from './ElementsPanel';
import { TextPanel } from './TextPanel';
import { UploadsPanel } from './UploadsPanel';
import { DesignPanel } from './DesignPanel';
import { BrandPanel } from './BrandPanel';
import { AnimatePanel } from './AnimatePanel';
import { ChartsPanel } from './ChartsPanel';
import { SellSlideModal } from './SellSlideModal';
import { MintSlideModal } from './MintSlideModal';
import { useSlideStore, useTemporalStore } from '../../store/useSlideStore';
import { useAutoSave } from '../../hooks/useAutoSave';

/**
 * EditorLayout - Canva-style grid layout
 * Grid structure: Icon Rail (48px) | Canvas + Sidebar | Filmstrip (80px)
 */
export const EditorLayout = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const account = useCurrentAccount();

    const [activeTab, setActiveTab] = useState('elements');
    const [showSellModal, setShowSellModal] = useState(false);
    const [showMintModal, setShowMintModal] = useState(false);
    const [currentSlideData, setCurrentSlideData] = useState(null);
    const [isMinted, setIsMinted] = useState(false);
    const [suiObjectId, setSuiObjectId] = useState(null);

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
        if (id) {
            const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
            const slide = savedSlides.find((s) => s.id === id);
            if (slide?.data) {
                loadFromJSON(slide.data);
                setCurrentSlideData(slide);
                if (slide.suiObjectId) {
                    setIsMinted(true);
                    setSuiObjectId(slide.suiObjectId);
                }
            }
        } else {
            const autoSaved = localStorage.getItem('current_project');
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
            setTitle('Untitled Presentation');
        }
    }, [id, loadFromJSON, clearCanvas, setTitle]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

            if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
                if (selectedId || selectedIds.length > 0) {
                    e.preventDefault();
                    deleteSelectedElements();
                }
            }

            if (e.key === 'Escape') clearSelection();

            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) undo();
            }

            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (canRedo) redo();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isInput) {
                e.preventDefault();
                copySelected();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isInput) {
                e.preventDefault();
                paste();
            }

            if (!isInput && (selectedId || selectedIds.length > 0)) {
                const step = e.shiftKey ? 10 : 1;
                if (e.key.startsWith('Arrow')) {
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

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, selectedIds, canUndo, canRedo, undo, redo, deleteSelectedElements, clearSelection, copySelected, paste, nudgeSelected]);

    const handleMintSuccess = ({ txDigest }) => {
        setIsMinted(true);
        setSuiObjectId(txDigest);
    };

    // Handle animate button click
    const handleAnimateClick = () => {
        setActiveTab('animate');
    };

    // Render contextual toolbar
    const renderContextualToolbar = () => {
        if (selectedElement?.type === 'text') {
            return <TextToolbar element={selectedElement} onAnimateClick={handleAnimateClick} />;
        }
        if (selectedElement?.type === 'image') {
            return <ImageToolbar element={selectedElement} onAnimateClick={handleAnimateClick} />;
        }
        return <SlideToolbar />;
    };

    return (
        <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
            {/* Top Header */}
            <TopHeader projectId={id} />

            {/* Contextual Toolbar */}
            <div className="h-14 bg-[#0d0d0d] border-b border-white/5 flex items-center justify-center">
                {renderContextualToolbar()}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Icon Rail */}
                <LeftIconRail activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Sidebar Drawer */}
                {activeTab && (
                    <div className="w-72 bg-[#0d0d0d] border-r border-white/5 overflow-y-auto">
                        <div className="p-4">
                            <h3 className="text-sm font-semibold mb-3 capitalize">{activeTab}</h3>
                            {activeTab === 'elements' && <ElementsPanel />}
                            {activeTab === 'text' && <TextPanel />}
                            {activeTab === 'uploads' && <UploadsPanel />}
                            {activeTab === 'design' && <DesignPanel />}
                            {activeTab === 'brand' && <BrandPanel />}
                            {activeTab === 'animate' && <AnimatePanel />}
                            {activeTab === 'charts' && <ChartsPanel />}
                        </div>
                    </div>
                )}

                {/* Canvas Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Rulers placeholder */}
                    <div className="flex-1 relative">
                        <CanvasWithRulers />
                    </div>
                </div>
            </div>

            {/* Bottom Filmstrip */}
            <FilmstripBar />

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
