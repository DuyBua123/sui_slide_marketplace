import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Canvas, Toolbox, PropertiesPanel } from '../../components/Editor';
import { SellSlideModal } from '../../components/Editor/SellSlideModal';
import { MintSlideModal } from '../../components/Editor/MintSlideModal';
import { useSlideStore } from '../../store/useSlideStore';

/**
 * Main Slide Editor Page
 * Canva-like editor using React Konva
 */
export const Editor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const account = useCurrentAccount();
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [showMintModal, setShowMintModal] = useState(false);
    const [currentSlideData, setCurrentSlideData] = useState(null);
    const [isMinted, setIsMinted] = useState(false);
    const [suiObjectId, setSuiObjectId] = useState(null);

    const {
        title,
        setTitle,
        elements,
        exportToJSON,
        loadFromJSON,
        clearCanvas,
        selectedId,
        deleteElement,
        clearSelection,
    } = useSlideStore();

    // Load existing slide if editing
    useEffect(() => {
        if (id) {
            // Load slide data from localStorage (mock for IPFS)
            const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
            const slide = savedSlides.find((s) => s.id === id);
            if (slide && slide.data) {
                loadFromJSON(slide.data);
                setCurrentSlideData(slide);
                // Check if already minted
                if (slide.suiObjectId) {
                    setIsMinted(true);
                    setSuiObjectId(slide.suiObjectId);
                }
            }
        } else {
            // New slide - clear canvas
            clearCanvas();
            setTitle('Untitled Slide');
        }
    }, [id, loadFromJSON, clearCanvas, setTitle]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    deleteElement(selectedId);
                }
            }
            if (e.key === 'Escape') {
                clearSelection();
            }
            // Ctrl+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, deleteElement, clearSelection]);

    // Generate thumbnail from canvas
    const generateThumbnail = useCallback(() => {
        if (window.__slideStage) {
            return window.__slideStage.toDataURL({ pixelRatio: 0.3 });
        }
        return null;
    }, []);

    // Save slide locally (mock for IPFS)
    const handleSave = async () => {
        setIsSaving(true);

        try {
            const data = exportToJSON();
            const thumbnail = generateThumbnail();

            const slideData = {
                id: id || `slide-${Date.now()}`,
                title,
                thumbnail,
                data,
                createdAt: new Date().toISOString(),
                owner: account?.address || 'local',
                suiObjectId: suiObjectId, // Preserve if already minted
            };

            // Save to localStorage (mock)
            const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
            const existingIndex = savedSlides.findIndex((s) => s.id === slideData.id);

            if (existingIndex >= 0) {
                savedSlides[existingIndex] = slideData;
            } else {
                savedSlides.push(slideData);
            }

            localStorage.setItem('slides', JSON.stringify(savedSlides));
            setCurrentSlideData(slideData);

            // Navigate to my-slides or stay
            if (!id) {
                navigate(`/editor/${slideData.id}`);
            }

            setShowSaveModal(true);
            setTimeout(() => setShowSaveModal(false), 2000);
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle mint success - update local slide with SUI Object ID
    const handleMintSuccess = ({ txDigest }) => {
        setIsMinted(true);
        setSuiObjectId(txDigest); // In production, parse effects to get actual object ID

        // Update localStorage with SUI Object ID
        if (currentSlideData) {
            const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
            const existingIndex = savedSlides.findIndex((s) => s.id === currentSlideData.id);
            if (existingIndex >= 0) {
                savedSlides[existingIndex].suiObjectId = txDigest;
                savedSlides[existingIndex].isMinted = true;
                localStorage.setItem('slides', JSON.stringify(savedSlides));
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Header */}
            <header className="h-16 bg-black/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/my-slide')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent border-none text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        placeholder="Slide Title"
                    />
                    {isMinted && (
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
                            ✓ Minted
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                        {elements.length} element{elements.length !== 1 ? 's' : ''}
                    </span>

                    {/* Mint Button - Only show for saved slides that aren't minted */}
                    {id && !isMinted && (
                        <button
                            onClick={() => setShowMintModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-medium transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Mint to SUI</span>
                        </button>
                    )}

                    {/* Sell Button - Only show for minted slides */}
                    {id && isMinted && (
                        <button
                            onClick={() => setShowSellModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-medium transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Sell</span>
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {isSaving ? (
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                        )}
                        <span>Save</span>
                    </button>
                </div>
            </header>

            {/* Main Editor Layout */}
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Sidebar - Toolbox */}
                <aside className="w-64 p-4 border-r border-white/5 overflow-y-auto">
                    <Toolbox />
                </aside>

                {/* Center - Canvas */}
                <main className="flex-1 p-6 overflow-auto">
                    <Canvas />
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-72 p-4 border-l border-white/5 overflow-y-auto">
                    <PropertiesPanel />
                </aside>
            </div>

            {/* Save success modal */}
            {showSaveModal && (
                <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-pulse">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Slide saved successfully!</span>
                </div>
            )}

            {/* Mint Slide Modal */}
            <MintSlideModal
                isOpen={showMintModal}
                onClose={() => setShowMintModal(false)}
                slideData={currentSlideData}
                onMintSuccess={handleMintSuccess}
            />

            {/* Sell Slide Modal */}
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
