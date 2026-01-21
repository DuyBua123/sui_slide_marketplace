import { Upload, Palette, Type, Image as ImageIcon, Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { uploadFileToIPFS } from "../../utils/pinata";

const DEFAULT_COLORS = ["#000000", "#ffffff", "#8b5cf6", "#3b82f6", "#10b981"];
const DEFAULT_FONTS = ["Arial", "Arial Black", "Georgia", "Times New Roman", "Courier New"];

/**
 * Brand Kit Panel - Canva-style brand management
 */
export const BrandPanel = () => {
  const [brandKit, setBrandKit] = useState({
    logo: null,
    colors: DEFAULT_COLORS,
    fonts: DEFAULT_FONTS,
    brandName: "My Brand",
  });
  const [uploading, setUploading] = useState(false);
  const [editingColor, setEditingColor] = useState(null);

  // Load brand kit from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("brandKit");
    if (saved) {
      setBrandKit(JSON.parse(saved));
    }
  }, []);

  // Save brand kit to localStorage
  const saveBrandKit = (newKit) => {
    setBrandKit(newKit);
    localStorage.setItem("brandKit", JSON.stringify(newKit));
  };

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFileToIPFS(file);
      saveBrandKit({ ...brandKit, logo: result.url });
    } catch (error) {
      console.error("Logo upload failed:", error);
      alert("Logo upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle color change
  const handleColorChange = (index, color) => {
    const newColors = [...brandKit.colors];
    newColors[index] = color;
    saveBrandKit({ ...brandKit, colors: newColors });
    setEditingColor(null);
  };

  // Handle font selection
  const handleFontToggle = (font) => {
    const newFonts = brandKit.fonts.includes(font)
      ? brandKit.fonts.filter((f) => f !== font)
      : [...brandKit.fonts, font];
    saveBrandKit({ ...brandKit, fonts: newFonts });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-transparent transition-colors">
      {/* Brand Name */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-transparent">
        <input
          type="text"
          value={brandKit.brandName}
          onChange={(e) => saveBrandKit({ ...brandKit, brandName: e.target.value })}
          className="w-full bg-transparent text-lg font-bold text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-300"
          placeholder="Enter Brand Name"
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Logo Section */}
        <section>
          <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Brand Logo
          </h3>

          {brandKit.logo ? (
            <div className="relative aspect-[3/2] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden group bg-gray-50 dark:bg-gray-800 shadow-sm">
              <img
                src={brandKit.logo}
                alt="Brand logo"
                className="w-full h-full object-contain p-4"
              />
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px]">
                <Upload className="w-5 h-5 text-white mb-1" />
                <span className="text-[10px] font-bold text-white uppercase">Change logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <label className="aspect-[3/2] rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-purple-500" />
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {uploading ? "Uploading..." : "Upload logo"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </section>

        {/* Brand Colors */}
        <section>
          <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Brand Colors
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {brandKit.colors.map((color, index) => (
              <div key={index} className="space-y-1.5 group">
                <div className="relative aspect-square">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="w-full h-full rounded-lg border border-gray-200 dark:border-white/20 shadow-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <p className="text-[9px] font-mono text-center text-gray-500 dark:text-gray-400 uppercase">
                  {color}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 italic">
            Tip: Click a swatch to edit your palette
          </p>
        </section>

        {/* Brand Fonts */}
        <section>
          <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Brand Fonts
          </h3>
          <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
            {[
              "Arial",
              "Arial Black",
              "Georgia",
              "Times New Roman",
              "Courier New",
              "Verdana",
              "Comic Sans MS",
            ].map((font) => {
              const isSelected = brandKit.fonts.includes(font);
              return (
                <button
                  key={font}
                  onClick={() => handleFontToggle(font)}
                  className={`cursor-pointer w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-sm font-medium" style={{ fontFamily: font }}>
                    {font}
                  </span>
                  {isSelected ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded-full group-hover:border-purple-400 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Summary Card */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-inner">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <div className="w-1.5 h-3 bg-purple-500 rounded-full" />
            Summary
          </h4>
          <div className="space-y-2 text-[11px] font-medium">
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span>Active Colors</span>
              <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-gray-900 dark:text-white border border-gray-200 dark:border-white/10">
                {brandKit.colors.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span>Selected Fonts</span>
              <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-gray-900 dark:text-white border border-gray-200 dark:border-white/10">
                {brandKit.fonts.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span>Brand Identity</span>
              <span
                className={`flex items-center gap-1 ${brandKit.logo ? "text-green-600" : "text-amber-500"}`}
              >
                {brandKit.logo ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                )}
                {brandKit.logo ? "Logo Ready" : "Logo Missing"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Shortcuts */}
      <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-transparent grid grid-cols-3 gap-2">
        {["Photos", "Graphics", "Charts"].map((item) => (
          <button
            key={item}
            className="cursor-pointer flex flex-col items-center py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/5 group"
          >
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 group-hover:text-purple-500 transition-colors uppercase tracking-tighter">
              {item}
            </span>
            <span className="text-[9px] text-gray-300 dark:text-gray-600">0 assets</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandPanel;
