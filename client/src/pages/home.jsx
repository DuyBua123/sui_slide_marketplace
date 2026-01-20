import { ConnectButton } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
// const PACKAGE_ID = "0x97cb4929d1cee71ca55e58882e7c4958eef360c3b9c1b0ea7eae3ccc5d151909";
// const TODO_TYPE = `${PACKAGE_ID}::todo_app::Todo`;
// const client = new SuiClient({
//   url: "https://fullnode.testnet.sui.io", // or testnet/devnet
// });

export const Home = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  return (
    <div className="py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          POWERED BY SUI NETWORK
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
          Dynamic <span className="text-blue-500">Slide</span> <br />
          <span className="text-cyan-400">Licensing</span> on SUI
        </h1>

        <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
          The premier Web3 marketplace for slide deck licensing. Instantly buy, sell, and
          manage your presentation assets with programmable smart contracts.
        </p>

        <div className="flex flex-wrap gap-4">
          <div>
            {account ? (
              <button
                onClick={() => navigate("/my-slide")}
                className="cursor-pointer relative group overflow-hidden bg-white text-black px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 flex items-center gap-2"
              >
                <span>My Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/sign-in")}
                className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Connect Wallet
              </button>
            )}
          </div>
          <button className="cursor-pointer px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-medium">
            Explore Marketplace
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/5">
          <div>
            <div className="text-2xl font-bold text-white">1.2M SUI</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
              Total Volume
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">8.5K</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
              Active Licenses
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">124</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
              New Today
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex justify-center items-center">
        <div className="absolute w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="relative z-10 w-72 h-96 bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-3xl backdrop-blur-md p-6 flex flex-col justify-between shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
          <div className="w-full h-40 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-4 w-3/4 bg-white/10 rounded-full"></div>
            <div className="h-4 w-1/2 bg-white/10 rounded-full"></div>
            <div className="pt-4 flex justify-between items-center">
              <div className="text-sm font-bold text-cyan-400">4 Months</div>
              <div className="text-[10px] text-gray-500 uppercase">Time Remaining</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
