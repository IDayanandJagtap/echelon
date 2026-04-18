"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";

export function AppShell({ user, children }) {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsMobileView(true);
    }
  }, []);

  return (
    <div className="root-container bg-zinc-950 text-zinc-300">
      <div className="root-content flex">
        <aside className={`main-side-panel ${isMobileView ? "w-[10%]" : "w-[145px]"}`}>
          <Navbar isMobileView={isMobileView} user={user} />
        </aside>

        <main className={`main-content-container ${isMobileView ? "w-[88%]" : "w-full"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}