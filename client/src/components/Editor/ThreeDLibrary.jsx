import { Box, Layers } from "lucide-react";
import { useSlideStore } from "../../store/useSlideStore";

const sample3D = [
    { id: "3d1", title: "Purple Cube", thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300", model: "cube", color: "#8b5cf6" },
    { id: "3d2", title: "Cyan Sphere", thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300", model: "sphere", color: "#06b6d4" },
    { id: "3d3", title: "Pink Ring", thumbnail: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=300", model: "ring", color: "#ec4899" },
];

export const ThreeDLibrary = () => {
    const { addElement } = useSlideStore();

    const handleAdd3D = (item) => {
        addElement("threeD", {
            model: item.model,
            color: item.color,
            thumbnail: item.thumbnail,
            width: 200,
            height: 200,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
        });
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {sample3D.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleAdd3D(item)}
                    className="cursor-pointer group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-purple-500 transition-all shadow-sm active:scale-95 bg-white dark:bg-gray-800"
                >
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 backdrop-blur-md flex items-center justify-center border border-cyan-500/30">
                            <Box className="w-6 h-6 text-cyan-400" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-[10px] font-bold text-white truncate">{item.title}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default ThreeDLibrary;
