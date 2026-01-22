export const CardSkeleton = () => (
  <div className="bg-gray-100/50 dark:bg-slate-800/50 rounded-3xl p-3 animate-pulse border border-transparent">
    <div className="aspect-4/3 rounded-[18px] bg-gray-200 dark:bg-slate-700 mb-4"></div>
    <div className="px-1 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-3/4"></div>
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-md w-1/2"></div>
      <div className="space-y-2 pt-2">
        <div className="h-1 bg-gray-200 dark:bg-slate-700 rounded-full w-full"></div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-xl w-full"></div>
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-xl w-10 ml-2"></div>
        </div>
      </div>
    </div>
  </div>
);
