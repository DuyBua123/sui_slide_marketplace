import { ConnectButton } from "@mysten/dapp-kit";
import { Link } from "react-router-dom";
import { ROUTE } from "../../constant/routeConfig";
import { useState } from "react";
import ThemeToggle from "../ThemeToggle";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden"
          onClick={closeMenu}
        />
      )}

      <div className="w-full max-w-7xl bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between shadow-xl dark:shadow-2xl relative z-20 transition-colors duration-500">
        <Link to={ROUTE.HOME} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-gray-900 dark:text-white font-bold text-xl tracking-tight">
            Slide<span className="text-blue-500">Sui</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to={ROUTE.MARKET}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors text-sm font-medium"
          >
            Marketplace
          </Link>
          <Link
            to={ROUTE.MYSLIDE}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors text-sm font-medium"
          >
            My Assets
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <div className="flex items-center">
            <div className="[&_button]:!px-3 [&_button]:!py-1.5 [&_button]:!text-xs sm:[&_button]:!px-4 sm:[&_button]:!py-2 sm:[&_button]:!text-sm">
              <ConnectButton />
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white md:hidden transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        <div
          className={`
          absolute top-[calc(100%+12px)] left-0 right-0 p-2
          bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-2xl
          flex flex-col transition-all duration-300 origin-top md:hidden shadow-xl
          ${isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}
        `}
        >
          <Link
            to={ROUTE.MARKET}
            onClick={closeMenu}
            className="p-4 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-700 dark:text-gray-300 transition-colors"
          >
            Marketplace
          </Link>
          <Link
            to={ROUTE.MYSLIDE}
            onClick={closeMenu}
            className="p-4 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-700 dark:text-gray-300 transition-colors"
          >
            My Assets
          </Link>
        </div>
      </div>
    </header>
  );
};
