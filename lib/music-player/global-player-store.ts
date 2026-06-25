"use client";

import { create } from "zustand";

export type GlobalMusicTrack = {
  id: string;
  title: string;
  artist?: string;
  artworkUrl?: string;
};

type GlobalMusicPlayerState = {
  isVisible: boolean;
  isPlaying: boolean;
  track: GlobalMusicTrack | null;
  show: () => void;
  hide: () => void;
  loadTrack: (track: GlobalMusicTrack) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  playTrack: (track: GlobalMusicTrack) => void;
  clear: () => void;
};

export const useGlobalMusicPlayer = create<GlobalMusicPlayerState>((set) => ({
  isVisible: true,
  isPlaying: false,
  track: null,
  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false, isPlaying: false }),
  loadTrack: (track) => set({ track, isVisible: true }),
  play: () =>
    set((state) => ({
      isPlaying: Boolean(state.track),
      isVisible: true,
    })),
  pause: () => set({ isPlaying: false }),
  toggle: () =>
    set((state) => ({
      isPlaying: state.track ? !state.isPlaying : false,
      isVisible: true,
    })),
  playTrack: (track) => set({ track, isVisible: true, isPlaying: true }),
  clear: () => set({ isVisible: true, isPlaying: false, track: null }),
}));
