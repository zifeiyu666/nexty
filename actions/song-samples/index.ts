"use server";

import { actionResponse } from "@/lib/action-response";
import { songSampleStore } from "@/lib/ai/song-sample-store";
import { getSession } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/error-utils";
import "server-only";

export async function deleteSongSampleAction(input: {
  songId: string;
}) {
  const songId = input.songId.trim();

  if (!songId) {
    return actionResponse.badRequest("Sample ID is required.");
  }

  try {
    const session = await getSession();
    const sample = await songSampleStore.get(songId);

    if (!sample) {
      return actionResponse.notFound("Sample not found.");
    }

    const userCanDelete = Boolean(
      session?.user?.id && sample.userId === session.user.id
    );

    if (!userCanDelete) {
      return actionResponse.forbidden("You do not have permission to delete this sample.");
    }

    await songSampleStore.delete(songId);

    return actionResponse.success({ songId });
  } catch (error) {
    console.error("[deleteSongSampleAction] Failed to delete sample", error);
    return actionResponse.error(getErrorMessage(error));
  }
}
