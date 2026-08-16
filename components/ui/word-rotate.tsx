"use client";

import { useEffect, useRef, useState } from "react";

interface WordRotateProps {
  words: readonly string[];
  duration?: number;
  className?: string;
  containerClassName?: string;
}

export function WordRotate({
  words,
  duration = 2500,
  className,
  containerClassName,
}: WordRotateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [contentWidth, setContentWidth] = useState<number>();
  const measureRef = useRef<HTMLSpanElement>(null);

  const currentWord = words[currentIndex] || "";
  const nextWord = words[(currentIndex + 1) % words.length] || "";
  const targetWord = isAnimating ? nextWord : currentWord;

  useEffect(() => {
    if (words.length < 2) return;

    const interval = window.setInterval(() => {
      setIsAnimating(true);
    }, duration);

    return () => window.clearInterval(interval);
  }, [duration, words.length]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const width = measureRef.current?.getBoundingClientRect().width;
      if (width) setContentWidth(Math.ceil(width));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [targetWord]);

  if (!words.length) return null;

  function finishTransition() {
    if (!isAnimating) return;

    setIsResetting(true);
    setCurrentIndex((index) => (index + 1) % words.length);
    setIsAnimating(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsResetting(false));
    });
  }

  return (
    <span
      className={`relative inline-block h-[1.1em] overflow-hidden align-baseline transition-[width] duration-500 ease-in-out ${containerClassName ?? ""}`}
      aria-live="polite"
      style={contentWidth ? { width: `${contentWidth}px` } : undefined}
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className={`pointer-events-none absolute whitespace-nowrap opacity-0 ${className ?? ""}`}
      >
        {targetWord}
      </span>
      <span
        className={`absolute inset-x-0 top-0 flex h-[1.1em] items-center justify-center whitespace-nowrap ${isResetting ? "transition-none" : "transition-transform duration-500 ease-in-out"} ${className ?? ""}`}
        style={{
          transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
        }}
      >
        {currentWord}
      </span>
      <span
        className={`absolute inset-x-0 top-0 flex h-[1.1em] items-center justify-center whitespace-nowrap ${isResetting ? "transition-none" : "transition-transform duration-500 ease-in-out"} ${className ?? ""}`}
        style={{
          transform: isAnimating ? "translateY(0)" : "translateY(100%)",
        }}
        onTransitionEnd={(event) => {
          if (event.propertyName === "transform") finishTransition();
        }}
      >
        {nextWord}
      </span>
    </span>
  );
}
