import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';

/**
 * Marketplace Page - Browse and purchase slide licenses
 */
export const Market = () => {
    const navigate = useNavigate();
    const account = useCurrentAccount();
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Load slides from localStorage (mock for blockchain query)
    useEffect(() => {
        setIsLoading(true);
        // Simulate API delay
        setTimeout(() => {
            const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
            // In a real app, this would fetch from blockchain events/indexer
            setSlides(savedSlides);
            setIsLoading(false);
        }, 500);
    }, []);

    // Filter slides
    const filteredSlides = slides.filter((slide) => {
        const matchesSearch = slide.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Mock price (in real app, comes from blockchain)
    const getPrice = (slide) => {
        return (Math.abs(slide.id.charCodeAt(6) || 5) % 10) + 1;
    };

    // Check if user owns slide or license
    const getAccessStatus = (slide) => {
        if (slide.owner === account?.address) return 'owner';
        // Mock: check licenses in localStorage
        const licenses = JSON.parse(localStorage.getItem('licenses') || '[]');
        if (licenses.some((l) => l.slideId === slide.id && l.buyer === account?.address)) {
            return 'licensed';
        }
        return 'none';
    };

    // Buy license (mock)
    const handleBuyLicense = async (slide) => {
        if (!account) {
            navigate('/sign-in');
            return;
        }

        const licenses = JSON.parse(localStorage.getItem('licenses') || '[]');
        licenses.push({
            id: `license-${Date.now()}`,
            slideId: slide.id,
            buyer: account.address,
            purchasedAt: new Date().toISOString(),
        });
        localStorage.setItem('licenses', JSON.stringify(licenses));

        // Refresh
        setSlides([...slides]);
        alert(`License purchased for "${slide.title}"!`);
    };

    return (
        <div className="py-10">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4">
                    Slide <span className="text-blue-500">Marketplace</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Discover premium slide presentations. Purchase licenses to view and present,
                    while creators retain ownership and editing rights.
                </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search slides..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                </div>

                <div className="flex gap-2">
                    {['all', 'popular', 'new', 'free'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-3 rounded-xl font-medium capitalize transition-colors ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredSlides.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No slides available</h3>
                    <p className="text-gray-500">Be the first to publish a slide!</p>
                </div>
            )}

            {/* Grid */}
            {!isLoading && filteredSlides.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSlides.map((slide) => {
                        const price = getPrice(slide);
                        const accessStatus = getAccessStatus(slide);

                        return (
                            <div
                                key={slide.id}
                                className="group bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                    {slide.thumbnail ? (
                                        <img
                                            src={slide.thumbnail}
                                            alt={slide.title}
                                            className={`w-full h-full object-cover transition-all duration-300 ${accessStatus === 'none' ? 'blur-sm group-hover:blur-none' : ''
                                                }`}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Access badge */}
                                    {accessStatus === 'owner' && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                            Owner
                                        </div>
                                    )}
                                    {accessStatus === 'licensed' && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                                            Licensed
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-white truncate mb-2">{slide.title}</h3>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                                                <circle cx="12" cy="12" r="10" />
                                            </svg>
                                            <span className="font-bold text-cyan-400">{price} SUI</span>
                                        </div>

                                        {accessStatus === 'none' ? (
                                            <button
                                                onClick={() => handleBuyLicense(slide)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Buy License
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/slide/${slide.id}`)}
                                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                View
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
