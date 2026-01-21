import { useState } from "react";
import { ArrowLeft, FileText, Expand, Share2, Play, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSlideStore } from "../../store/useSlideStore";
import { ShareModal } from "./ShareModal";
import ThemeToggle from "../ThemeToggle";

/**
 * Top Header - Canva style with File, Resize, Share, Present
 */
export const TopHeader = ({ projectId, onSave }) => {
  const navigate = useNavigate();
  const { title, setTitle } = useSlideStore();
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="h-10 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-3 transition-colors sticky top-0 z-50">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/my-slide")}
          className="cursor-pointer p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all active:scale-95"
          title="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <span className="text-gray-300 dark:text-gray-800 font-light">|</span>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent border-none text-sm font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-gray-50 dark:focus:bg-white/5 rounded px-2 py-1 min-w-[200px] transition-colors placeholder:text-gray-400"
          placeholder="Untitled Presentation"
        />
      </div>

      {/* Center: Quick Actions */}
      <div className="flex items-center gap-1">
        <button className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-[11px] font-bold uppercase tracking-tight transition-colors">
          <Expand className="w-3.5 h-3.5" />
          Resize
        </button>

        <button className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-[11px] font-bold uppercase tracking-tight transition-colors">
          <FileText className="w-3.5 h-3.5" />
          Templates
        </button>
      </div>

      {/* Right: Tools + Share + Present */}
      <div className="flex items-center gap-2">
        <div className="flex items-center mr-2 border-r border-gray-200 dark:border-white/10 pr-2 gap-1">
          <ThemeToggle />
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-[11px] font-bold uppercase tracking-tight transition-all active:scale-95"
        >
          <Users className="w-3.5 h-3.5" />
          Share
        </button>

        <button
          onClick={() => {
            if (!projectId) {
              const newId = crypto.randomUUID();
              const presentation = useSlideStore.getState().exportToJSON();
              const savedSlides = JSON.parse(localStorage.getItem("slides") || "[]");

              const slideData = {
                id: newId,
                data: presentation,
                title: title || "Untitled Presentation", // Sử dụng title từ state
                owner: "local",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };

              savedSlides.push(slideData);
              localStorage.setItem("slides", JSON.stringify(savedSlides));
              navigate(`/slide/${newId}`);
            } else {
              navigate(`/slide/${projectId}`);
            }
          }}
          className="cursor-pointer flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all active:scale-95 active:shadow-none"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Present
        </button>
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
};

export default TopHeader;
