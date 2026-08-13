export type ExtensionDraft = {
  occasion: string;
  recipientName: string;
  relationship: string;
  story: string;
  genre: string;
  language: "en";
  source: "browser-extension";
  campaign: "extension";
};

export type ApiResponse<T> = { success: true; data: T } | { success: false; error?: string };
