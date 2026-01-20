import { useState } from 'react';
import { ArrowLeft, FileText, Expand, Share2, Play, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSlideStore } from '../../store/useSlideStore';
import { ShareModal } from './ShareModal';

/**
 * Top Header - Canva style with File, Resize, Share, Present
 */
export const TopHeader = ({ projectId, onSave }) => {
    const navigate = useNavigate();
    const { title, setTitle } = useSlideStore();
    const [showShareModal, setShowShareModal] = useState(false);

    return (
        <div className="h-10 bg-[#0d0d0d] border-b border-white/5 flex items-center justify-between px-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate('/my-slide')}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <span className="text-gray-600">|</span>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium focus:outline-none focus:bg-white/5 rounded px-2 py-1 min-w-[200px]"
                    placeholder="Untitled Presentation"
                />
            </div>

            {/* Center: Actions */}
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
                    onClick={() => projectId && navigate(`/slide/${projectId}`)}
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
