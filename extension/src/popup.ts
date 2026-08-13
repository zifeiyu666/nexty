import { createRemoteDraft, createSongUrl, SITE_URL } from "./api";
import { clearDraft, loadDraft, saveDraft } from "./storage";
import type { ExtensionDraft } from "./types";
import { validateDraft } from "./validation";

const form = document.querySelector<HTMLFormElement>("#draft-form")!;
const submit = document.querySelector<HTMLButtonElement>("#submit")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;
const story = document.querySelector<HTMLTextAreaElement>("#story")!;
const storyCount = document.querySelector<HTMLSpanElement>("#story-count")!;
const saveLocal = document.querySelector<HTMLInputElement>("#save-local")!;

function setStatus(message = "", state?: "success") {
  status.textContent = message;
  if (state) status.dataset.state = state;
  else delete status.dataset.state;
}

function currentDraft(): ExtensionDraft {
  const data = new FormData(form);
  return {
    occasion: String(data.get("occasion") || ""),
    recipientName: String(data.get("recipientName") || "").trim(),
    relationship: String(data.get("relationship") || "").trim(),
    story: String(data.get("story") || "").trim(),
    genre: String(data.get("genre") || ""),
    language: "en",
    source: "browser-extension",
    campaign: "extension",
  };
}

function applyDraft(draft: Partial<ExtensionDraft>) {
  for (const [key, value] of Object.entries(draft)) {
    const field = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    if (field && typeof value === "string") field.value = value;
  }
  updateStoryCount();
}

function updateStoryCount() {
  storyCount.textContent = `${story.value.length} / 2,000`;
}

document.querySelectorAll<HTMLAnchorElement>("[data-site-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    void chrome.tabs.create({ url: link.href });
  });
});

story.addEventListener("input", updateStoryCount);
form.addEventListener("input", () => {
  if (saveLocal.checked) void saveDraft(currentDraft());
});
saveLocal.addEventListener("change", () => {
  if (saveLocal.checked) void saveDraft(currentDraft());
  else void clearDraft();
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const draft = currentDraft();
  const validationError = validateDraft(draft);
  if (validationError) return setStatus(validationError);

  submit.disabled = true;
  setStatus("Saving your private draft…");
  try {
    const { token } = await createRemoteDraft(draft);
    if (saveLocal.checked) await clearDraft();
    setStatus("Opening SendTheSong…", "success");
    await chrome.tabs.create({ url: createSongUrl(token) });
    window.close();
  } catch (error) {
    if (saveLocal.checked) await saveDraft(draft);
    setStatus(error instanceof Error ? error.message : "Unable to save your draft.");
  } finally {
    submit.disabled = false;
  }
});

void loadDraft().then(applyDraft);
void chrome.storage.local.set({ "sendthesong:last-popup-opened-at": new Date().toISOString(), "sendthesong:site": SITE_URL });
