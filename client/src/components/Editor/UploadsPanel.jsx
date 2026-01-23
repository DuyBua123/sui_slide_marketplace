import { Upload, Video, Folder, Wand2 } from "lucide-react";
import { useState, useEffect } from "react";
import { uploadToWalrus, getWalrusUrl } from "../../utils/walrus";
import { useSlideStore } from "../../store/useSlideStore";

/**
 * Uploads Panel - Canva-style uploads sidebar
 */
export const UploadsPanel = () => {
  const [activeTab, setActiveTab] = useState("images");
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { addElement } = useSlideStore();

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadToWalrus(file);
      const imageUrl = result.url;

      // Add to uploads list
      const newUpload = {
        id: Date.now().toString(),
        url: imageUrl, // Now storing string URL instead of object
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "video",
        uploadedAt: new Date().toISOString(),
      };

      setUploads([newUpload, ...uploads]);

      // Also save to localStorage
      const savedUploads = JSON.parse(localStorage.getItem("uploads") || "[]");
      savedUploads.unshift(newUpload);
      localStorage.setItem("uploads", JSON.stringify(savedUploads));
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCanvas = (upload) => {
    if (upload.type === "image") {
      // Safely extract URL if it's an object (backward compatibility)
      const imageUrl = typeof upload.url === "object" ? upload.url.url : upload.url;

      addElement("image", {
        src: imageUrl,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
    }
  };

  // Load uploads from localStorage on mount - FIXED: was useState, should be useEffect
  useEffect(() => {
    const savedUploads = JSON.parse(localStorage.getItem("uploads") || "[]");
    setUploads(savedUploads);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      {/* Upload Button */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <label className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer shadow-lg shadow-purple-500/20 active:scale-95">
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload files"}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Record Yourself Button */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <button className="cursor-pointer w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-tight transition-all active:scale-95">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          Record yourself
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-white/5 px-4">
        {["images", "videos", "folders"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === tab
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Background Remover AI Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-500/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-tight text-gray-900 dark:text-white">
                Background Remover
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Pro AI magic for your images
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Gallery */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4">
          {activeTab === "images"
            ? "Recent images"
            : activeTab === "videos"
              ? "Recent videos"
              : "Your Folders"}
        </h3>

        {uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-600 leading-relaxed uppercase tracking-tighter">
              Drag & drop files here <br /> to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {uploads
              .filter((u) => activeTab === "folders" || u.type === activeTab.slice(0, -1))
              .map((upload) => (
                <button
                  key={upload.id}
                  onClick={() => handleAddToCanvas(upload)}
                  className="cursor-pointer aspect-square rounded-xl overflow-hidden border-2 border-gray-50 dark:border-white/5 hover:border-purple-500 transition-all group relative bg-gray-50 dark:bg-gray-800 shadow-sm"
                >
                  {upload.type === "image" ? (
                    <img
                      src={upload.url}
                      alt={upload.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-purple-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      Add to canvas
                    </span>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadsPanel;
