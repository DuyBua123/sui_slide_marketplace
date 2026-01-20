import { Outlet } from "react-router-dom";
export const EmptyLayout = () => {
  return (
    <div className="min-h-screen w-full relative bg-black overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
        }}
      />

      <main className="relative z-10 w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
