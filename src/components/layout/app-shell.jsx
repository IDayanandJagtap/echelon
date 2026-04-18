"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";

export function AppShell({ user, children }) {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const updateMobileView = () => {
      setIsMobileView(mediaQuery.matches);
    };

    updateMobileView();
    mediaQuery.addEventListener("change", updateMobileView);

    return () => mediaQuery.removeEventListener("change", updateMobileView);
  }, []);

  return (
    <div className="root-container bg-zinc-950 text-zinc-300">
      <div className="root-content flex h-full w-full gap-2 overflow-hidden">
        <aside
          className={`main-side-panel flex-shrink-0 ${isMobileView ? "w-[68px]" : "w-[145px]"}`}
        >
          <Navbar isMobileView={isMobileView} user={user} />
        </aside>

        <main className="main-content-container relative min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}