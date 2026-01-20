import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import {
    Undo2, Redo2, Play, Save, ArrowLeft, Layers,
    Cloud, CloudOff, Check, Loader2
} from 'lucide-react';
import { Canvas, Toolbox, PropertiesPanel, SlideNavigator } from '../../components/Editor';
import { TextToolbar } from '../../components/Editor/TextToolbar';
import { ImageToolbar } from '../../components/Editor/ImageToolbar';
import { SlideToolbar } from '../../components/Editor/SlideToolbar';
import { SellSlideModal } from '../../components/Editor/SellSlideModal';
import { MintSlideModal } from '../../components/Editor/MintSlideModal';
import { useSlideStore, useTemporalStore } from '../../store/useSlideStore';
import { useAutoSave } from '../../hooks/useAutoSave';

/**
 * Main Slide Editor Page - Canva-like multi-slide editor
 */
export const Editor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const account = useCurrentAccount();
    const [showSellModal, setShowSellModal] = useState(false);
    const [showMintModal, setShowMintModal] = useState(false);
    const [currentSlideData, setCurrentSlideData] = useState(null);
    const [isMinted, setIsMinted] = useState(false);
    const [suiObjectId, setSuiObjectId] = useState(null);

    const {
        title,
        setTitle,
        slides,
        currentSlideIndex,
        exportToJSON,
        loadFromJSON,
        clearCanvas,
        selectedId,
        selectedIds,
        deleteSelectedElements,
        clearSelection,
        copySelected,
        paste,
        nudgeSelected,
    } = useSlideStore();

    // Auto-save hook
    const { saveStatus } = useAutoSave(id, 2000);

    // Get selected element
    const currentSlide = slides[currentSlideIndex];
    const elements = currentSlide?.elements || [];
    const selectedElement = elements.find((el) => el.id === selectedId);

    // Undo/Redo from temporal store
    const temporalStore = useTemporalStore();
    const { undo, redo, pastStates, futureStates } = temporalStore.getState();
    const canUndo = pastStates.length > 0;
    const canRedo = futureStates.length > 0;

    // Load existing presentation
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
            // Check for auto-saved project
            const autoSaved = localStorage.getItem('current_project');
            if (autoSaved) {
                try {
                    const data = JSON.parse(autoSaved);
                    if (data.slides) {
                        loadFromJSON(data);
                    }
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
            const target = e.target;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

            if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
                if (selectedId || selectedIds.length > 0) {
                    e.preventDefault();
                    deleteSelectedElements();
                }
            }

            if (e.key === 'Escape') {
                clearSelection();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleManualSave();
            }

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
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        nudgeSelected(-step, 0);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        nudgeSelected(step, 0);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        nudgeSelected(0, -step);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        nudgeSelected(0, step);
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, selectedIds, deleteSelectedElements, clearSelection, canUndo, canRedo, undo, redo, copySelected, paste, nudgeSelected]);

    // Generate thumbnail
    const generateThumbnail = useCallback(() => {
        if (window.__slideStage) {
            return window.__slideStage.toDataURL({ pixelRatio: 0.3 });
        }
        return null;
    }, []);

    // Manual save
    const handleManualSave = async () => {
        try {
            const data = exportToJSON();
            const thumbnail = generateThumbnail();

            const slideData = {
                id: id || `slide-${Date.now()}`,
                title,
                thumbnail,
                data,
                slideCount: slides.length,
                createdAt: new Date().toISOString(),
                owner: account?.address || 'local',
                suiObjectId,
            };

            const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
            const existingIndex = savedSlides.findIndex((s) => s.id === slideData.id);

            if (existingIndex >= 0) {
                savedSlides[existingIndex] = slideData;
            } else {
                savedSlides.push(slideData);
            }

            localStorage.setItem('slides', JSON.stringify(savedSlides));
            setCurrentSlideData(slideData);

            if (!id) {
                navigate(`/editor/${slideData.id}`);
            }
        } catch (err) {
            console.error('Save error:', err);
        }
    };

    const handleMintSuccess = ({ txDigest }) => {
        setIsMinted(true);
        setSuiObjectId(txDigest);
        if (currentSlideData) {
            const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
            const existingIndex = savedSlides.findIndex((s) => s.id === currentSlideData.id);
            if (existingIndex >= 0) {
                savedSlides[existingIndex].suiObjectId = txDigest;
                localStorage.setItem('slides', JSON.stringify(savedSlides));
            }
        }
    };

    // Render save status indicator
    const renderSaveStatus = () => {
        switch (saveStatus) {
            case 'saving':
                return (
                    <div className="flex items-center gap-1.5 text-yellow-400 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                    </div>
                );
            case 'saved':
                return (
                    <div className="flex items-center gap-1.5 text-green-400 text-xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex items-center gap-1.5 text-red-400 text-xs">
                        <CloudOff className="w-3.5 h-3.5" />
                        <span>Error</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Cloud className="w-3.5 h-3.5" />
                    </div>
                );
        }
    };

    // Render contextual toolbar based on selection
    const renderContextualToolbar = () => {
        if (selectedElement?.type === 'text') {
            return <TextToolbar element={selectedElement} />;
        }
        if (selectedElement?.type === 'image') {
            return <ImageToolbar element={selectedElement} />;
        }
        return <SlideToolbar />;
    };

    return (
        <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
            {/* Header Row 1: Title & Actions */}
            <header className="h-12 bg-black/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/my-slide')}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 max-w-[200px]"
                        placeholder="Presentation Title"
                    />
                    {renderSaveStatus()}
                    {isMinted && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-medium rounded-full">
                            Minted
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Undo/Redo */}
                    <div className="flex items-center gap-0.5 px-2 border-r border-white/10">
                        <button
                            onClick={() => canUndo && undo()}
                            disabled={!canUndo}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => canRedo && redo()}
                            disabled={!canRedo}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Present */}
                    {id && (
                        <button
                            onClick={() => navigate(`/slide/${id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors text-xs"
                        >
                            <Play className="w-3.5 h-3.5" />
                            Present
                        </button>
                    )}

                    {/* Mint */}
                    {id && !isMinted && (
                        <button
                            onClick={() => setShowMintModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-medium text-xs"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Mint
                        </button>
                    )}

                    {/* Sell */}
                    {id && isMinted && (
                        <button
                            onClick={() => setShowSellModal(true)}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium text-xs"
                        >
                            Sell
                        </button>
                    )}

                    {/* Save */}
                    <button
                        onClick={handleManualSave}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-xs"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Save
                    </button>
                </div>
            </header>

            {/* Header Row 2: Contextual Toolbar */}
            <div className="h-11 bg-black/30 border-b border-white/5 flex items-center justify-center px-4 flex-shrink-0">
                {renderContextualToolbar()}
            </div>

            {/* Main Editor Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Toolbox */}
                <aside className="w-52 p-3 border-r border-white/5 overflow-y-auto flex-shrink-0">
                    <Toolbox />
                </aside>

                {/* Center - Canvas */}
                <main className="flex-1 p-4 overflow-auto flex items-center justify-center">
                    <Canvas />
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-60 p-3 border-l border-white/5 overflow-y-auto flex-shrink-0">
                    <PropertiesPanel />
                </aside>
            </div>

            {/* Bottom - Slide Filmstrip */}
            <SlideNavigator />

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

export default Editor;
