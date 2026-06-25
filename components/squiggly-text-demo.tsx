"use client";

import React from "react";
import { SquigglyText } from "@/components/ui/squiggly-text";

export default function SquigglyTextDemo() {
  return (
    <div className="flex h-[40rem] w-full items-center justify-center">
      <h1 className="text-center text-5xl leading-tight font-bold text-neutral-900 md:text-7xl lg:text-8xl dark:text-neutral-100">
        How many{" "}
        <SquigglyText
          stepDuration={70}
          scale={[6, 9]}
          className="text-amber-500"
        >
          drinks
        </SquigglyText>{" "}
        <br />
        are <SquigglyText scale={5}>too many</SquigglyText> drinks?
      </h1>
    </div>
  );
}
