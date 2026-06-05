"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  onCancel?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function GenerateButton({
  onClick,
  loading,
  disabled,
  loadingText = "Generating...",
  onCancel,
  children,
  className,
}: GenerateButtonProps) {
  if (loading && onCancel) {
    return (
      <div className={`flex items-center gap-2 ${className || ""}`}>
        <Button disabled className="flex-1">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Stop
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
