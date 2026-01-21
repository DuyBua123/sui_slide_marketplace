/**
 * Ruler Component - Shows pixel measurements on canvas edges
 */
export const Ruler = ({ orientation = "horizontal", width = 960, height = 540 }) => {
  const isHorizontal = orientation === "horizontal";
  const length = isHorizontal ? width : height;
  const majorInterval = 100; // Major tick every 100px
  const minorInterval = 50; // Minor tick every 50px

  const ticks = [];
  for (let i = 0; i <= length; i += minorInterval) {
    const isMajor = i % majorInterval === 0;
    ticks.push({ position: i, isMajor, label: isMajor ? i : null });
  }

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-white/5 transition-colors ${
        isHorizontal ? "h-5 border-b flex items-end" : "w-5 border-r flex flex-col items-end"
      }`}
      style={{
        [isHorizontal ? "width" : "height"]: `${length}px`,
        position: "relative",
      }}
    >
      {ticks.map((tick, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            [isHorizontal ? "left" : "bottom"]: `${tick.position}px`,
            [isHorizontal ? "bottom" : "right"]: 0,
          }}
        >
          {/* Tick mark */}
          <div
            className={`bg-gray-300 dark:bg-white/30 ${
              isHorizontal
                ? `w-px ${tick.isMajor ? "h-3" : "h-1.5"}`
                : `h-px ${tick.isMajor ? "w-3" : "w-1.5"}`
            }`}
          />

          {/* Label for major ticks */}
          {tick.label !== null && (
            <span
              className="absolute text-[8px] font-bold text-gray-400 dark:text-gray-500 select-none"
              style={{
                [isHorizontal ? "left" : "bottom"]: isHorizontal ? "4px" : "4px",
                [isHorizontal ? "bottom" : "right"]: isHorizontal ? "6px" : "6px",
                transform: isHorizontal ? "none" : "rotate(-90deg) translate(0, 50%)",
                transformOrigin: isHorizontal ? "left bottom" : "right center",
              }}
            >
              {tick.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Ruler;
