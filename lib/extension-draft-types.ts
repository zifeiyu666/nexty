export type ExtensionDraftInput = {
  occasion: string;
  recipientName: string;
  relationship: string;
  story: string;
  genre: string;
  language: "en";
  source: "browser-extension";
  campaign?: "extension";
};

export type RestoredExtensionDraft = Pick<
  ExtensionDraftInput,
  "occasion" | "recipientName" | "relationship" | "story" | "genre" | "language"
>;
