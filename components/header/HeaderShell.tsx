"use client";

import { usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

type HeaderShellProps = {
  children: React.ReactNode;
};

const TOP_LIGHT_HEADER_PATHS = ["/"];

export default function HeaderShell({ children }: HeaderShellProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const canUseTopLightMode = TOP_LIGHT_HEADER_PATHS.includes(pathname);
  const isTopLightMode = canUseTopLightMode && !isScrolled;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const nextIsScrolled = latest > 8;
    setIsScrolled((current) =>
      current === nextIsScrolled ? current : nextIsScrolled,
    );
  });

  return (
    <header
      data-scrolled={!isTopLightMode}
      className={cn(
        "group/header sticky top-0 z-50 py-2 transition-[background-color,border-color,box-shadow,backdrop-filter,color] duration-300",
        isTopLightMode
          ? " bg-transparent text-[#fdf9f4]"
          : " bg-white/90 text-[#270a05] shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      )}
    >
      {children}
    </header>
  );
}
