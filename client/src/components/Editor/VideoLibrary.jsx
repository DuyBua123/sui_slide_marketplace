import { Play, Film } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";

const sampleVideos = [
    { id: "v1", title: "Corporate Background", thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { id: "v2", title: "Abstract Particles", thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300", url: "https://www.w3schools.com/html/movie.mp4" },
    { id: "v3", title: "Nature Scenery", thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300", url: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4" },
];

export const VideoLibrary = () => {
    const { addElement } = useSlideStore();

    const handleAddVideo = (video) => {
        addElement("video", {
            src: video.url,
            thumbnail: video.thumbnail,
            width: 320,
            height: 180,
            autoPlay: true,
            loop: true,
            muted: true,
        });
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {sampleVideos.map((video) => (
                <button
                    key={video.id}
                    onClick={() => handleAddVideo(video)}
                    className="cursor-pointer group relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-purple-500 transition-all shadow-sm active:scale-95"
                >
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-[10px] font-bold text-white truncate">{video.title}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default VideoLibrary;
