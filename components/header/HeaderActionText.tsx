import type { ReactNode } from "react";

export type HeaderActionTextProps = {
  children: ReactNode;
  icon?: ReactNode;
  rollingTextClassName?: string;
};

export const headerActionButtonClassName =
  "group/nav-link relative isolate h-8 overflow-hidden rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-none transition-transform duration-300 before:absolute before:inset-0 before:z-0 before:translate-y-[-110%] before:rounded-[inherit] before:bg-white/12 before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1.38,0.36,1)] hover:before:translate-y-0 focus-visible:before:translate-y-0 active:scale-[0.98] motion-reduce:before:transition-none [&>*]:relative [&>*]:z-10";

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
