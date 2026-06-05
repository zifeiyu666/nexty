import { listTagsAction } from '@/actions/posts/tags';
import { PostType } from '@/lib/db/schema';
import { Tag } from '@/types/cms';
import { create } from 'zustand';

interface TagState {
  // Store tags by postType
  tags: Record<string, Tag[]>;
  isLoading: Record<string, boolean>;

  // Actions
  fetchTags: (postType: PostType, force?: boolean) => Promise<void>;
  addTag: (postType: PostType, tag: Tag) => void;
  updateTag: (postType: PostType, tag: Tag) => void;
  removeTag: (postType: PostType, tagId: string) => void;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: {},
  isLoading: {},

  fetchTags: async (postType: PostType, force = false) => {
    const state = get();
    // Return early if already loaded and not forced
    if (!force && state.tags[postType] && state.tags[postType].length > 0) {
      return;
    }

    // Set loading state only if it's the first load or if explicitly forced
    if (!state.tags[postType]) {
      set((state) => ({
        isLoading: { ...state.isLoading, [postType]: true },
      }));
    }

    try {
      const result = await listTagsAction({ postType });
      if (result.success && result.data?.tags) {
        set((state) => ({
          tags: { ...state.tags, [postType]: result.data!.tags },
        }));
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      set((state) => ({
        isLoading: { ...state.isLoading, [postType]: false },
      }));
    }
  },

  addTag: (postType, tag) => {
    set((state) => ({
      tags: {
        ...state.tags,
        [postType]: [tag, ...(state.tags[postType] || [])],
      },
    }));
  },

  updateTag: (postType, updatedTag) => {
    set((state) => ({
      tags: {
        ...state.tags,
        [postType]: (state.tags[postType] || []).map((t) =>
          t.id === updatedTag.id ? updatedTag : t
        ),
      },
    }));
  },

  removeTag: (postType, tagId) => {
    set((state) => ({
      tags: {
        ...state.tags,
        [postType]: (state.tags[postType] || []).filter((t) => t.id !== tagId),
      },
    }));
  },
}));

