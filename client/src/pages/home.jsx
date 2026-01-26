import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ROUTE } from "../constant/routeConfig";
import AOS from "aos";
import "aos/dist/aos.css";

export const Home = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-quad",
    });
  }, []);

  return (
    <div className="py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center transition-colors duration-500 ">
      <div className="space-y-8">
        <div
          data-aos="fade-right"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          POWERED BY SUI NETWORK
        </div>

        <h1
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white"
        >
          Dynamic <span className="text-blue-600 dark:text-blue-500">Slide</span> <br />
          <span className="text-cyan-600 dark:text-cyan-400">Licensing</span> on SUI
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="400"
          className="text-gray-600 dark:text-gray-400 text-lg max-w-lg leading-relaxed"
        >
          The premier Web3 marketplace for slide deck licensing. Instantly buy, sell, and
          manage your presentation assets with programmable smart contracts.
        </p>

        <div data-aos="fade-up" data-aos-delay="600" className="flex flex-wrap gap-4">
          <div>
            {account ? (
              <button
                onClick={() => navigate(ROUTE.MYSLIDE)}
                className="cursor-pointer relative group overflow-hidden bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-xl active:scale-95 flex items-center gap-2"
              >
                <span>My Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => navigate(ROUTE.SIGN_IN)}
                className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Connect Wallet
              </button>
            )}
          </div>
          <button
            onClick={() => navigate(ROUTE.MARKET)}
            className="cursor-pointer px-8 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all font-medium"
          >
            Explore Marketplace
          </button>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="800"
          className="grid grid-cols-3 gap-8 pt-10 border-t border-gray-200 dark:border-white/5"
        >
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1.2M SUI</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
              Total Volume
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">8.5K</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
              Active Licenses
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">124</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
              New Today
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative flex justify-center items-center py-32 min-h-150 w-full overflow-visible"
        style={{ isolation: "isolate" }}
      >
        {/* --- TRANG TRÍ NỀN (BACKGROUND DECOR) --- */}

        {/* 1. Các đường kẻ tọa độ (Futuristic Grid) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/30 dark:via-white/10 to-transparent"></div>
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-gray-300/30 dark:via-white/10 to-transparent"></div>
          {/* Các đường kẻ phụ mảnh */}
          <div className="absolute top-[30%] left-0 w-full h-[0.5px] bg-gray-200/20 dark:bg-white/5"></div>
          <div className="absolute top-0 left-[40%] w-[0.5px] h-full bg-gray-200/20 dark:bg-white/5"></div>
        </div>

        {/* 2. Các vòng tròn phát sáng lớn (Ambient Glow) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-[120px] z-[-1] animate-pulse"></div>
        <div className="absolute top-1/4 right-[20%] w-32 h-32 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[60px] z-[-1]"></div>

        {/* 3. Các đốm sáng và Icon trôi nổi (Floating Elements) */}
        {/* Chấm tròn xanh */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-bounce opacity-70"></div>
        {/* Chấm tròn tím */}
        <div className="absolute bottom-10 right-1/3 w-3 h-3 bg-purple-500 rounded-full blur-[1px] opacity-40"></div>
        <div className="absolute top-60 left-1 w-2 h-2 bg-blue-700 rounded-full shadow-[0_0_10px_#22d3ee] animate-bounce opacity-70"></div>
        <div className="absolute bottom-0 right-1/2 w-3 h-3 bg-blue-500 rounded-full blur-[1px] opacity-40"></div>
        {/* Chữ số trang trí */}
        <div className="absolute top-1/3 left-[20%] text-[10px] font-mono text-gray-400/40 rotate-90 tracking-[4px] hidden md:block">
          0.5 / 2.5
        </div>
        <div className="absolute bottom-1/4 right-[20%] text-[10px] font-mono text-gray-400/40 tracking-[4px] hidden md:block">
          UPDATE_2026
        </div>

        <div className="relative flex items-center justify-center group">
          {/* --- BLUR CIRCLES PHÍA SAU --- */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-400/30 rounded-full blur-[80px] transition-all duration-700 group-hover:blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/30 rounded-full blur-[100px] transition-all duration-700 group-hover:blur-[140px]" />

          {/* --- CARD CHÍNH --- */}
          <div
            data-aos="fade-left"
            className="relative z-10 w-72 h-96 bg-white/40 dark:bg-white/5
    border border-white/40 dark:border-white/10
    rounded-[40px] backdrop-blur-xl p-6
    flex flex-col justify-between
    shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)]
    transform rotate-3 hover:rotate-0 hover:scale-105
    transition-all duration-700 ease-out"
          >
            {/* --- IMAGE / SLIDE MOCK --- */}
            <div className="relative w-full h-44 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-[30px] shadow-lg overflow-hidden group/slide">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/10 rounded-full blur-xl" />

              <div className="relative h-full w-full p-4 flex flex-col justify-center items-center gap-2">
                <div className="w-2/3 h-6 bg-white/20 backdrop-blur-sm rounded-md border border-white/30 flex items-center px-2 gap-2 transform group-hover/slide:scale-105 transition-transform">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                  <div className="h-1.5 w-full bg-white/40 rounded-full" />
                </div>

                <div className="w-1/2 space-y-2 mt-1">
                  <div className="h-1 w-full bg-white/20 rounded-full" />
                  <div className="h-1 w-[80%] bg-white/20 rounded-full mx-auto" />
                </div>

                <div className="absolute inset-4 border border-white/10 rounded-xl pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                </div>

                <div className="absolute top-4 right-8 w-8 h-8 bg-white/10 rounded-lg rotate-12 backdrop-blur-sm border border-white/20 animate-pulse" />
                <div className="absolute bottom-6 left-8 w-6 h-6 bg-cyan-300/30 rounded-full -rotate-12 backdrop-blur-sm" />
              </div>

              <div className="absolute inset-0 bg-black/0 group-hover/slide:bg-black/5 transition-colors" />
            </div>

            {/* --- FOOTER UI --- */}
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <div className="h-2 w-8 bg-cyan-500/50 rounded-full" />
                <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full" />
              </div>
              <div className="h-2 w-2/3 bg-gray-200 dark:bg-white/10 rounded-full" />

              <div className="pt-6 flex justify-between items-center border-t border-gray-200/30 dark:border-white/5">
                <div>
                  <div className="text-sm font-black text-blue-600 dark:text-cyan-400 uppercase tracking-tighter">
                    4 Months
                  </div>
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                    Duration
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 border border-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
