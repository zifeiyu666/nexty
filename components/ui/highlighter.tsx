"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type React from "react"
import { useInView } from "motion/react"
import { annotate } from "rough-notation"
import { type RoughAnnotation } from "rough-notation/lib/model"

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket"

interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  /** Number of sketchy strokes stacked with slight variation */
  iterations?: number
  padding?: number
  /** Hand-drawn irregularity, higher = sketchier */
  roughness?: number
  multiline?: boolean
  isView?: boolean
}

/** Deterministic pseudo-random in [-1, 1] so strokes stay stable per render */
function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

/** Hand-drawn underline: a slightly arced bezier with a gentle wave */
function buildUnderlinePath(width: number, baseY: number, seed: number, roughness: number) {
  const amp = roughness * 3
  const arc = roughness * 2.2
  // Never let the wiggle climb above the svg top (the text bottom edge)
  const y = (v: number) => Math.max(v, 0.5).toFixed(1)
  const jitter = (n: number) => seededRandom(seed * 7 + n) * amp
  const y0 = baseY + jitter(1)
  const y1 = baseY + arc + jitter(2)
  const y2 = baseY - arc * 0.4 + jitter(3)
  const y3 = baseY + jitter(4)
  return `M 2 ${y(y0)} C ${(width * 0.32).toFixed(1)} ${y(y1)}, ${(width * 0.62).toFixed(1)} ${y(y2)}, ${(width - 2).toFixed(1)} ${y(y3)}`
}

function UnderlineStrokes({
  width,
  strokeWidth,
  color,
  iterations,
  padding,
  roughness,
  animationDuration,
  visible,
}: {
  width: number
  strokeWidth: number
  color: string
  iterations: number
  padding: number
  roughness: number
  animationDuration: number
  visible: boolean
}) {
  // Stroke zone starts below the text box (padding = gap) and only grows
  // downward, so higher roughness never pushes strokes into the text.
  const amp = roughness * 3
  const arc = roughness * 2.2
  // Baseline stays fixed just below the text; the wiggle is symmetric around
  // it, so higher roughness wiggles in place instead of drifting away.
  const baseY = padding + strokeWidth
  const height = baseY + amp + arc + strokeWidth + 2

  const paths = useMemo(
    () =>
      Array.from({ length: iterations }, (_, i) =>
        buildUnderlinePath(width, baseY, i + 1, roughness)
      ),
    [width, baseY, iterations, roughness]
  )

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-full overflow-visible"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={1}
          opacity={iterations > 1 ? 0.55 + 0.45 / iterations : 0.95}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: visible ? 0 : 1,
            transition: `stroke-dashoffset ${animationDuration}ms ease-out ${i * 90}ms`,
          }}
        />
      ))}
    </svg>
  )
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 1,
  padding = 2,
  roughness = 1.6,
  multiline = true,
  isView = false,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const [fontsReady, setFontsReady] = useState(false)
  const [width, setWidth] = useState(0)

  const isInView = useInView(elementRef, {
    once: true,
    margin: "-10%",
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  // Web fonts change text metrics after hydration; wait for them before
  // measuring, otherwise the annotation box is computed from fallback fonts.
  useEffect(() => {
    let cancelled = false
    if (typeof document === "undefined" || !document.fonts?.ready) {
      setFontsReady(true)
      return
    }
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Track element width so the underline path matches the rendered text
  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element) return
    const measure = () => setWidth(element.getBoundingClientRect().width)
    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [fontsReady])

  // rough-notation for every action except underline, where its svg container
  // can clip the strokes; the underline is drawn by UnderlineStrokes instead.
  useLayoutEffect(() => {
    if (action === "underline") return
    const element = elementRef.current
    if (!shouldShow || !element || !fontsReady) return

    let annotation: RoughAnnotation | null = null
    let resizeTimer: ReturnType<typeof setTimeout> | undefined

    const create = () => {
      annotation?.remove()
      annotation = annotate(element, {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        roughness,
        multiline,
      } as Parameters<typeof annotate>[1])
      annotation.show()
    }

    create()

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(create, 120)
    })
    resizeObserver.observe(element)

    return () => {
      clearTimeout(resizeTimer)
      resizeObserver.disconnect()
      annotation?.remove()
    }
  }, [
    shouldShow,
    fontsReady,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    roughness,
    multiline,
  ])

  return (
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
      {action === "underline" && width > 0 && (
        <UnderlineStrokes
          width={width}
          strokeWidth={strokeWidth}
          color={color}
          iterations={iterations}
          padding={padding}
          roughness={roughness}
          animationDuration={animationDuration}
          visible={shouldShow && fontsReady}
        />
      )}
    </span>
  )
}
