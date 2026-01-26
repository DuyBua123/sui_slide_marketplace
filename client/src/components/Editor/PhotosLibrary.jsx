import { Search, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { useSlideStore } from "../../store/useSlideStore";

const samplePhotos = [
    { id: "p1", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400" },
    { id: "p2", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400" },
    { id: "p3", url: "https://images.unsplash.com/photo-1504639725597-78f6ec6bdef3?w=400" },
    { id: "p4", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400" },
    { id: "p5", url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400" },
    { id: "p6", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" },
];

export const PhotosLibrary = () => {
    const { addElement } = useSlideStore();
    const [search, setSearch] = useState("");

    const handleAddPhoto = (photo) => {
        addElement("image", {
            src: photo.url,
            x: 100,
            y: 100,
            width: 300,
            height: 200,
        });
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search photos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-purple-500/30 transition-all font-medium"
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                {samplePhotos.map((photo) => (
                    <button
                        key={photo.id}
                        onClick={() => handleAddPhoto(photo)}
                        className="cursor-pointer group relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 hover:border-purple-500 transition-all shadow-sm active:scale-95"
                    >
                        <img
                            src={photo.url}
                            alt="Stock"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-medium italic">
                Powered by Unsplash
            </p>
        </div>
    );
};

export default PhotosLibrary;
