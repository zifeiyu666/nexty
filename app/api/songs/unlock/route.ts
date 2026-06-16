import { deductEntitlement } from "@/actions/usage/deduct";
import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { songSampleStore } from "@/lib/ai/song-sample-store";
import { z } from "zod";

const unlockSchema = z.object({
  songId: z.string().trim().min(1),
  versionId: z.string().trim().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return apiResponse.unauthorized("Please sign in to unlock this song.");
  }

  let input: z.infer<typeof unlockSchema>;
  try {
    input = unlockSchema.parse(await req.json());
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid unlock payload."
        : "Invalid JSON payload.";
    return apiResponse.badRequest(message);
  }

  const sample = await songSampleStore.get(input.songId);
  if (!sample) {
    return apiResponse.notFound("Song sample not found.");
  }

  if (sample.userId && sample.userId !== session.user.id) {
    return apiResponse.forbidden("You cannot unlock this song sample.");
  }

  if (sample.isExpired) {
    return apiResponse.badRequest("This song sample has expired.");
  }

  const versionExists = sample.versions.some((version) => version.id === input.versionId);
  if (!versionExists) {
    return apiResponse.badRequest("Song version not found.");
  }

  if (sample.unlockedVersionIds?.includes(input.versionId)) {
    return apiResponse.success({
      sample,
      alreadyUnlocked: true,
    });
  }

  const deduction = await deductEntitlement({
    entitlement: "song",
    amount: 1,
    notes: `Unlock song sample ${input.songId} version ${input.versionId}`,
  });

  if (!deduction.success) {
    return apiResponse.badRequest(deduction.error || "Insufficient song balance.");
  }

  const updatedSample = await songSampleStore.unlockVersion(input.songId, input.versionId);
  if (!updatedSample) {
    return apiResponse.serverError("Failed to unlock song sample.");
  }

  return apiResponse.success({
    sample: updatedSample,
    alreadyUnlocked: false,
    updatedBenefits: deduction.data?.updatedBenefits ?? null,
  });
}
