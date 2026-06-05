"use client";

import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  minRows?: number;
  actions?: React.ReactNode;
}

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Enter your prompt...",
  disabled,
  maxLength,
  minRows = 4,
  actions,
}: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder={placeholder}
        className="resize-none"
        style={{ minHeight: `${minRows * 1.5}rem` }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={maxLength}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Press Enter to send, Shift + Enter for new line
        </p>
        {maxLength && (
          <p className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
