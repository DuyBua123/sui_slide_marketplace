import { useState } from 'react';
import { ArrowLeft, FileText, Expand, Share2, Play, Users, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSlideStore } from '../../store/useSlideStore';
import { ShareModal } from './ShareModal';

/**
 * Top Header - Canva style with File, Resize, Share, Present
 */
export const TopHeader = ({ projectId, saveStatus, lastSavedTime, onBack }) => {
    const navigate = useNavigate();
    const { title, setTitle } = useSlideStore();
    const [showShareModal, setShowShareModal] = useState(false);

    const handleBack = () => {
        if (onBack) {
            onBack(); // Force save before navigation
        }
        navigate('/my-slide');
    };

    const getSaveStatusDisplay = () => {
        switch (saveStatus) {
            case 'saving':
                return <span className="text-xs text-yellow-400 flex items-center gap-1"><span className="animate-pulse">●</span>Saving...</span>;
            case 'saved':
                return <span className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />Saved</span>;
            case 'error':
                return <span className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Error</span>;
            default:
                return lastSavedTime ? <span className="text-xs text-gray-500">Last saved: {new Date(lastSavedTime).toLocaleTimeString()}</span> : null;
        }
    };

    return (
        <div className="h-10 bg-[#0d0d0d] border-b border-white/5 flex items-center justify-between px-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleBack}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <span className="text-gray-600">|</span>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium focus:outline-none focus:bg-white/5 rounded px-2 py-1 min-w-50"
                    placeholder="Untitled Presentation"
                />
            </div>

            {/* Center: Actions + Save Status */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors">
                        <Expand className="w-3.5 h-3.5" />
                        Resize
                    </button>

                    <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors">
                        <FileText className="w-3.5 h-3.5" />
                        Templates
                    </button>
                </div>

                {/* Save Status Display */}
                {getSaveStatusDisplay()}
            </div>

            {/* Right: Share + Present */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
                >
                    <Users className="w-3.5 h-3.5" />
                    Share
                </button>

                <button
                    onClick={() => {
                        if (!projectId) {
                            // Auto-save with new ID before presenting
                            const newId = crypto.randomUUID();
                            const presentation = useSlideStore.getState().exportToJSON();

                            // Save to localStorage
                            const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
                            const existing = savedSlides.findIndex(s => s.id === newId);

                            const slideData = {
                                id: newId,
                                data: presentation,
                                title: presentation.title || 'Untitled Presentation',
                                owner: 'local', // Mark as local slide
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            };

                            if (existing >= 0) {
                                slideData.createdAt = savedSlides[existing].createdAt;
                                savedSlides[existing] = slideData;
                            } else {
                                savedSlides.push(slideData);
                            }

                            localStorage.setItem('slides', JSON.stringify(savedSlides));

                            // Navigate to presentation
                            navigate(`/slide/${newId}`);
                        } else {
                            navigate(`/slide/${projectId}`);
                        }
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-semibold transition-colors"
                >
                    <Play className="w-3.5 h-3.5" />
                    Present
                </button>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
        </div>
    );
};

export default TopHeader;
