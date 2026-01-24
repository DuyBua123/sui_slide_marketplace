import { X, Link, Download, Upload, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useSlideStore } from "../../store/useSlideStore";
import { v4 as uuid } from "uuid";
import { exportSlidesToPNG } from "../../utils/exportToPNG";
import { exportSlidesToPDF } from "../../utils/exportToPDF";
import { uploadPresentationToWalrus } from "../../utils/exportToWalrus";

/**
 * Share Modal - Share presentations via link, export, or IPFS
 */
export const ShareModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("link");
  const [shareLink, setShareLink] = useState("");
  const [ipfsLink, setIpfsLink] = useState("");
  const [copying, setCopying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { slides, title, exportToJSON } = useSlideStore();

  const generateShareLink = () => {
    // Create unique ID
    const slideId = uuid();
    const slideData = {
      id: slideId,
      data: exportToJSON(),
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const savedSlides = JSON.parse(localStorage.getItem("slides") || "[]");
    savedSlides.push(slideData);
    localStorage.setItem("slides", JSON.stringify(savedSlides));

    // Generate link
    const link = `${window.location.origin}/slide/${slideId}`;
    setShareLink(link);
    return link;
  };

  const handleCopyLink = async () => {
    const link = shareLink || generateShareLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      alert("Failed to copy link");
    }
  };

  const handleExportPNG = async () => {
    setExporting(true);
    try {
      await exportSlidesToPNG(slides);
    } catch (error) {
      alert("Export failed: " + error.message);
    }
    setExporting(false);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportSlidesToPDF(slides, title);
    } catch (error) {
      alert("Export failed: " + error.message);
    }
    setExporting(false);
  };

  const handleUploadWalrus = async () => {
    setUploading(true);
    try {
      const walrusUrl = await uploadPresentationToWalrus(exportToJSON(), title);
      setIpfsLink(walrusUrl);
    } catch (error) {
      alert("Walrus upload failed: " + error.message);
    }
    setUploading(false);
  };

  const handleCopyIPFS = async () => {
    try {
      await navigator.clipboard.writeText(ipfsLink);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      alert("Failed to copy link");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-all p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-[600px] max-h-[90vh] flex flex-col border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Share & Export
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Presentation Assets
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modern Tabs */}
        <div className="flex p-2 gap-1 bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-white/10">
          {[
            { id: "link", label: "Public Link", icon: Link },
            { id: "export", label: "File Export", icon: Download },
            { id: "ipfs", label: "On-Chain", icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-wider ${isActive
                  ? "text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 shadow-sm"
                  : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
          {/* Public Link Tab */}
          {activeTab === "link" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-500/20">
                <h4 className="font-black text-purple-900 dark:text-purple-300 mb-1 uppercase text-sm">
                  Live Presentation Link
                </h4>
                <p className="text-sm text-purple-700/60 dark:text-purple-400/60 font-medium">
                  Share this URL to allow anyone to view your presentation in real-time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={shareLink || "Click generate to create link"}
                    readOnly
                    className="w-full bg-gray-50 dark:bg-black/30 border-2 border-gray-100 dark:border-white/5 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 dark:text-gray-200 focus:outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full animate-ping opacity-75" />
                </div>
                <button
                  onClick={shareLink ? handleCopyLink : generateShareLink}
                  className="cursor-pointer px-8 py-4 bg-gray-900 dark:bg-purple-600 hover:bg-black dark:hover:bg-purple-500 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-purple-500/10 flex items-center justify-center gap-2"
                >
                  {copying ? (
                    <Check className="w-5 h-5" />
                  ) : shareLink ? (
                    <Copy className="w-5 h-5" />
                  ) : (
                    <Link className="w-5 h-5" />
                  )}
                  <span>{copying ? "Copied" : shareLink ? "Copy" : "Generate"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === "export" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={handleExportPNG}
                  disabled={exporting}
                  className="cursor-pointer flex items-center justify-between p-5 bg-white dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border-2 border-gray-100 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 rounded-3xl transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:rotate-6 transition-transform">
                      <Image className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">
                        Image Format
                      </p>
                      <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                        Export as PNG
                      </p>
                      <p className="text-xs text-gray-400 font-bold mt-1">
                        {slides.length === 1 ? "1 HQ Image" : `${slides.length} Images in ZIP`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="cursor-pointer flex items-center justify-between p-5 bg-white dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-900/10 border-2 border-gray-100 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/30 rounded-3xl transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 group-hover:-rotate-6 transition-transform">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">
                        Document Format
                      </p>
                      <p className="text-lg font-black text-red-600 dark:text-red-400">
                        Export as PDF
                      </p>
                      <p className="text-xs text-gray-400 font-bold mt-1">
                        Multi-page Vector PDF
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          )}

          {/* IPFS Tab */}
          {activeTab === "ipfs" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500 p-2 rounded-lg mt-1">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-900 dark:text-emerald-400 uppercase text-sm mb-1">
                      Permanent IPFS Hosting
                    </h4>
                    <p className="text-sm text-emerald-700/70 dark:text-emerald-500/60 font-medium">
                      Store your presentation forever on the decentralized web. Once uploaded,
                      it cannot be deleted.
                    </p>
                  </div>
                </div>
              </div>

              {!ipfsLink ? (
                <button
                  onClick={handleUploadWalrus}
                  disabled={uploading}
                  className="cursor-pointer w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all font-black text-lg disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
                >
                  {uploading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CloudUpload className="w-6 h-6" />
                  )}
                  {uploading ? "Broadcasting to Nodes..." : "Secure IPFS Upload"}
                </button>
              ) : (
                <div className="animate-in zoom-in-95 duration-300">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ipfsLink}
                      readOnly
                      className="flex-1 bg-emerald-50 dark:bg-black/40 border-2 border-emerald-100 dark:border-emerald-500/20 rounded-2xl px-4 py-4 text-xs font-bold text-emerald-800 dark:text-emerald-400"
                    />
                    <button
                      onClick={handleCopyIPFS}
                      className="cursor-pointer px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black transition-all active:scale-90"
                    >
                      {copying ? <Check /> : <Copy />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-5 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/10 flex items-center justify-center gap-4">
          <div className="flex -space-x-2">
            {slides.slice(0, 3).map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            {slides.length} Assets • {title || "Manifest Presentation"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
