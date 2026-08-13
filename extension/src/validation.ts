import type { ExtensionDraft } from "./types";

export function validateDraft(draft: ExtensionDraft): string | null {
  if (!draft.occasion || draft.occasion.length > 120) return "Choose an occasion.";
  if (!draft.recipientName.trim() || draft.recipientName.length > 80) return "Add their name.";
  if (draft.relationship.length > 80) return "Relationship is too long.";
  if (draft.story.trim().length < 10) return "Tell us a little more about the memory.";
  if (draft.story.length > 2000) return "Your memory must be 2,000 characters or less.";
  if (!draft.genre || draft.genre.length > 120) return "Choose a music style.";
  return null;
}
