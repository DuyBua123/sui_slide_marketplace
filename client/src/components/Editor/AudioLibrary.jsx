import { Music, Play, Volume2 } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";

const sampleAudio = [
    { id: "a1", title: "Ambient Background", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "a2", title: "Motivational Beat", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "a3", title: "Success Chime", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export const AudioLibrary = () => {
    const { addElement } = useSlideStore();

    const handleAddAudio = (audio) => {
        addElement("audio", {
            src: audio.url,
            title: audio.title,
            width: 48,
            height: 48,
            autoPlay: false,
            loop: true,
            volume: 0.5,
        });
    };

    return (
        <div className="flex flex-col gap-2">
            {sampleAudio.map((audio) => (
                <button
                    key={audio.id}
                    onClick={() => handleAddAudio(audio)}
                    className="cursor-pointer group w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all active:scale-[0.98]"
                >
                    <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Music className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{audio.title}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Background Music</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-purple-600" />
                    </div>
                </button>
            ))}
        </div>
    );
};

export default AudioLibrary;
