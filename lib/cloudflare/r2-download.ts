"use client";

import {
  generateAdminPresignedDownloadUrl,
  generatePublicPresignedDownloadUrl,
  generateUserPresignedDownloadUrl,
} from "@/actions/r2-resources";
import { toast } from "sonner";

/**
 * Download a file from a URL using fetch and blob
 * Falls back to opening in a new tab if download fails
 */
async function downloadUrl(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.target = "_blank";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error(
      "Download failed, falling back to opening in a new tab:",
      error
    );
    window.open(url, "_blank");
  }
}

/**
 * Download a file from R2 using presigned URL (Admin version)
 * @param key - The R2 object key
 */
export const downloadFileAsAdmin = async (key: string) => {
  try {
    const res = await generateAdminPresignedDownloadUrl(key);

    if (!res.success || !res.data?.presignedUrl) {
      toast.error(res.error || "Failed to get download link.");
      return;
    }

    const fileName = key.split("/").pop() || "download";
    await downloadUrl(res.data.presignedUrl, fileName);
  } catch (error: any) {
    toast.error(error.message || "An unknown error occurred during download.");
    console.error("Download failed:", error);
  }
};

/**
 * Download a file from R2 using presigned URL (User version)
 * @param key - The R2 object key
 */
export const downloadFileAsUser = async (key: string) => {
  try {
    const res = await generateUserPresignedDownloadUrl(key);

    if (!res.success || !res.data?.presignedUrl) {
      toast.error(res.error || "Failed to get download link.");
      return;
    }

    const fileName = key.split("/").pop() || "download";
    await downloadUrl(res.data.presignedUrl, fileName);
  } catch (error: any) {
    toast.error(error.message || "An unknown error occurred during download.");
    console.error("Download failed:", error);
  }
};

/**
 * Download a file from R2 using presigned URL (Public version)
 * @param key - The R2 object key
 */
export const downloadFileAsPublic = async (key: string) => {
  try {
    const res = await generatePublicPresignedDownloadUrl(key);

    if (!res.success || !res.data?.presignedUrl) {
      toast.error(res.error || "Failed to get download link.");
      return;
    }

    const fileName = key.split("/").pop() || "download";
    await downloadUrl(res.data.presignedUrl, fileName);
  } catch (error: any) {
    toast.error(error.message || "An unknown error occurred during download.");
    console.error("Download failed:", error);
  }
};

/**
 * Download a file from a full URL path using presigned URL
 * Extracts the key from the URL and uses the appropriate download method
 * @param fullPath - The full URL path to the file
 * @param mode - The download mode: 'admin', 'user', or 'public'
 */
export const downloadFileFromUrl = async (
  fullPath: string,
  mode: "admin" | "user" | "public" = "user"
) => {
  try {
    const { pathname } = new URL(fullPath);
    const key = pathname.startsWith("/") ? pathname.slice(1) : pathname;

    switch (mode) {
      case "admin":
        await downloadFileAsAdmin(key);
        break;
      case "user":
        await downloadFileAsUser(key);
        break;
      case "public":
        await downloadFileAsPublic(key);
        break;
      default:
        throw new Error(`Invalid download mode: ${mode}`);
    }
  } catch (error: any) {
    toast.error(error.message || "An unknown error occurred during download.");
    console.error("Download failed:", error);
  }
};
