import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export const DefaultLayout = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen w-full relative bg-[#050505] text-white overflow-x-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 0%, #3b82f6 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <Outlet />
        </main>
        <Footer />
      </div>

      <button
        onClick={scrollToTop}
        className={`cursor-pointer fixed bottom-8 right-8 z-50 p-3 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 backdrop-blur-md transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105 shadow-lg shadow-blue-500/20 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </div>
  );
};
