import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

type BrandWordmarkProps = {
  title: string;
  className?: string;
  heartClassName?: string;
};

export default function BrandWordmark({
  title,
  className,
  heartClassName,
}: BrandWordmarkProps) {
  const normalizedTitle = title.trim().toLowerCase();

  if (normalizedTitle !== "one custom song") {
    return <span className={className}>{title}</span>;
  }

  return (
    <span
      aria-label={title}
      className={cn("inline-flex items-center whitespace-nowrap", className)}
    >
      <span aria-hidden="true">One Custom S</span>
      <Heart
        aria-hidden="true"
        className={cn(
          "mx-[0.02em] h-[0.88em] w-[0.88em] shrink-0 translate-y-[0.04em] text-red-500 drop-shadow-[0_1px_5px_rgba(239,68,68,0.45)]",
          heartClassName,
        )}
        fill="currentColor"
        stroke="none"
        strokeWidth={0}
      />
      <span aria-hidden="true">ng</span>
    </span>
  );
}
