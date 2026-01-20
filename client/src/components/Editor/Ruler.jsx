/**
 * Ruler Component - Shows pixel measurements on canvas edges
 */
export const Ruler = ({ orientation = 'horizontal', width = 960, height = 540 }) => {
    const isHorizontal = orientation === 'horizontal';
    const length = isHorizontal ? width : height;
    const majorInterval = 100; // Major tick every 100px
    const minorInterval = 50;  // Minor tick every 50px

    const ticks = [];
    for (let i = 0; i <= length; i += minorInterval) {
        const isMajor = i % majorInterval === 0;
        ticks.push({ position: i, isMajor, label: isMajor ? i : null });
    }

    return (
        <div
            className={`bg-gray-900/50 border-white/5 ${isHorizontal
                    ? 'h-5 border-b flex items-end'
                    : 'w-5 border-r flex flex-col items-end'
                }`}
            style={{
                [isHorizontal ? 'width' : 'height']: `${length}px`,
                position: 'relative'
            }}
        >
            {ticks.map((tick, index) => (
                <div
                    key={index}
                    className="absolute"
                    style={{
                        [isHorizontal ? 'left' : 'bottom']: `${tick.position}px`,
                        [isHorizontal ? 'bottom' : 'right']: 0,
                    }}
                >
                    {/* Tick mark */}
                    <div
                        className={`bg-white/30 ${isHorizontal
                                ? `w-px ${tick.isMajor ? 'h-3' : 'h-2'}`
                                : `h-px ${tick.isMajor ? 'w-3' : 'w-2'}`
                            }`}
                    />

                    {/* Label for major ticks */}
                    {tick.label !== null && (
                        <span
                            className="absolute text-[9px] text-gray-500"
                            style={{
                                [isHorizontal ? 'left' : 'bottom']: isHorizontal ? '2px' : '2px',
                                [isHorizontal ? 'bottom' : 'right']: isHorizontal ? '100%' : '100%',
                                transform: isHorizontal ? 'none' : 'rotate(-90deg) translateX(50%)',
                                transformOrigin: isHorizontal ? 'left bottom' : 'right center',
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
