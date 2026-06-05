---
name: nexty-storage
description: Handle file storage with Cloudflare R2 in NEXTY.DEV. Use when uploading files, generating presigned URLs, or managing user uploads. Covers server uploads, client uploads via presigned URLs, and downloads.
---

# Cloudflare R2 Storage in NEXTY.DEV

## Overview

- **Provider**: Cloudflare R2 (S3-compatible)
- **Client**: `lib/cloudflare/r2-client.ts`
- **Utilities**: `lib/cloudflare/r2.ts`, `lib/cloudflare/r2-utils.ts`
- **Server Actions**: `actions/r2-resources/index.ts`
- **Downloads**: `lib/cloudflare/r2-download.ts`

## Server-Side Uploads

Use `serverUploadFile` when uploading from server (AI output, imports, etc.):

```typescript
import { serverUploadFile } from '@/lib/cloudflare/r2';

// Upload from Buffer
const buffer = Buffer.from('file content');
const result = await serverUploadFile({
  data: buffer,
  contentType: 'image/png',
  path: 'generated', // Optional subdirectory
  key: 'my-file.png', // Required filename
});

// result.url - Public URL
// result.key - Storage key for reference

// Upload from base64
const base64Data = 'iVBORw0KGgo...'; // Base64 string
const result = await serverUploadFile({
  data: base64Data,
  contentType: 'image/png',
  path: 'outputs',
  key: 'result.png',
});
```

## Client Uploads via Presigned URLs

### Step 1: Generate Presigned URL (Server Action)

```typescript
// Three options based on user type:

// 1. Admin uploads (no rate limit)
import { generateAdminPresignedUploadUrl } from '@/actions/r2-resources';

const result = await generateAdminPresignedUploadUrl({
  fileName: 'document.pdf',
  contentType: 'application/pdf',
  path: 'documents',
  prefix: 'admin', // Optional
});

// 2. Authenticated user uploads (auto-prefixed with userId)
import { generateUserPresignedUploadUrl } from '@/actions/r2-resources';

const result = await generateUserPresignedUploadUrl({
  fileName: 'avatar.jpg',
  contentType: 'image/jpeg',
  path: 'avatars',
});
// Path becomes: users/avatars/userid-{userId}/timestamp-random-avatar.jpg

// 3. Public/anonymous uploads (rate limited)
import { generatePublicPresignedUploadUrl } from '@/actions/r2-resources';

const result = await generatePublicPresignedUploadUrl({
  fileName: 'upload.png',
  contentType: 'image/png',
  path: 'public-uploads',
});
```

### Step 2: Upload from Client

```typescript
'use client';

import { generateUserPresignedUploadUrl } from '@/actions/r2-resources';
import { toast } from 'sonner';

async function uploadFile(file: File) {
  // Get presigned URL
  const result = await generateUserPresignedUploadUrl({
    fileName: file.name,
    contentType: file.type,
    path: 'uploads',
  });

  if (!result.success) {
    toast.error(result.error);
    return null;
  }

  const { presignedUrl, key, publicObjectUrl } = result.data;

  // Upload directly to R2
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    toast.error('Upload failed');
    return null;
  }

  // Return the storage key and URL
  return { key, url: publicObjectUrl };
}
```

## Downloads

### Client-Side Downloads

```typescript
'use client';

import {
  downloadFileAsAdmin,
  downloadFileAsUser,
  downloadFileAsPublic,
  downloadFileFromUrl,
} from '@/lib/cloudflare/r2-download';

// Download by key
await downloadFileAsAdmin('path/to/file.pdf');   // Admin - no rate limit
await downloadFileAsUser('path/to/file.pdf');    // Authenticated user
await downloadFileAsPublic('path/to/file.pdf');  // Public - rate limited

// Download from full URL
await downloadFileFromUrl(
  'https://r2.example.com/path/to/file.pdf',
  'user' // 'admin' | 'user' | 'public'
);
```

### Server-Side Presigned Download URL

```typescript
import { createPresignedDownloadUrl } from '@/lib/cloudflare/r2';

const { presignedUrl } = await createPresignedDownloadUrl({
  key: 'path/to/file.pdf',
  expiresIn: 300, // 5 minutes (default)
});
```

## Listing Files

### Admin File Listing

```typescript
import { listR2Files } from '@/actions/r2-resources';

const result = await listR2Files({
  categoryPrefix: 'uploads',
  filterPrefix: 'user-123', // Optional filter
  pageSize: 20,
  continuationToken: nextToken, // For pagination
});

if (result.success) {
  const { files, nextContinuationToken } = result.data;
  // files: Array of { key, size, lastModified, ... }
}
```

## Deleting Files

```typescript
import { deleteR2File } from '@/actions/r2-resources';

// Admin only
const result = await deleteR2File('path/to/file.pdf');

if (!result.success) {
  console.error(result.error);
}
```

## Key Generation

```typescript
import { generateR2Key } from '@/lib/cloudflare/r2-utils';

// Generate unique key
const key = generateR2Key({
  fileName: 'document.pdf',
  path: 'documents',
  prefix: 'user-123',
});
// Result: documents/user-123/1704067200000-abc123-document.pdf
```

## File Upload Component Example

```typescript
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { generateUserPresignedUploadUrl } from '@/actions/r2-resources';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

interface FileUploadProps {
  onUpload: (result: { key: string; url: string }) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUpload({
  onUpload,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await generateUserPresignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        path: 'uploads',
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const { presignedUrl, key, publicObjectUrl } = result.data;

      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      onUpload({ key, url: publicObjectUrl });
      toast.success('File uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {isUploading ? 'Uploading...' : 'Upload File'}
      </Button>
    </div>
  );
}
```

## Environment Variables

```
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL
NEXT_PUBLIC_DAILY_IMAGE_UPLOAD_LIMIT   # Rate limit for public uploads (default: 100)
NEXT_PUBLIC_DAILY_IMAGE_DOWNLOAD_LIMIT # Rate limit for public downloads (default: 100)
```

## Checklist

1. Choose upload method based on source (server vs client)
2. Choose presigned URL type based on user role
3. Validate file type and size before upload
4. Store both `key` and `url` in database
5. Use download helpers for proper error handling
6. Handle rate limiting for public operations
7. Configure `next.config.mjs` for R2 image domain

