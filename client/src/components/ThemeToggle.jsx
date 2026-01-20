import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setDarkMode((prev) => !prev)}
        className={`
      cursor-pointer relative w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none shadow-inner
      ${darkMode ? "bg-blue-600" : "bg-gray-300"}
    `}
      >
        <div
          className={`
        w-4.5 h-4.5 rounded-full bg-white shadow-sm transform transition-transform duration-300 flex items-center justify-center
        ${darkMode ? "translate-x-4.5" : "translate-x-0"}
      `}
        >
          <span className="text-[8px]">{darkMode ? "🌙" : "☀️"}</span>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
