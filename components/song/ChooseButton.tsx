"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

type Props = {
  songId?: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
  onChoose?: () => void;
};

export default function ChooseButton({ songId, href, className, children, onChoose }: Props) {
  if (onChoose) {
    return (
      <Button
        className={className}
        type="button"
        onClick={() => {
          try {
            onChoose();
          } catch (err) {
            console.error("[ChooseButton] onChoose handler failed", err);
          }
        }}
      >
        {children || "Choose this one"}
      </Button>
    );
  }
  const targetHref = href
    ? href
    : `/create-song${songId ? `?fromSample=${encodeURIComponent(songId)}` : ""}`;

  return (
    <Button asChild className={className}>
      <Link href={targetHref}>{children || "Choose this one"}</Link>
    </Button>
  );
}
