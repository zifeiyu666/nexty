"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

const magneticButtonVariants = cva(
  "group/magnetic inline-flex h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 text-base font-normal leading-none tracking-normal shadow-[0_14px_30px_rgba(0,0,0,0.2)] outline-none transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-out focus-visible:ring-4 focus-visible:ring-white/35 disabled:pointer-events-none disabled:opacity-55 sm:h-[3.25rem] sm:px-9 sm:text-lg [&>svg]:size-[1.125rem] [&>svg]:shrink-0 [&>*]:translate-x-[var(--magnetic-content-x,0px)] [&>*]:translate-y-[var(--magnetic-content-y,0px)] [&>*]:transition-transform [&>*]:duration-300 [&>*]:ease-out",
  {
    variants: {
      variant: {
        primary:
          "border-2 border-[#ef3e35] bg-[#ef3e35] text-white shadow-[0_18px_42px_rgba(239,62,53,0.34)] hover:bg-[#f2473e] hover:shadow-[0_22px_46px_rgba(239,62,53,0.42)]",
        light:
          "border-2 border-white bg-white text-[#6262ff] shadow-[0_18px_42px_rgba(0,0,0,0.24)] hover:bg-white hover:text-[#5757f8] hover:shadow-[0_22px_46px_rgba(0,0,0,0.28)]",
      },
      size: {
        default: "h-12 px-7 text-base sm:h-[3.25rem] sm:px-9 sm:text-lg",
        lg: "h-[3.25rem] px-8 text-base sm:h-14 sm:px-10 sm:text-xl",
        sm: "h-10 px-5 text-sm sm:h-11 sm:px-6 sm:text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type MagneticButtonProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof magneticButtonVariants> & {
    disabled?: boolean;
    href?: string;
    magneticRange?: number;
    strength?: number;
    contentStrength?: number;
    trailingArrow?: boolean;
    prefetch?: boolean;
  };

function MagneticButton({
  className,
  variant,
  size,
  href,
  magneticRange = 130,
  strength = 0.26,
  contentStrength = 0.14,
  trailingArrow = false,
  children,
  style,
  onMouseMove,
  onMouseLeave,
  ...props
}: MagneticButtonProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const setElementRef = React.useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  const resetPosition = React.useCallback(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    element.style.setProperty("--magnetic-x", "0px");
    element.style.setProperty("--magnetic-y", "0px");
    element.style.setProperty("--magnetic-content-x", "0px");
    element.style.setProperty("--magnetic-content-y", "0px");
  }, []);

  React.useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    onMouseMove?.(event);

    const element = ref.current;

    if (!element) {
      return;
    }

    const { left, top, width, height } = element.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance > magneticRange) {
      resetPosition();
      return;
    }

    const pull = 1 - distance / magneticRange;
    const x = deltaX * strength * pull;
    const y = deltaY * strength * pull;
    const contentX = deltaX * contentStrength * pull;
    const contentY = deltaY * contentStrength * pull;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      element.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
      element.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
      element.style.setProperty(
        "--magnetic-content-x",
        `${contentX.toFixed(2)}px`
      );
      element.style.setProperty(
        "--magnetic-content-y",
        `${contentY.toFixed(2)}px`
      );
    });
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    onMouseLeave?.(event);
    resetPosition();
  };

  const classes = cn(
    magneticButtonVariants({ variant, size }),
    "translate-x-[var(--magnetic-x,0px)] translate-y-[var(--magnetic-y,0px)]",
    className
  );
  const content = (
    <>
      {children}
      {trailingArrow && (
        <span
          aria-hidden="true"
          className="inline-flex size-5 items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover/magnetic:translate-x-1 sm:size-5"
        >
          <ArrowRight className="size-4 stroke-[2.4] sm:size-[1.125rem]" />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        ref={setElementRef}
        href={href}
        data-slot="magnetic-button"
        className={classes}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={setElementRef}
      data-slot="magnetic-button"
      className={classes}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}

export { MagneticButton, magneticButtonVariants };
