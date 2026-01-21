import { X, Link, Download, Upload, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useSlideStore } from '../../store/useSlideStore';
import { v4 as uuid } from 'uuid';
import { exportSlidesToPNG } from '../../utils/exportToPNG';
import { exportSlidesToPDF } from '../../utils/exportToPDF';
import { uploadToIPFS } from '../../utils/exportToIPFS';

/**
 * Share Modal - Share presentations via link, export, or IPFS
 */
export const ShareModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('link');
    const [shareLink, setShareLink] = useState('');
    const [ipfsLink, setIpfsLink] = useState('');
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
        const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
        savedSlides.push(slideData);
        localStorage.setItem('slides', JSON.stringify(savedSlides));

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
            alert('Failed to copy link');
        }
    };

    const handleExportPNG = async () => {
        setExporting(true);
        try {
            await exportSlidesToPNG(slides);
        } catch (error) {
            alert('Export failed: ' + error.message);
        }
        setExporting(false);
    };

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            await exportSlidesToPDF(slides, title);
        } catch (error) {
            alert('Export failed: ' + error.message);
        }
        setExporting(false);
    };

    const handleUploadIPFS = async () => {
        setUploading(true);
        try {
            const ipfsUrl = await uploadToIPFS(exportToJSON(), title);
            setIpfsLink(ipfsUrl);
        } catch (error) {
            alert('IPFS upload failed: ' + error.message);
        }
        setUploading(false);
    };

    const handleCopyIPFS = async () => {
        try {
            await navigator.clipboard.writeText(ipfsLink);
            setCopying(true);
            setTimeout(() => setCopying(false), 2000);
        } catch (error) {
            alert('Failed to copy link');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg w-[600px] max-h-[700px] flex flex-col border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold">Share & Export</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    {[
                        { id: 'link', label: 'Public Link', icon: Link },
                        { id: 'export', label: 'Export', icon: Download },
                        { id: 'ipfs', label: 'IPFS', icon: Upload },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${activeTab === tab.id
                                        ? 'bg-purple-900/30 border-b-2 border-purple-500'
                                        : 'hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Public Link Tab */}
                    {activeTab === 'link' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Share Presentation</h4>
                                <p className="text-sm text-gray-400">
                                    Anyone with the link can view and present your slides
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={shareLink || 'Click "Generate Link" to create shareable URL'}
                                    readOnly
                                    className="flex-1 bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm"
                                />
                                <button
                                    onClick={shareLink ? handleCopyLink : generateShareLink}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded transition-colors flex items-center gap-2"
                                >
                                    {copying ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : shareLink ? (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    ) : (
                                        <>
                                            <Link className="w-4 h-4" />
                                            Generate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Export Tab */}
                    {activeTab === 'export' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Download Presentation</h4>
                                <p className="text-sm text-gray-400">
                                    Export your slides as images or PDF
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleExportPNG}
                                    disabled={exporting}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <Download className="w-5 h-5 text-blue-400" />
                                        <div className="text-left">
                                            <p className="font-medium">Export as PNG</p>
                                            <p className="text-xs text-gray-400">
                                                {slides.length === 1 ? 'Single image file' : `${slides.length} images in ZIP`}
                                            </p>
                                        </div>
                                    </div>
                                    {exporting && <div className="text-sm text-gray-400">Exporting...</div>}
                                </button>

                                <button
                                    onClick={handleExportPDF}
                                    disabled={exporting}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <Download className="w-5 h-5 text-red-400" />
                                        <div className="text-left">
                                            <p className="font-medium">Export as PDF</p>
                                            <p className="text-xs text-gray-400">
                                                Multi-page PDF document ({slides.length} {slides.length === 1 ? 'page' : 'pages'})
                                            </p>
                                        </div>
                                    </div>
                                    {exporting && <div className="text-sm text-gray-400">Exporting...</div>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* IPFS Tab */}
                    {activeTab === 'ipfs' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Permanent Storage</h4>
                                <p className="text-sm text-gray-400">
                                    Upload to IPFS for decentralized, permanent hosting
                                </p>
                            </div>

                            {!ipfsLink ? (
                                <button
                                    onClick={handleUploadIPFS}
                                    disabled={uploading}
                                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    {uploading ? 'Uploading to IPFS...' : 'Upload to IPFS'}
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                                        <p className="text-sm text-green-300 mb-2">✅ Uploaded successfully!</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={ipfsLink}
                                                readOnly
                                                className="flex-1 bg-gray-800 border border-white/10 rounded px-3 py-2 text-xs"
                                            />
                                            <button
                                                onClick={handleCopyIPFS}
                                                className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded transition-colors"
                                            >
                                                {copying ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-500">
                        {slides.length} {slides.length === 1 ? 'slide' : 'slides'} • {title || 'Untitled Presentation'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
