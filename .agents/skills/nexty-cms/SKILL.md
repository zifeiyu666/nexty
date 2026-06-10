---
name: nexty-cms
description: Manage blog/CMS content in NEXTY.DEV. Use when creating blog posts, glossary entries, managing tags, or implementing content visibility. Covers post types, rich text editing, and public content display.
---

# CMS/Blog System in NEXTY.DEV

## Overview

- **Post Types**: `blog`, `glossary`
- **Post Status**: `draft`, `published`, `archived`
- **Visibility**: `public`, `logged_in`, `subscribers`
- **Server Actions**: `actions/posts/`
- **Components**: `components/cms/`

## Post Schema

```typescript
// Key fields in posts table
{
  id: uuid,
  language: string,         // 'en', 'zh', 'ja'
  postType: PostType,       // 'blog' | 'glossary'
  authorId: uuid,
  title: string,
  slug: string,             // URL-friendly identifier
  content: string,          // Rich text/HTML content
  description: string,      // Meta description
  featuredImageUrl: string,
  isPinned: boolean,
  status: PostStatus,       // 'draft' | 'published' | 'archived'
  visibility: PostVisibility, // 'public' | 'logged_in' | 'subscribers'
  publishedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

## Managing Posts (Admin)

### Create Post

```typescript
import { createPostAction } from '@/actions/posts/posts';

const result = await createPostAction({
  data: {
    language: 'en',
    title: 'My New Post',
    slug: 'my-new-post',
    content: '<p>Post content here...</p>',
    description: 'A brief description for SEO',
    featuredImageUrl: 'https://...',
    status: 'draft',
    visibility: 'public',
    isPinned: false,
    tags: [{ id: 'tag-uuid-1' }, { id: 'tag-uuid-2' }],
  },
  postType: 'blog',
});

if (result.success) {
  const postId = result.data?.postId;
}
```

### Update Post

```typescript
import { updatePostAction } from '@/actions/posts/posts';

const result = await updatePostAction({
  data: {
    id: 'post-uuid',
    language: 'en',
    title: 'Updated Title',
    slug: 'updated-slug',
    content: '<p>Updated content...</p>',
    description: 'Updated description',
    status: 'published',
    visibility: 'public',
    isPinned: true,
    tags: [{ id: 'tag-uuid-1' }],
  },
});
```

### Delete Post

```typescript
import { deletePostAction } from '@/actions/posts/posts';

const result = await deletePostAction({
  postId: 'post-uuid',
});
```

### List Posts (Admin)

```typescript
import { listPostsAction } from '@/actions/posts/posts';

const result = await listPostsAction({
  pageIndex: 0,
  pageSize: 20,
  status: 'published', // Optional filter
  language: 'en',      // Optional filter
  filter: 'search',    // Optional search
  postType: 'blog',
});

if (result.success) {
  const { posts, count } = result.data;
}
```

### Get Single Post (Admin)

```typescript
import { getPostByIdAction } from '@/actions/posts/posts';

const result = await getPostByIdAction({
  postId: 'post-uuid',
});

if (result.success) {
  const post = result.data?.post;
  // post.tags contains full tag objects
}
```

## Displaying Posts (Public)

### List Published Posts

```typescript
import { listPublishedPostsAction } from '@/actions/posts/posts';

const result = await listPublishedPostsAction({
  pageIndex: 0,
  pageSize: 20,
  tagId: 'optional-tag-uuid',
  postType: 'blog',
  locale: 'en',
});

if (result.success) {
  const { posts, count } = result.data;
  // posts have .tags as comma-separated string
}
```

### Get Published Post by Slug

```typescript
import { getPublishedPostBySlugAction } from '@/actions/posts/posts';

const result = await getPublishedPostBySlugAction({
  slug: 'my-post-slug',
  postType: 'blog',
  locale: 'en',
});

if (result.success) {
  const post = result.data?.post;
  // Check customCode for visibility restrictions
  if (result.customCode === 'unauthorized') {
    // User needs to log in
  }
  if (result.customCode === 'notSubscriber') {
    // User needs subscription
  }
}
```

### Get Related Posts

```typescript
import { getRelatedPostsAction } from '@/actions/posts/posts';

const result = await getRelatedPostsAction({
  postId: 'current-post-uuid',
  postType: 'blog',
  locale: 'en',
  limit: 5,
});
```

## Managing Tags

### Create Tag

```typescript
import { createTagAction } from '@/actions/posts/tags';

const result = await createTagAction({
  name: 'New Tag',
  postType: 'blog',
});
```

### List Tags

```typescript
import { listTagsAction, getAllTagsAction } from '@/actions/posts/tags';

// Paginated list (admin)
const result = await listTagsAction({
  pageIndex: 0,
  pageSize: 50,
  postType: 'blog',
});

// All tags (for selectors)
const allTags = await getAllTagsAction({ postType: 'blog' });
```

### Delete Tag

```typescript
import { deleteTagAction } from '@/actions/posts/tags';

const result = await deleteTagAction({
  tagId: 'tag-uuid',
});
```

## Blog Page Component Pattern

```typescript
// app/[locale]/(basic-layout)/blog/page.tsx
import { listPublishedPostsAction } from '@/actions/posts/posts';
import { PostCard } from '@/components/cms/PostCard';
import { PostList } from '@/components/cms/PostList';

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const result = await listPublishedPostsAction({
    postType: 'blog',
    locale,
    pageSize: 20,
  });

  const posts = result.success ? result.data?.posts || [] : [];

  return (
    <div className="container py-8">
      <h1>Blog</h1>
      <PostList posts={posts} postType="blog" />
    </div>
  );
}
```

## Single Post Page Pattern

```typescript
// app/[locale]/(basic-layout)/blog/[slug]/page.tsx
import { getPublishedPostBySlugAction } from '@/actions/posts/posts';
import { ContentRestrictionMessage } from '@/components/cms/ContentRestrictionMessage';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const result = await getPublishedPostBySlugAction({
    slug,
    postType: 'blog',
    locale,
  });

  if (!result.success) {
    notFound();
  }

  const post = result.data?.post;
  const restrictionCode = result.customCode;

  return (
    <article className="container py-8">
      <h1>{post?.title}</h1>
      
      {restrictionCode ? (
        <ContentRestrictionMessage code={restrictionCode} />
      ) : (
        <div 
          className="prose"
          dangerouslySetInnerHTML={{ __html: post?.content || '' }}
        />
      )}
    </article>
  );
}
```

## Admin Editor Page Pattern

```typescript
// app/[locale]/(protected)/dashboard/(admin)/blogs/new/page.tsx
import { PostForm } from '@/components/cms/PostForm';
import { getAllTagsAction } from '@/actions/posts/tags';

export default async function NewBlogPage() {
  const tagsResult = await getAllTagsAction({ postType: 'blog' });
  const tags = tagsResult.success ? tagsResult.data?.tags || [] : [];

  return (
    <div className="container py-8">
      <h1>New Blog Post</h1>
      <PostForm 
        postType="blog"
        availableTags={tags}
      />
    </div>
  );
}
```

## Rich Text Editor

The template uses TipTap for rich text editing. Components in `components/tiptap/`:

```typescript
import { PostEditorClient } from '@/components/cms/PostEditorClient';

<PostEditorClient
  initialContent={post?.content || ''}
  onChange={(content) => setContent(content)}
/>
```

## CMS Components

Located in `components/cms/`:

- `PostCard.tsx` - Card display for post listings
- `PostList.tsx` - List container for posts
- `PostForm.tsx` - Create/edit form for posts
- `PostEditorClient.tsx` - TipTap rich text editor
- `PostDataTable.tsx` - Admin data table
- `TagSelector.tsx` - Tag selection UI
- `TagInput.tsx` - Tag input component
- `TagManagementDialog.tsx` - Tag CRUD dialog
- `ImageUpload.tsx` - Featured image upload
- `ContentRestrictionMessage.tsx` - Visibility restriction message
- `RelatedPosts.tsx` - Related posts display
- `ViewCounter.tsx` - Post view tracking

## Content Visibility

Posts can have three visibility levels:

1. **public** - Anyone can view
2. **logged_in** - Only authenticated users
3. **subscribers** - Only users with active subscription

Content restriction is checked in `getPublishedPostBySlugAction`:

```typescript
// Returns customCode indicating restriction type:
// - 'unauthorized' - User not logged in
// - 'notSubscriber' - User not subscribed

// In your component:
if (result.customCode === 'unauthorized') {
  // Show login prompt
}
if (result.customCode === 'notSubscriber') {
  // Show subscription prompt
}
```

## Revalidation

Posts are automatically revalidated after CRUD operations:

```typescript
import { revalidatePath } from 'next/cache';

// After creating/updating/deleting post
revalidatePath(`/${locale}/blog`);
revalidatePath(`/${locale}/blog/${slug}`);
```

## Checklist

1. Choose appropriate post type (`blog` or `glossary`)
2. Set correct visibility for content access control
3. Use translations for all user-facing text
4. Optimize featured images before upload
5. Use descriptive slugs for SEO
6. Add appropriate tags for categorization
7. Set publish date for scheduled content
8. Use isPinned for featured/sticky posts

