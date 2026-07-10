import type { ReactNode } from "react";

export type HeaderActionTextProps = {
  children: string;
  icon?: ReactNode;
  rollingTextClassName?: string;
};

export const headerActionButtonClassName =
  "group/nav-link relative isolate h-8 overflow-hidden rounded-full bg-white/10 px-3 text-xs font-semibold text-[#fdf9f4] shadow-none transition-[color,transform] duration-300 before:absolute before:inset-0 before:z-0 before:translate-y-[-110%] before:rounded-[inherit] before:bg-primary before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1.38,0.36,1)] hover:text-primary-foreground hover:before:translate-y-0 focus-visible:text-primary-foreground focus-visible:before:translate-y-0 active:scale-[0.98] motion-reduce:before:transition-none group-data-[scrolled=true]/header:bg-zinc-950/5 group-data-[scrolled=true]/header:text-[#270a05] group-data-[scrolled=true]/header:hover:text-primary-foreground group-data-[scrolled=true]/header:focus-visible:text-primary-foreground [&>*]:relative [&>*]:z-10";

export function HeaderActionText({
  children,
  icon,
  rollingTextClassName = "text-primary-foreground",
}: HeaderActionTextProps) {
  return (
    <span className="relative inline-block overflow-hidden align-middle leading-[1.15]">
      <span className="sr-only">{children}</span>
      <span
        aria-hidden="true"
        className="flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1.38,0.36,1)] motion-reduce:transition-none group-hover/nav-link:translate-y-[120%] group-focus-visible/nav-link:translate-y-[120%]"
      >
        {icon}
        {children}
      </span>
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 flex -translate-y-[120%] items-center gap-2 ${rollingTextClassName} transition-transform duration-500 ease-[cubic-bezier(0.22,1.38,0.36,1)] motion-reduce:transition-none group-hover/nav-link:translate-y-0 group-focus-visible/nav-link:translate-y-0`}
      >
        {icon}
        {children}
      </span>
    </span>
  );
}
