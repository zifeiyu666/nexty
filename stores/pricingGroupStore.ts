import { listPricingGroupsAction } from '@/actions/prices/groups';
import { PricingPlanGroup } from '@/types/pricing';
import { create } from 'zustand';

interface PricingGroupState {
  groups: PricingPlanGroup[];
  isLoading: boolean;

  // Actions
  fetchGroups: (force?: boolean) => Promise<void>;
  addGroup: (group: PricingPlanGroup) => void;
  removeGroup: (groupSlug: string) => void;
}

export const usePricingGroupStore = create<PricingGroupState>((set, get) => ({
  groups: [],
  isLoading: true,

  fetchGroups: async (force = false) => {
    const state = get();
    // Return early if already loaded and not forced
    if (!force && state.groups.length > 0) {
      return;
    }

    // Set loading state only if it's the first load
    if (state.groups.length === 0) {
      set({ isLoading: true });
    }

    try {
      const result = await listPricingGroupsAction();
      if (result.success && result.data) {
        set({ groups: result.data });
      }
    } catch (error) {
      console.error('Failed to fetch pricing groups:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addGroup: (group) => {
    set((state) => ({
      groups: [...state.groups, group].sort((a, b) =>
        a.slug.localeCompare(b.slug)
      ),
    }));
  },

  removeGroup: (groupSlug) => {
    set((state) => ({
      groups: state.groups.filter((g) => g.slug !== groupSlug),
    }));
  },
}));

