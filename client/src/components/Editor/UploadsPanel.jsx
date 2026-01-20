import { Upload, Video, Folder, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { uploadFileToIPFS } from '../../utils/pinata';
import { useSlideStore } from '../../store/useSlideStore';

/**
 * Uploads Panel - Canva-style uploads sidebar
 */
export const UploadsPanel = () => {
    const [activeTab, setActiveTab] = useState('images');
    const [uploads, setUploads] = useState([]);
    const [uploading, setUploading] = useState(false);
    const { addElement } = useSlideStore();

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const ipfsUrl = await uploadFileToIPFS(file);

            // Add to uploads list
            const newUpload = {
                id: Date.now().toString(),
                url: ipfsUrl,
                name: file.name,
                type: file.type.startsWith('image/') ? 'image' : 'video',
                uploadedAt: new Date().toISOString(),
            };

            setUploads([newUpload, ...uploads]);

            // Also save to localStorage
            const savedUploads = JSON.parse(localStorage.getItem('uploads') || '[]');
            savedUploads.unshift(newUpload);
            localStorage.setItem('uploads', JSON.stringify(savedUploads));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleAddToCanvas = (upload) => {
        if (upload.type === 'image') {
            addElement('image', {
                src: upload.url,
                x: 100,
                y: 100,
                width: 200,
                height: 150,
            });
        }
    };

    // Load uploads from localStorage on mount
    useState(() => {
        const savedUploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        setUploads(savedUploads);
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* Upload Button */}
            <div className="p-3 border-b border-white/5">
                <label className="w-full bg-purple-600 hover:bg-purple-500 rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload files'}
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Record Yourself Button (Placeholder) */}
            <div className="p-3 border-b border-white/5">
                <button className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    Record yourself
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 px-3">
                <button
                    onClick={() => setActiveTab('images')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'images'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Images
                </button>
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'videos'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Videos
                </button>
                <button
                    onClick={() => setActiveTab('folders')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'folders'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Folders
                </button>
            </div>

            {/* Background Remover Card */}
            <div className="p-3 border-b border-white/5">
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-3 border border-purple-500/30">
                    <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center flex-shrink-0">
                            <Wand2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold mb-1">Background Remover</h4>
                            <p className="text-[10px] text-gray-400">Remove backgrounds from your images</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Gallery */}
            <div className="flex-1 overflow-y-auto p-3">
                <h3 className="text-xs font-semibold text-gray-400 mb-3">
                    {activeTab === 'images' ? 'Recent images' : activeTab === 'videos' ? 'Recent videos' : 'Folders'}
                </h3>

                {uploads.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                        No uploads yet. Upload files to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {uploads
                            .filter((u) => activeTab === 'folders' || u.type === activeTab.slice(0, -1))
                            .map((upload) => (
                                <button
                                    key={upload.id}
                                    onClick={() => handleAddToCanvas(upload)}
                                    className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-purple-500 transition-all group relative"
                                >
                                    {upload.type === 'image' ? (
                                        <img
                                            src={upload.url}
                                            alt={upload.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <Video className="w-8 h-8 text-gray-500" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-xs font-medium">Add to canvas</span>
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
