"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/routing";
import { useEffect, useState } from "react";

type HeaderShellProps = {
  children: React.ReactNode;
};

const TOP_LIGHT_HEADER_PATHS = ["/"];

export default function HeaderShell({ children }: HeaderShellProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const canUseTopLightMode = TOP_LIGHT_HEADER_PATHS.includes(pathname);
  const isTopLightMode = canUseTopLightMode && !isScrolled;

  useEffect(() => {
    const updateScrolledState = () => {
      setIsScrolled(window.scrollY > 8);
    };

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrolledState);
    };
  }, []);

  return (
    <header
      data-scrolled={!isTopLightMode}
      className={cn(
        "group/header sticky top-0 z-50 py-2 transition-[background-color,border-color,box-shadow,backdrop-filter,color] duration-300",
        isTopLightMode
          ? "border-b border-transparent bg-transparent text-white"
          : "border-b border-zinc-950/10 bg-white/90 text-zinc-950 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      )}
    >
      {children}
    </header>
  );
}
