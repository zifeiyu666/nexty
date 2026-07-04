"use client";

import {
  Check,
  Edit3,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import type { GenreOption, LyricsVersionComparison } from "../types";
import { LyricsVersionPanel } from "./wizard-ui";

export function GenreWarningDialog({
  pendingGenre,
  onConfirm,
  onOpenChange,
}: {
  pendingGenre: GenreOption | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={Boolean(pendingGenre)} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>
            This style may not match the occasion
          </AlertDialogTitle>
          <AlertDialogDescription className="leading-6">
            This genre can still work, but it may feel less natural for the
            occasion you selected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">
            Choose a recommended style
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onConfirm}
          >
            Use this genre anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function NewLyricsVersionDialog({
  instruction,
  open,
  onGenerate,
  onInstructionChange,
  onOpenChange,
}: {
  instruction: string;
  open: boolean;
  onGenerate: () => void;
  onInstructionChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border px-5 pb-4 pt-5 text-left sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Sparkles className="size-5 text-primary" />
            Write a new version
          </DialogTitle>
          <DialogDescription className="leading-6">
            Add optional direction for the next lyrics draft.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4 sm:px-6">
          <Textarea
            autoFocus
            className="min-h-32 resize-none rounded-2xl border-border bg-muted p-4 text-sm leading-6 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-primary/20"
            maxLength={500}
            placeholder="e.g., Add the main character's name to the title, make the whole song more romantic..."
            value={instruction}
            onChange={(event) => onInstructionChange(event.target.value)}
          />
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{instruction.length} / 500</span>
            <span>Leave it blank for a fresh take.</span>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-5 py-4 sm:px-6">
          <Button
            className="h-10 rounded-full px-5 text-sm font-bold"
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90"
            type="button"
            onClick={onGenerate}
          >
            <RefreshCw className="size-4" />
            Generate version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LyricsVersionComparisonDialog({
  comparison,
  onKeepOriginal,
  onUseNew,
}: {
  comparison: LyricsVersionComparison | null;
  onKeepOriginal: () => void;
  onUseNew: () => void;
}) {
  return (
    <Dialog
      open={Boolean(comparison)}
      onOpenChange={(open) => {
        if (!open) onKeepOriginal();
      }}
    >
      <DialogContent className="flex max-h-[86vh] flex-col overflow-hidden rounded-2xl border-border p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-border px-5 pb-4 pt-5 text-left sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Edit3 className="size-5 text-primary" />
            Compare lyrics versions
          </DialogTitle>
          <DialogDescription className="leading-6">
            Review both drafts before choosing which one to keep.
          </DialogDescription>
        </DialogHeader>

        {comparison && (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="grid gap-4 md:grid-cols-2">
              <LyricsVersionPanel
                label="Original"
                lyrics={comparison.originalLyrics}
                title={comparison.originalTitle}
              />
              <LyricsVersionPanel
                label="New version"
                lyrics={comparison.newLyrics}
                title={comparison.newTitle}
              />
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border px-5 py-4 sm:px-6">
          <Button
            className="h-10 rounded-full px-5 text-sm font-bold"
            type="button"
            variant="ghost"
            onClick={onKeepOriginal}
          >
            Use original
          </Button>
          <Button
            className="h-10 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90"
            type="button"
            onClick={onUseNew}
          >
            <Check className="size-4" />
            Use new version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
