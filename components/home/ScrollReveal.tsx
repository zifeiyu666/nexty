"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
};

/**
 * A deliberately quiet reveal layer for existing homepage blocks.
 * It leaves the underlying section markup, IDs, and heading hierarchy intact.
 */
export default function ScrollReveal({ children, className }: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
