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
        "group/header sticky top-0 z-50 py-2 pt-[5px] transition-[background-color,border-color,box-shadow,backdrop-filter,color] duration-300",
        isTopLightMode
          ? " bg-transparent text-[#fdf9f4]"
          : "border-b border-white/75 bg-white/70 text-[#270a05] shadow-[0_10px_30px_rgba(39,10,5,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-150"
      )}
    >
      {children}
    </header>
  );
}
