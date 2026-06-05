"use server";

import { actionResponse } from "@/lib/action-response";
import { getSession, isAdmin } from "@/lib/auth/server";
import {
  createPresignedDownloadUrl,
  createPresignedUploadUrl,
  deleteFile,
  ListedObject,
  listR2Objects
} from "@/lib/cloudflare/r2";
import { generateR2Key } from "@/lib/cloudflare/r2-utils";
import { getErrorMessage } from "@/lib/error-utils";
import { checkRateLimit, getClientIPFromHeaders } from "@/lib/upstash";
import { REDIS_RATE_LIMIT_CONFIGS } from "@/lib/upstash/redis-rate-limit-configs";
import { z } from "zod";

const PRESIGNED_UPLOAD_EXPIRES_IN = 300; // 10 minutes
const PRESIGNED_DOWNLOAD_EXPIRES_IN = 300; // 5 minutes
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export type R2File = ListedObject;

export interface ListR2FilesData {
  success: boolean;
  data?: {
    files: R2File[];
    nextContinuationToken?: string;
  };
  error?: string;
}

const listSchema = z.object({
  categoryPrefix: z.string(),
  filterPrefix: z.string().optional(),
  continuationToken: z.string().optional(),
  pageSize: z.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export async function listR2Files(
  input: z.infer<typeof listSchema>
): Promise<ListR2FilesData> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden("Admin privileges required.");
  }

  const validationResult = listSchema.safeParse(input);
  if (!validationResult.success) {
    const formattedErrors = validationResult.error.flatten().fieldErrors;
    return actionResponse.badRequest(`Invalid input: ${JSON.stringify(formattedErrors)}`);
  }

  const { categoryPrefix, filterPrefix, continuationToken, pageSize } = validationResult.data;

  const searchPrefix = filterPrefix ? `${categoryPrefix}${filterPrefix}` : categoryPrefix;

  try {
    const result = await listR2Objects({
      prefix: searchPrefix,
      continuationToken: continuationToken,
      pageSize: pageSize,
    });

    if (result.error) {
      return actionResponse.error(result.error);
    }

    return actionResponse.success({
      files: result.objects,
      nextContinuationToken: result.nextContinuationToken,
    });
  } catch (error: any) {
    console.error("Failed to list files using generic R2 lister:", error);
    return actionResponse.error(`Failed to list files: ${error.message || 'Unknown error'}`);
  }
}

export interface DeleteR2FileData {
  success: boolean;
  error?: string;
}

export async function deleteR2File(key: string): Promise<DeleteR2FileData> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden("Admin privileges required.");
  }

  if (!key || key.trim() === "") {
    return actionResponse.badRequest("File key cannot be empty");
  }

  try {
    await deleteFile(key.trim());
    return actionResponse.success();
  } catch (error: any) {
    console.error(`Failed to delete R2 file (${key}):`, error);
    return actionResponse.error(error.message || 'Failed to delete file from R2.');
  }
}

export interface GeneratePresignedUploadUrlData {
  success: boolean;
  data?: {
    presignedUrl: string;
    key: string;
    publicObjectUrl: string;
  };
  error?: string;
}
const generatePresignedUrlSchema = z.object({
  fileName: z.string().min(1, "File name cannot be empty"),
  contentType: z.string().min(1, "Content type cannot be empty"),
  prefix: z.string().optional(),
  path: z.string(),
});
type GeneratePresignedUploadUrlInput = z.infer<
  typeof generatePresignedUrlSchema
>;

async function generatePresignedUploadUrl(
  input: GeneratePresignedUploadUrlInput
): Promise<GeneratePresignedUploadUrlData> {
  const validationResult = generatePresignedUrlSchema.safeParse(input);
  if (!validationResult.success) {
    const formattedErrors = validationResult.error.flatten().fieldErrors;
    return actionResponse.badRequest(
      `Invalid input: ${JSON.stringify(formattedErrors)}`
    );
  }

  const { fileName, contentType, path, prefix } = validationResult.data;

  try {
    const cleanedPath = path.replace(/^\/+|\/+$/g, "");
    const objectKey = generateR2Key({
      fileName,
      path: cleanedPath,
      prefix,
    });

    const { presignedUrl, publicObjectUrl } = await createPresignedUploadUrl({
      key: objectKey,
      contentType,
      expiresIn: PRESIGNED_UPLOAD_EXPIRES_IN,
    });

    return actionResponse.success({
      presignedUrl,
      key: objectKey,
      publicObjectUrl,
    });
  } catch (error: any) {
    console.error(`Failed to generate pre-signed upload URL:`, error);
    return actionResponse.error(
      getErrorMessage(error) || "Failed to generate pre-signed URL"
    );
  }
}

export async function generateAdminPresignedUploadUrl(
  input: GeneratePresignedUploadUrlInput
): Promise<GeneratePresignedUploadUrlData> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden("Admin privileges required.");
  }
  return generatePresignedUploadUrl(input);
}

export async function generateUserPresignedUploadUrl(
  input: GeneratePresignedUploadUrlInput
): Promise<GeneratePresignedUploadUrlData> {
  const session = await getSession()
  const user = session?.user;
  if (!user) return actionResponse.unauthorized();

  return generatePresignedUploadUrl({ ...input });
}

export async function generatePublicPresignedUploadUrl(
  input: GeneratePresignedUploadUrlInput
): Promise<GeneratePresignedUploadUrlData> {
  const clientIP = await getClientIPFromHeaders();
  const isAllowed = await checkRateLimit(clientIP, REDIS_RATE_LIMIT_CONFIGS.anonymousUpload);

  if (!isAllowed) {
    return actionResponse.badRequest(`Rate limit exceeded. Anonymous users can upload up to ${REDIS_RATE_LIMIT_CONFIGS.anonymousUpload.maxRequests} images per day.`);
  }

  return generatePresignedUploadUrl({ ...input });
}


export interface GeneratePresignedDownloadUrlData {
  success: boolean;
  data?: {
    presignedUrl: string;
  };
  error?: string;
}

async function generatePresignedDownloadUrl(
  key: string
): Promise<GeneratePresignedDownloadUrlData> {
  if (!key || key.trim() === "") {
    return actionResponse.badRequest("File key cannot be empty");
  }

  try {
    const presignedUrl = await createPresignedDownloadUrl({
      key: key.trim(),
      expiresIn: PRESIGNED_DOWNLOAD_EXPIRES_IN,
    });

    return actionResponse.success({ presignedUrl });
  } catch (error: any) {
    console.error(`Failed to generate pre-signed download URL for ${key}:`, error);
    return actionResponse.error(
      getErrorMessage(error) || "Failed to generate pre-signed download URL"
    );
  }
}

export async function generateAdminPresignedDownloadUrl(
  key: string
): Promise<GeneratePresignedDownloadUrlData> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden("Admin privileges required.");
  }
  return generatePresignedDownloadUrl(key);
}

export async function generateUserPresignedDownloadUrl(
  key: string
): Promise<GeneratePresignedDownloadUrlData> {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return actionResponse.unauthorized();
  }

  return generatePresignedDownloadUrl(key);
}

export async function generatePublicPresignedDownloadUrl(
  key: string
): Promise<GeneratePresignedDownloadUrlData> {
  const clientIP = await getClientIPFromHeaders();
  const isAllowed = await checkRateLimit(clientIP, REDIS_RATE_LIMIT_CONFIGS.anonymousDownload);

  if (!isAllowed) {
    return actionResponse.badRequest(`Rate limit exceeded. Anonymous users can download up to ${REDIS_RATE_LIMIT_CONFIGS.anonymousDownload.maxRequests} images per day.`);
  }
  return generatePresignedDownloadUrl(key);
}