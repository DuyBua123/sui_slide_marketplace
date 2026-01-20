import { ConnectButton } from "@mysten/dapp-kit";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <div className="w-full max-w-7xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
            Slide<span className="text-blue-500">Sui</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/market"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Marketplace
          </Link>
          <Link
            to="/my-slide"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            My Assets
          </Link>
          <Link
            to="/create"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Create
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="scale-90 sm:scale-100 origin-right">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};
