import { Composition } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import {
  MusicVideoComposition,
  type MusicVideoCompositionProps,
} from "./MusicVideoComposition";
import {
  PHOTO_SLIDESHOW_COMPOSITION_ID,
  PHOTO_SLIDESHOW_FPS,
  PHOTO_SLIDESHOW_HEIGHT,
  PHOTO_SLIDESHOW_WIDTH,
} from "../lib/music-video/remotion-constants";
import {
  getSpokenIntroAudioTiming,
  SPOKEN_INTRO_AUDIO_COMPOSITION_ID,
  SPOKEN_INTRO_AUDIO_FPS,
  type SpokenIntroAudioProps,
} from "../lib/music-video/spoken-intro-audio";
import { SpokenIntroAudioComposition } from "./SpokenIntroAudioComposition";
import {
  getSongAudioPreviewDurationInFrames,
  SONG_AUDIO_PREVIEW_COMPOSITION_ID,
  SONG_AUDIO_PREVIEW_FPS,
  SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
  type SongAudioPreviewProps,
} from "../lib/music-video/song-audio-preview";
import { SongAudioPreviewComposition } from "./SongAudioPreviewComposition";

export function RemotionRoot() {
  return (
    <>
      <Composition
        component={MusicVideoComposition}
        defaultProps={{
          timeline: {
            assignments: [],
            audioUrl: "",
            duration: 30,
            height: PHOTO_SLIDESHOW_HEIGHT,
            lyrics: [{ id: "cue-1", start: 0, end: 30, text: "Instrumental" }],
            photos: [],
            songTitle: "Music Video",
            templateId: "photo-slideshow",
            transitions: [],
            width: PHOTO_SLIDESHOW_WIDTH,
          },
        }}
        durationInFrames={PHOTO_SLIDESHOW_FPS * 30}
        fps={PHOTO_SLIDESHOW_FPS}
        height={PHOTO_SLIDESHOW_HEIGHT}
        id={PHOTO_SLIDESHOW_COMPOSITION_ID}
        width={PHOTO_SLIDESHOW_WIDTH}
        calculateMetadata={({
          props,
        }: {
          props: MusicVideoCompositionProps;
        }) => ({
          durationInFrames: Math.max(
            PHOTO_SLIDESHOW_FPS,
            Math.ceil((props.timeline.duration || 30) * PHOTO_SLIDESHOW_FPS),
          ),
          height: props.timeline.height || PHOTO_SLIDESHOW_HEIGHT,
          width: props.timeline.width || PHOTO_SLIDESHOW_WIDTH,
        })}
      />
      <Composition
        id={SPOKEN_INTRO_AUDIO_COMPOSITION_ID}
        component={SpokenIntroAudioComposition}
        durationInFrames={SPOKEN_INTRO_AUDIO_FPS * 30}
        fps={SPOKEN_INTRO_AUDIO_FPS}
        height={16}
        width={16}
        defaultProps={{
          introAudioUrl: "",
          introDurationSeconds: 3,
          songAudioUrl: "",
          songDurationSeconds: 30,
        }}
        calculateMetadata={async ({
          props,
        }: {
          props: SpokenIntroAudioProps;
        }) => {
          const songDurationSeconds =
            props.songDurationSeconds > 0
              ? props.songDurationSeconds
              : await getAudioDurationInSeconds(props.songAudioUrl);
          const resolvedProps = { ...props, songDurationSeconds };

          return {
            defaultCodec: "mp3",
            durationInFrames:
              getSpokenIntroAudioTiming(resolvedProps).durationInFrames,
            props: resolvedProps,
          };
        }}
      />
      <Composition
        id={SONG_AUDIO_PREVIEW_COMPOSITION_ID}
        component={SongAudioPreviewComposition}
        durationInFrames={
          SONG_AUDIO_PREVIEW_FPS * SONG_AUDIO_PREVIEW_LIMIT_SECONDS
        }
        fps={SONG_AUDIO_PREVIEW_FPS}
        height={16}
        width={16}
        defaultProps={{
          audioUrl: "",
          audioDurationSeconds: SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
          previewLimitSeconds: SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
        }}
        calculateMetadata={({ props }: { props: SongAudioPreviewProps }) => ({
          defaultCodec: "mp3",
          durationInFrames: getSongAudioPreviewDurationInFrames(props),
        })}
      />
    </>
  );
}
