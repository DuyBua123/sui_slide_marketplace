import { Upload, Palette, Type, Image as ImageIcon, Plus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { uploadFileToIPFS } from '../../utils/pinata';

const DEFAULT_COLORS = ['#000000', '#ffffff', '#8b5cf6', '#3b82f6', '#10b981'];
const DEFAULT_FONTS = ['Arial', 'Arial Black', 'Georgia', 'Times New Roman', 'Courier New'];

/**
 * Brand Kit Panel - Canva-style brand management
 */
export const BrandPanel = () => {
    const [brandKit, setBrandKit] = useState({
        logo: null,
        colors: DEFAULT_COLORS,
        fonts: DEFAULT_FONTS,
        brandName: 'My Brand',
    });
    const [uploading, setUploading] = useState(false);
    const [editingColor, setEditingColor] = useState(null);

    // Load brand kit from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('brandKit');
        if (saved) {
            setBrandKit(JSON.parse(saved));
        }
    }, []);

    // Save brand kit to localStorage
    const saveBrandKit = (newKit) => {
        setBrandKit(newKit);
        localStorage.setItem('brandKit', JSON.stringify(newKit));
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
            console.error('Logo upload failed:', error);
            alert('Logo upload failed. Please try again.');
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
            ? brandKit.fonts.filter(f => f !== font)
            : [...brandKit.fonts, font];
        saveBrandKit({ ...brandKit, fonts: newFonts });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Brand Name */}
            <div className="p-3 border-b border-white/5">
                <input
                    type="text"
                    value={brandKit.brandName}
                    onChange={(e) => saveBrandKit({ ...brandKit, brandName: e.target.value })}
                    className="w-full bg-transparent text-lg font-semibold focus:outline-none"
                    placeholder="Brand Name"
                />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-6">
                {/* Logo Section */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Brand Logo
                    </h3>

                    {brandKit.logo ? (
                        <div className="relative aspect-[3/2] rounded-lg border border-white/10 overflow-hidden group">
                            <img src={brandKit.logo} alt="Brand logo" className="w-full h-full object-contain bg-gray-800" />
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <span className="text-xs font-medium">Change logo</span>
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
                        <label className="aspect-[3/2] rounded-lg border-2 border-dashed border-white/10 hover:border-purple-500 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer">
                            <Upload className="w-6 h-6 text-gray-500" />
                            <span className="text-xs text-gray-500">
                                {uploading ? 'Uploading...' : 'Upload logo'}
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
                </div>

                {/* Brand Colors */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Brand Colors
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                        {brandKit.colors.map((color, index) => (
                            <div key={index} className="relative">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                    className="w-full aspect-square rounded-lg cursor-pointer border border-white/10"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="absolute bottom-0 left-0 right-0 text-center bg-black/50 text-[8px] py-0.5 rounded-b-lg">
                                    {color}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Click to edit colors</p>
                </div>

                {/* Brand Fonts */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Brand Fonts
                    </h3>
                    <div className="space-y-1">
                        {[
                            'Arial',
                            'Arial Black',
                            'Georgia',
                            'Times New Roman',
                            'Courier New',
                            'Verdana',
                            'Comic Sans MS',
                        ].map((font) => (
                            <button
                                key={font}
                                onClick={() => handleFontToggle(font)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between ${brandKit.fonts.includes(font)
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                <span className="text-sm" style={{ fontFamily: font }}>
                                    {font}
                                </span>
                                {brandKit.fonts.includes(font) && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Brand Stats */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold mb-2">Your Brand Kit</h4>
                    <div className="space-y-1 text-[10px] text-gray-400">
                        <div className="flex justify-between">
                            <span>Colors:</span>
                            <span className="text-white">{brandKit.colors.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Fonts:</span>
                            <span className="text-white">{brandKit.fonts.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Logo:</span>
                            <span className="text-white">{brandKit.logo ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photos/Graphics Sections (Placeholders) */}
            <div className="p-3 border-t border-white/5 space-y-2">
                <button className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors">
                    Photos ({0})
                </button>
                <button className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors">
                    Graphics ({0})
                </button>
                <button className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors">
                    Charts ({0})
                </button>
            </div>
        </div>
    );
};

export default BrandPanel;
