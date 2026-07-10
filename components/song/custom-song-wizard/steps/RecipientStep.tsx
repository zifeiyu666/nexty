"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, Plus, Trash2, UserRound } from "lucide-react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  customOccasionValue,
  occasions,
  suggestedCustomOccasions,
} from "../constants";
import type { Occasion, RecipientInput } from "../types";
import {
  MagneticChoiceCard,
  RelationshipCreatableSelect,
} from "../components/wizard-ui";

type RecipientStepProps = {
  customOccasionInput: string;
  customOccasionInputRef: RefObject<HTMLInputElement | null>;
  occasion: Occasion | null;
  recipients: RecipientInput[];
  showCustomOccasionInput: boolean;
  onAddRecipient: () => void;
  onRecipientChange: (
    index: number,
    field: keyof RecipientInput,
    value: string,
  ) => void;
  onRemoveRecipient: (index: number) => void;
  onSelectCustomOccasion: (value: string) => void;
  onSelectOccasion: (value: Occasion) => void;
};

export function RecipientStep({
  customOccasionInput,
  customOccasionInputRef,
  occasion,
  recipients,
  showCustomOccasionInput,
  onAddRecipient,
  onRecipientChange,
  onRemoveRecipient,
  onSelectCustomOccasion,
  onSelectOccasion,
}: RecipientStepProps) {
  return (
    <div className="mx-auto mt-8 max-w-5xl space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <UserRound className="size-5 text-primary" />
            Who&apos;s this song for?
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Up to 3 names
          </p>
        </div>
        <div className="space-y-3">
          {recipients.map((recipient, index) => (
            <div key={index} className="flex gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                <Input
                  className="h-12 rounded-xl border-border bg-card px-4 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/20"
                  placeholder={index === 0 ? "Recipient name" : "Another name"}
                  value={recipient.name}
                  onChange={(event) =>
                    onRecipientChange(index, "name", event.target.value)
                  }
                />
                <RelationshipCreatableSelect
                  placeholder={
                    index === 0 ? "Relationship" : "Their relationship"
                  }
                  value={recipient.relationship}
                  onChange={(value) =>
                    onRecipientChange(index, "relationship", value)
                  }
                />
              </div>
              <Button
                aria-label="Remove name"
                className="h-12 w-12 shrink-0 rounded-xl bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
                disabled={
                  recipients.length === 1 &&
                  !recipient.name.trim() &&
                  !recipient.relationship.trim()
                }
                type="button"
                variant="ghost"
                onClick={() => onRemoveRecipient(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        {recipients.length < 3 && (
          <button
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-sm"
            type="button"
            onClick={onAddRecipient}
          >
            <Plus className="size-4 text-primary" />
            Add another name
          </button>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          Adding more than one name? The song will mention each of them.
        </p>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <PartyPopper className="size-5 text-primary" />
            Occasion
          </div>
          <p className="text-sm font-medium text-muted-foreground">Pick one</p>
        </div>
        <div className="grid gap-x-3 gap-y-6 pt-2 sm:grid-cols-2 lg:grid-cols-5">
          {occasions.map((item) => {
            const selected =
              item.value === customOccasionValue
                ? showCustomOccasionInput
                : occasion === item.value;

            return (
              <MagneticChoiceCard
                key={item.value}
                art={item.art}
                artPlacement="center"
                icon={item.icon}
                label={item.title}
                selected={selected}
                showIcon={false}
                showSelectedCheck={false}
                onClick={() => onSelectOccasion(item.value)}
              />
            );
          })}
        </div>
        <AnimatePresence initial={false}>
          {showCustomOccasionInput && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-3 shadow-sm"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestedCustomOccasions.map((item) => {
                  const selectedCustomOccasion = occasion === item;

                  return (
                    <button
                      key={item}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-2 text-xs font-bold transition hover:-translate-y-0.5 hover:shadow-sm",
                        selectedCustomOccasion
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
                      )}
                      type="button"
                      onClick={() => onSelectCustomOccasion(item)}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <Input
                ref={customOccasionInputRef}
                className="h-14 rounded-xl border-primary bg-card px-5 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                placeholder="e.g. Retirement, Housewarming..."
                value={customOccasionInput}
                onChange={(event) => onSelectCustomOccasion(event.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
