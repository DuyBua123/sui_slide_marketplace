import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const SignIn = () => {
  const account = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      navigate("/");
    }
  }, [account, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <Link to="/" className="group flex items-center gap-0.5 no-underline">
            <h2 className="text-3xl font-extrabold tracking-tighter transition-all duration-300">
              <span className="text-white group-hover:text-blue-400 transition-colors">
                Slide
              </span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                Sui
              </span>
            </h2>
          </Link>

          <p className="text-gray-400 text-sm mb-10 leading-relaxed px-4">
            Kết nối ví của bạn để bắt đầu trải nghiệm quản lý công việc trên nền tảng
            Blockchain.
          </p>

          <div className="w-full flex justify-center mb-8">
            <div className="transform hover:scale-105 transition-all duration-200">
              <ConnectButton className="cursor-pointer" />
            </div>
          </div>

          {!account && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                Yêu cầu: Sui Wallet hoặc OKX Wallet
              </div>
              <p className="text-[11px] text-gray-600 uppercase tracking-widest">
                Secured by Sui Network
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
