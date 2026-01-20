import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      <h1 className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter select-none">
        <span className="bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">
          4
        </span>
        <span className="bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent mx-[-10px]">
          0
        </span>
        <span className="bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">
          4
        </span>
      </h1>

      <div className="relative z-10 mt-[-20px] md:mt-[-40px]">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Lạc vào vùng không gian khác?
        </h2>
        <p className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang một địa chỉ ví khác
          trên mạng lưới Sui.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>

      <div className="absolute top-20 left-[10%] w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
      <div className="absolute bottom-20 right-[15%] w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
      <div className="absolute top-1/3 right-[10%] w-1.5 h-1.5 bg-white/30 rounded-full" />
    </div>
  );
};
