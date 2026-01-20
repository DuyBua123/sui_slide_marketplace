import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";

/**
 * My Slides Page - Gallery of user's owned slides
 */
export const MySlide = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load slides from localStorage (mock for blockchain)
  useEffect(() => {
    setIsLoading(true);
    const savedSlides = JSON.parse(localStorage.getItem("slides") || "[]");
    // Filter by owner (for now, show all local slides)
    const userSlides = savedSlides.filter(
      (s) => s.owner === account?.address || s.owner === "local",
    );
    setSlides(userSlides);
    setIsLoading(false);
  }, [account?.address]);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      const savedSlides = JSON.parse(localStorage.getItem("slides") || "[]");
      const updated = savedSlides.filter((s) => s.id !== id);
      localStorage.setItem("slides", JSON.stringify(updated));
      setSlides(slides.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="py-10 transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Slides</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and edit your slide presentations
          </p>
        </div>
        <button
          onClick={() => navigate("/editor")}
          className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Slide
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && slides.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            No slides yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first slide presentation to get started
          </p>
          <button
            onClick={() => navigate("/editor")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            Create First Slide
          </button>
        </div>
      )}

      {/* Slides Grid */}
      {!isLoading && slides.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="group bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-xl transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {slide.thumbnail ? (
                  <img
                    src={slide.thumbnail}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button
                    onClick={() => navigate(`/editor/${slide.id}`)}
                    className="cursor-pointer p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-lg"
                    title="Edit"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate(`/slide/${slide.id}`)}
                    className="cursor-pointer p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors shadow-lg"
                    title="Present"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="cursor-pointer p-3 bg-red-600/90 hover:bg-red-500 text-white rounded-xl transition-colors shadow-lg"
                    title="Delete"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-white dark:bg-transparent">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {slide.title}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {new Date(slide.createdAt).toLocaleDateString()}
                  </p>
                  <div
                    className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    title="Published"
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
