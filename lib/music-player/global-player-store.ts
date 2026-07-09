"use client";

import { create } from "zustand";

export type GlobalMusicTrack = {
  id: string;
  title: string;
  artist?: string;
  artworkUrl?: string;
  audioUrl: string;
  duration?: number | null;
};

type GlobalMusicPlayerState = {
  isVisible: boolean;
  isPlaying: boolean;
  track: GlobalMusicTrack | null;
  currentTime: number;
  duration: number;
  volume: number;
  show: () => void;
  hide: () => void;
  loadTrack: (track: GlobalMusicTrack) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  playTrack: (track: GlobalMusicTrack) => void;
  setCurrentTime: (currentTime: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  clear: () => void;
};

let registeredAudio: HTMLAudioElement | null = null;

function getTrackDuration(track: GlobalMusicTrack): number {
  return Number.isFinite(track.duration) && (track.duration ?? 0) > 0
    ? Number(track.duration)
    : 0;
}

function syncAudioTrack(track: GlobalMusicTrack): void {
  if (!registeredAudio) return;
  if (registeredAudio.getAttribute("src") !== track.audioUrl) {
    registeredAudio.src = track.audioUrl;
    registeredAudio.load();
  }
}

export function registerGlobalMusicAudio(
  audio: HTMLAudioElement | null,
): void {
  registeredAudio = audio;
}

export const useGlobalMusicPlayer = create<GlobalMusicPlayerState>((set, get) => ({
  isVisible: true,
  isPlaying: false,
  track: null,
  currentTime: 0,
  duration: 0,
  volume: 0.72,
  show: () => set({ isVisible: true }),
  hide: () => {
    registeredAudio?.pause();
    set({ isVisible: false, isPlaying: false });
  },
  loadTrack: (track) => {
    syncAudioTrack(track);
    set({
      track,
      isVisible: true,
      currentTime: 0,
      duration: getTrackDuration(track),
    });
  },
  play: () => {
    const track = get().track;
    if (!track) {
      set({ isPlaying: false, isVisible: true });
      return;
    }

    syncAudioTrack(track);
    set({
      isPlaying: true,
      isVisible: true,
    });
    registeredAudio?.play().catch(() => set({ isPlaying: false }));
  },
  pause: () => {
    registeredAudio?.pause();
    set({ isPlaying: false });
  },
  toggle: () => {
    const state = get();
    if (!state.track) {
      set({ isPlaying: false, isVisible: true });
      return;
    }

    if (state.isPlaying) {
      registeredAudio?.pause();
      set({ isPlaying: false, isVisible: true });
      return;
    }

    syncAudioTrack(state.track);
    set({ isPlaying: true, isVisible: true });
    registeredAudio?.play().catch(() => set({ isPlaying: false }));
  },
  playTrack: (track) => {
    syncAudioTrack(track);
    set({
      track,
      isVisible: true,
      isPlaying: true,
      currentTime: 0,
      duration: getTrackDuration(track),
    });
    registeredAudio?.play().catch(() => set({ isPlaying: false }));
  },
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => {
    if (registeredAudio) {
      registeredAudio.volume = volume;
    }
    set({ volume });
  },
  clear: () => {
    registeredAudio?.pause();
    registeredAudio?.removeAttribute("src");
    registeredAudio?.load();
    set({
      isVisible: true,
      isPlaying: false,
      track: null,
      currentTime: 0,
      duration: 0,
    });
  },
}));
