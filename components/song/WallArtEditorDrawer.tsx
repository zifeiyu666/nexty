"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { wallArtFontFiles, wallArtFonts } from "@/lib/wall-art/fonts";
import {
  buildImageLyricMaskMetrics,
  buildImageLyricRows,
  buildInitialImageCrop,
  clampImageCrop,
  extendImageLyricRowToWidth,
  scaleImageLyricMaskInput,
  type ImageCropRotation,
  type ImageCropTransform,
  type ImageLyricMode,
} from "@/lib/wall-art/image-lyrics";
import {
  buildHeartShapePath,
  buildShapeTextLayout,
  buildSpiralPath,
  buildTemplate2LyricLines,
  buildWallArtPrintTransform,
  calculatePrintPixelSize,
  calculateSpiralInnerRadius,
  calculateSpiralTextCapacity,
  calculateSpiralTurns,
  calculateWallArtQrCodePlacement,
  cleanWallArtLyrics,
  createHeartIntervalProvider,
  fitSpiralLyrics,
  printSizePresets,
  splitTemplate2TitleLines,
  wallArtColorPresets,
  wallArtTemplate2ColorPresets,
} from "@/lib/wall-art/spiral";
import {
  Check,
  ChevronsUpDown,
  Disc3,
  Download,
  FlipHorizontal,
  FlipVertical,
  Image as ImageIcon,
  ImagePlus,
  Move,
  Palette,
  Plus,
  QrCode as QrCodeIcon,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Trash2,
  Type,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type EditableTextKey = "lyrics" | "title" | "subtitle" | "description";
type ActiveTarget =
  | EditableTextKey
  | "customText"
  | "poster"
  | "disc"
  | "image"
  | "frame"
  | "print"
  | "heart";
type WallArtTemplateKey = "spiral" | "template2" | "heart" | "imageLyrics";
type PresetPanelKey = "imageLyrics" | "template2" | "spiral";

type TextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
};

type CustomTextLayer = {
  id: string;
  text: string;
  style: TextStyle;
};

type WallArtTemplateSettings = {
  activePresetIndex: number;
  template2PresetIndex: number;
  imageLyricPresetIndex: number;
  posterBackground: string;
  discColor: string;
  printSizeId: string;
  customWidthCm: number;
  customHeightCm: number;
  printContentScale: number;
  printContentOffsetX: number;
  printContentOffsetY: number;
  qrCodeOffsetX: number;
  qrCodeOffsetY: number;
  qrCodeSize: number;
  frameColor: string;
  frameWidth: number;
  centerRadius: number;
  template2DiscRadius: number;
  textOuterRadius: number;
  showQrCode: boolean;
  useCover: boolean;
  uploadedImage: string;
  imageLyricMode: ImageLyricMode;
  imageLyricDensity: number;
  imageLyricContrast: number;
  imageLyricOpacity: number;
  imageLyricInvert: boolean;
  imageLyricUploadedImage: string;
  title: string;
  template2TitleLine1: string;
  template2TitleLine2: string;
  heartSize: number;
  subtitle: string;
  description: string;
  lyricText: string;
  styles: Record<EditableTextKey, TextStyle>;
  customTexts: CustomTextLayer[];
};

type WallArtEditorDrawerProps = {
  initialSong?: WallArtSongOption;
  songOptions?: WallArtSongOption[];
  trigger: ReactNode;
};

export type WallArtSongOption = {
  id: string;
  title: string;
  lyrics: string;
  imageUrl?: string | null;
  shareUrl?: string;
};

type ImageCropDraft = {
  source: string;
  imageWidth: number;
  imageHeight: number;
  printSizeId: string;
  customWidthCm: number;
  customHeightCm: number;
  crop: ImageCropTransform;
};

type ImageLyricRenderInput = {
  source: string;
  width: number;
  height: number;
  baseWidth: number;
  baseHeight: number;
  lyricText: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  density: number;
  contrast: number;
  opacity: number;
  invert: boolean;
  mode: ImageLyricMode;
};

type CustomTextDragState = {
  id: string;
  pointerX: number;
  pointerY: number;
  offsetX: number;
  offsetY: number;
};

const POSTER_CENTER = 500;
const BASE_POSTER_WIDTH = 1000;
const IMAGE_CROP_PREVIEW_WIDTH = 420;
const IMAGE_CROP_PREVIEW_MAX_HEIGHT = 520;
const IMAGE_LYRIC_MASK_TOP_PADDING = 0;
const IMAGE_LYRIC_MASK_BOTTOM_PADDING = 0;
const IMAGE_LYRIC_MASK_SIDE_PADDING = 0;
const IMAGE_LYRIC_MASK_MAX_CELLS = 24000;
const presetImages = Array.from({ length: 10 }, (_, index) => ({
  name: `Design ${index + 1}`,
  src: `/wallart/color_preset/color_preset${index + 1}.png`,
}));
const template2PresetImages = Array.from({ length: 15 }, (_, index) => ({
  name: `Design ${index + 1}`,
  src: `/wallart/color_preset/template2_preset/color_preset${index + 1}.png`,
}));
const lyricPortraitPresetImages = Array.from({ length: 4 }, (_, index) => ({
  name: `Design ${index + 1}`,
  src: `/wallart/color_preset/lytric_fill_template/color_preset${index + 1}.png`,
  originSrc: `/wallart/color_preset/lytric_fill_template/color_preset_origin${index + 1}.jpg`,
}));
const heartTemplatePreview = "/wallart/heart_lyrics.jpg";
const textTargets: EditableTextKey[] = [
  "lyrics",
  "title",
  "subtitle",
  "description",
];
const editTargets: Array<[ActiveTarget, string]> = [
  ["lyrics", "Lyrics"],
  ["title", "Title"],
  ["subtitle", "Subtitle"],
  ["description", "Message"],
  ["poster", "Poster"],
  ["disc", "Disc"],
  ["frame", "Frame"],
  ["print", "Print"],
];
const heartEditTargets: Array<[ActiveTarget, string]> = [
  ["title", "Title"],
  ["lyrics", "Lyrics"],
  ["poster", "Poster"],
  ["heart", "Heart"],
  ["frame", "Frame"],
  ["print", "Print"],
];
const imageLyricEditTargets: Array<[ActiveTarget, string]> = [
  ["image", "Image"],
  ["lyrics", "Lyrics"],
  ["title", "Title"],
  ["subtitle", "Subtitle"],
  ["description", "Message"],
  ["poster", "Poster"],
  ["frame", "Frame"],
  ["print", "Print"],
];
const heartTemplateShape = {
  centerX: 500,
  topY: 260,
  bottomY: 1300,
  width: 960,
};
const heartTitleFont = '"Shadows Into Light", cursive';
const presetHoverBridgeClassName =
  "fixed left-[176px] top-[110px] z-40 h-[calc(100svh-126px)] w-[28px] opacity-0";
const wallArtFontFaceCss = wallArtFontFiles
  .map(
    ([family, src, weight]) =>
      `@font-face{font-family:'${family}';src:url('${src}') format('truetype');font-style:normal;font-weight:${weight};font-display:swap;}`,
  )
  .join("");
const wallArtMotionCss = `@keyframes wallArtDownloadIconDrift{0%{transform:translateY(0) scale(1)}45%{transform:translateY(2px) scale(1.12)}100%{transform:translateY(0) scale(1)}}`;
const wallArtGlassPanelClassName =
  "rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,241,233,0.64))] shadow-[0_18px_48px_rgba(70,53,38,0.1),0_1px_0_rgba(255,255,255,0.4)_inset,0_0_0_1px_rgba(255,255,255,0.18)_inset] backdrop-blur-2xl";
const wallArtSubtleGlassPanelClassName =
  "rounded-[16px] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(250,246,240,0.54))] shadow-[0_12px_28px_rgba(72,56,41,0.08),0_1px_0_rgba(255,255,255,0.64)_inset,0_0_0_1px_rgba(255,255,255,0.14)_inset] backdrop-blur-xl";
const wallArtFieldClassName =
  "h-10 rounded-full bg-white/72 px-3.5 text-[13px] font-medium text-[#302720] shadow-[0_10px_22px_rgba(70,53,38,0.08),0_1px_0_rgba(255,255,255,0.76)_inset,0_0_0_1px_rgba(255,255,255,0.16)_inset] backdrop-blur-xl transition focus-visible:ring-[#c9bbac]/40";
const wallArtTextareaClassName =
  "rounded-[18px] bg-white/72 px-4 py-3 text-[13px] leading-6 text-[#302720] shadow-[0_12px_28px_rgba(70,53,38,0.08),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.16)_inset] backdrop-blur-xl transition focus-visible:ring-[#c9bbac]/40";
const wallArtPopoverClassName =
  "rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(246,240,232,0.8))] p-1 shadow-[0_22px_56px_rgba(56,41,29,0.16),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.16)_inset] backdrop-blur-2xl";
const wallArtPillButtonClassName =
  "rounded-full bg-white/72 text-[#3a312a] shadow-[0_10px_22px_rgba(70,53,38,0.08),0_1px_0_rgba(255,255,255,0.74)_inset,0_0_0_1px_rgba(255,255,255,0.16)_inset] backdrop-blur-xl transition hover:bg-white/90 hover:text-[#241b16]";
const wallArtPillButtonActiveClassName =
  "rounded-full border border-transparent bg-[#2d2622] text-[#f7f0e6] shadow-[0_14px_28px_rgba(45,38,34,0.24)] hover:bg-[#2d2622] hover:text-[#f7f0e6]";
const wallArtPrimaryButtonClassName =
  "rounded-full border border-[#3f342c]/10 bg-[#2f2823] px-5 text-[#faf4eb] shadow-[0_16px_30px_rgba(45,38,34,0.22)] transition hover:bg-[#26201d] hover:text-white";
const wallArtSecondaryButtonClassName =
  "rounded-full bg-white/78 text-[#2f2722] shadow-[0_10px_22px_rgba(70,53,38,0.08),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.16)_inset] backdrop-blur-xl transition hover:bg-white";
const wallArtEditorSectionClassName =
  "space-y-4 rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,243,237,0.56))] p-4 shadow-[0_16px_34px_rgba(70,53,38,0.08),0_1px_0_rgba(255,255,255,0.74)_inset,0_0_0_1px_rgba(255,255,255,0.14)_inset] backdrop-blur-xl";
const wallArtInfoCardClassName =
  "rounded-[16px] bg-[linear-gradient(180deg,rgba(255,255,255,0.64),rgba(248,243,237,0.44))] p-3.5 shadow-[0_12px_28px_rgba(70,53,38,0.06),0_1px_0_rgba(255,255,255,0.72)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-xl";
const wallArtTemplateCardBaseClassName =
  "w-full rounded-[16px] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,243,237,0.62))] p-1.5 text-left shadow-[0_14px_30px_rgba(70,53,38,0.08),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.14)_inset] transition duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_18px_34px_rgba(70,53,38,0.12)]";
const wallArtTemplateThumbClassName =
  "mx-auto aspect-[4/5] max-h-36 overflow-hidden rounded-[12px] bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_18px_rgba(63,47,33,0.08)]";
const wallArtTemplatePopoverClassName =
  "fixed left-[186px] top-[98px] z-[80] max-h-[calc(100svh-118px)] w-[220px] overflow-y-auto rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(246,240,232,0.76))] p-1.5 shadow-[0_22px_56px_rgba(56,41,29,0.2),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.16)_inset] backdrop-blur-2xl transition";
const wallArtTemplatePresetCardClassName =
  "overflow-hidden rounded-[12px] bg-white/74 shadow-[0_10px_22px_rgba(64,48,34,0.08),0_1px_0_rgba(255,255,255,0.76)_inset,0_0_0_1px_rgba(255,255,255,0.14)_inset] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_28px_rgba(64,48,34,0.12)]";
const wallArtTemplateActiveBadgeClassName =
  "rounded-full border-none bg-[#2d2622] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-[#f7f0e6] shadow-[0_8px_16px_rgba(45,38,34,0.18)]";
const wallArtSectionHeadingClassName =
  "text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f7f72]";
const wallArtMicroButtonClassName =
  "rounded-full bg-white/78 text-[#322821] shadow-[0_8px_18px_rgba(70,53,38,0.08),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.16)_inset] backdrop-blur-xl transition hover:bg-white";
const wallArtFloatingActionClassName =
  "group absolute right-2.5 top-2.5 z-20 h-9 rounded-[14px] bg-[linear-gradient(180deg,rgba(43,34,29,0.76),rgba(31,24,21,0.92))] px-3.5 text-[11px] font-black text-[#fff8f0] shadow-[0_18px_40px_rgba(29,22,19,0.24),0_1px_0_rgba(255,255,255,0.18)_inset] backdrop-blur-2xl transition hover:scale-[1.02] hover:bg-[linear-gradient(180deg,rgba(49,39,33,0.8),rgba(34,27,23,0.96))] hover:text-white sm:right-3 sm:top-3 sm:h-10 sm:px-4 sm:text-[12px]";

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getWallArtTemplateCardClassName(active: boolean) {
  return cn(
    wallArtTemplateCardBaseClassName,
    active
      ? "border-transparent bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,238,229,0.82))] shadow-[0_26px_56px_rgba(70,53,38,0.16),inset_0_1px_0_rgba(255,255,255,0.82)]"
      : "text-[#312821]",
  );
}

function getWallArtTemplatePresetCardClassName(active: boolean) {
  return cn(
    wallArtTemplatePresetCardClassName,
    active
      ? "border-transparent bg-white shadow-[0_18px_38px_rgba(64,48,34,0.14),inset_0_1px_0_rgba(255,255,255,0.8)] ring-2 ring-[#2d2622]/10"
      : "",
  );
}

function loadHtmlImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image."));
    image.src = source;
  });
}

async function renderImageLyricMask({
  source,
  width,
  height,
  baseWidth,
  baseHeight,
  lyricText,
  fontFamily,
  fontSize,
  fontWeight,
  density,
  contrast,
  opacity,
  invert,
  mode,
}: ImageLyricRenderInput): Promise<string> {
  const image = await loadHtmlImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  if (mode === "grayscale" || contrast !== 1 || invert) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < imageData.data.length; index += 4) {
      const red = imageData.data[index] ?? 0;
      const green = imageData.data[index + 1] ?? 0;
      const blue = imageData.data[index + 2] ?? 0;
      const gray = Math.round(red * 0.2126 + green * 0.7152 + blue * 0.0722);
      const sourceRed = mode === "grayscale" ? gray : red;
      const sourceGreen = mode === "grayscale" ? gray : green;
      const sourceBlue = mode === "grayscale" ? gray : blue;
      const adjust = (value: number) => {
        const contrasted = (value - 128) * Math.max(0.1, contrast) + 128;
        const next = invert ? 255 - contrasted : contrasted;

        return Math.max(0, Math.min(255, Math.round(next)));
      };
      imageData.data[index] = adjust(sourceRed);
      imageData.data[index + 1] = adjust(sourceGreen);
      imageData.data[index + 2] = adjust(sourceBlue);
    }
    context.putImageData(imageData, 0, 0);
  }

  const scaledMaskInput = scaleImageLyricMaskInput({
    baseWidth,
    baseHeight,
    targetWidth: width,
    targetHeight: height,
    fontSize,
    topPadding: IMAGE_LYRIC_MASK_TOP_PADDING,
    bottomPadding: IMAGE_LYRIC_MASK_BOTTOM_PADDING,
    sidePadding: IMAGE_LYRIC_MASK_SIDE_PADDING,
    maxCells: IMAGE_LYRIC_MASK_MAX_CELLS,
  });
  const metrics = buildImageLyricMaskMetrics({
    ...scaledMaskInput,
    density,
  });
  const rows = buildImageLyricRows(lyricText, {
    columns: metrics.columnCount,
    rows: metrics.rowCount,
  });
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskContext = maskCanvas.getContext("2d");
  if (!maskContext) throw new Error("Canvas is not available.");

  maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  maskContext.fillStyle = `rgba(0,0,0,${Math.max(0.05, Math.min(1, opacity))})`;
  maskContext.font = `${fontWeight} ${scaledMaskInput.fontSize}px ${fontFamily}`;
  maskContext.textBaseline = "alphabetic";

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? "";
    const extendedRow = extendImageLyricRowToWidth({
      row,
      sourceText: lyricText,
      targetWidth: metrics.contentWidth,
      measureText: (value) => maskContext.measureText(value).width,
    });
    maskContext.fillText(
      extendedRow.text,
      metrics.sidePadding,
      metrics.topPadding + (rowIndex + 1) * metrics.lineHeight,
    );
  }

  context.globalCompositeOperation = "destination-in";
  context.drawImage(maskCanvas, 0, 0);
  context.globalCompositeOperation = "source-over";

  return canvas.toDataURL("image/png");
}

function createWallArtTemplateSettings(
  template: WallArtTemplateKey,
  songTitle: string,
  lyrics: string,
): WallArtTemplateSettings {
  const template2Preset = wallArtTemplate2ColorPresets[0];
  const spiralPreset = wallArtColorPresets[0];
  const preset =
    template === "spiral"
      ? {
          posterBackground: spiralPreset?.posterBackground ?? "#f3ead3",
          discColor: spiralPreset?.discColor ?? "#050505",
          lyricColor: spiralPreset?.lyricColor ?? "#1d1d1d",
          titleColor: spiralPreset?.titleColor ?? "#1d1d1d",
        }
      : {
          posterBackground: template2Preset?.posterBackground ?? "#c5d1d8",
          discColor: template2Preset?.discColor ?? "#050505",
          lyricColor: template2Preset?.lyricColor ?? "#ffffff",
          titleColor: template2Preset?.titleColor ?? "#ffffff",
        };
  const [titleLine1, titleLine2] = splitTemplate2TitleLines(
    songTitle || "Song Name",
  );
  const isHeart = template === "heart";

  return {
    activePresetIndex: 0,
    template2PresetIndex: 0,
    imageLyricPresetIndex: 0,
    posterBackground: isHeart ? "#ffffff" : preset.posterBackground,
    discColor: preset.discColor,
    printSizeId: "a4",
    customWidthCm: 21,
    customHeightCm: 29.7,
    printContentScale: 1,
    printContentOffsetX: 0,
    printContentOffsetY: 0,
    qrCodeOffsetX: 0,
    qrCodeOffsetY: 0,
    qrCodeSize: 112,
    frameColor: "#6f4b2f",
    frameWidth: 34,
    centerRadius: 168,
    template2DiscRadius: 390,
    textOuterRadius: 470,
    showQrCode: true,
    useCover: false,
    uploadedImage: "",
    imageLyricMode: "color",
    imageLyricDensity: 1.38,
    imageLyricContrast: 1.45,
    imageLyricOpacity: 0.96,
    imageLyricInvert: false,
    imageLyricUploadedImage:
      template === "imageLyrics"
        ? (lyricPortraitPresetImages[0]?.originSrc ?? "")
        : "",
    title: songTitle || "Song Name",
    template2TitleLine1: titleLine1,
    template2TitleLine2: titleLine2,
    heartSize: 1,
    subtitle: "Artist Name",
    description: "Album Name (2026)",
    lyricText: cleanWallArtLyrics(lyrics),
    styles: {
      lyrics: {
        fontFamily: "Georgia, serif",
        fontSize: isHeart ? 30 : template === "imageLyrics" ? 12 : 18,
        fontWeight: isHeart ? "400" : "400",
        color: isHeart ? "#111111" : preset.lyricColor,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        rotation: 0,
      },
      title: {
        fontFamily: isHeart ? heartTitleFont : "Impact, fantasy",
        fontSize: isHeart ? 60 : 48,
        fontWeight: isHeart ? "400" : "900",
        color: isHeart ? "#111111" : preset.titleColor,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        rotation: 0,
      },
      subtitle: {
        fontFamily: "Montserrat, ui-sans-serif, system-ui",
        fontSize: 28,
        fontWeight: "900",
        color: preset.titleColor,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        rotation: 0,
      },
      description: {
        fontFamily: "Montserrat, ui-sans-serif, system-ui",
        fontSize: 16,
        fontWeight: "400",
        color: preset.titleColor,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        rotation: 0,
      },
    },
    customTexts: [],
  };
}

function createWallArtTemplateSettingsMap(songTitle: string, lyrics: string) {
  return {
    spiral: createWallArtTemplateSettings("spiral", songTitle, lyrics),
    template2: createWallArtTemplateSettings("template2", songTitle, lyrics),
    heart: createWallArtTemplateSettings("heart", songTitle, lyrics),
    imageLyrics: createWallArtTemplateSettings(
      "imageLyrics",
      songTitle,
      lyrics,
    ),
  } satisfies Record<WallArtTemplateKey, WallArtTemplateSettings>;
}

function isEditableTextKey(value: ActiveTarget): value is EditableTextKey {
  return textTargets.includes(value as EditableTextKey);
}

function getNextImageCropRotation(
  rotate: ImageCropRotation,
  direction: 1 | -1,
): ImageCropRotation {
  const rotations: ImageCropRotation[] = [0, 90, 180, 270];
  const currentIndex = rotations.indexOf(rotate);
  const nextIndex = (currentIndex + direction + rotations.length) % rotations.length;

  return rotations[nextIndex] ?? 0;
}

function getImageCropPreviewTransform({
  rotate,
  flipX,
  flipY,
}: Pick<ImageCropTransform, "rotate" | "flipX" | "flipY">): string {
  return `translate(-50%, -50%) rotate(${rotate}deg) scale(${flipX ? -1 : 1}, ${
    flipY ? -1 : 1
  })`;
}

function ControlRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2 rounded-[18px] bg-white/40 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_18px_rgba(70,53,38,0.05)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f7f72]">
          {label}
        </Label>
        <span className="rounded-full bg-white/72 px-2.5 py-0.5 text-[10px] font-bold text-[#5d5045] shadow-[inset_0_1px_0_rgba(255,255,255,0.74)]">
          {value}
        </span>
      </div>
      <Slider
        className="[&_[data-slot=slider-range]]:bg-[#362e28] [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-white/80 [&_[data-slot=slider-thumb]]:bg-[#fff8f1] [&_[data-slot=slider-thumb]]:shadow-[0_8px_16px_rgba(53,40,30,0.2)] [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-white/65"
        max={max}
        min={min}
        step={step}
        value={[value]}
        onValueChange={(next) => onChange(next[0] ?? value)}
      />
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f7f72]">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          aria-label={label}
          className="h-10 w-11 shrink-0 cursor-pointer rounded-[16px] border-white/45 bg-white/76 p-1 shadow-[0_8px_18px_rgba(70,53,38,0.08),inset_0_1px_0_rgba(255,255,255,0.74)]"
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          className={wallArtFieldClassName}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function FontSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedFont =
    wallArtFonts.find((font) => font.value === value) ?? wallArtFonts[0];

  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f7f72]">
        Font
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              wallArtFieldClassName,
              "w-full justify-between px-3.5 font-normal",
            )}
            role="combobox"
            variant="outline"
          >
            <span
              className="truncate text-left text-[14px]"
              style={{ fontFamily: selectedFont?.previewFamily }}
            >
              {selectedFont?.label ?? "Select font"}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(
            wallArtPopoverClassName,
            "flex max-h-[min(20rem,var(--radix-popover-content-available-height))] w-[--radix-popover-trigger-width] flex-col p-1 [&_[data-slot=command-group]]:p-1 [&_[data-slot=command-input-wrapper]]:h-10 [&_[data-slot=command-input-wrapper]]:rounded-[14px] [&_[data-slot=command-input-wrapper]]:border-none [&_[data-slot=command-input-wrapper]]:bg-white/72 [&_[data-slot=command-input-wrapper]]:px-3 [&_[data-slot=command-input]]:h-9 [&_[data-slot=command-item]]:rounded-[14px] [&_[data-slot=command-item]]:px-3 [&_[data-slot=command-item][data-selected=true]]:bg-[#2d2622] [&_[data-slot=command-item][data-selected=true]]:text-[#f7f0e6]",
          )}
        >
          <Command className="min-h-0 rounded-[18px] bg-transparent">
            <CommandInput placeholder="Search fonts..." />
            <CommandList className="min-h-0 flex-1 overscroll-contain">
              <CommandEmpty>No font found.</CommandEmpty>
              <CommandGroup>
                {wallArtFonts.map((font) => (
                  <CommandItem
                    key={font.value}
                    value={font.label}
                    onSelect={() => {
                      onChange(font.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        font.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span
                      className="truncate text-[15px] leading-7"
                      style={{ fontFamily: font.previewFamily }}
                    >
                      {font.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function FontWeightSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f7f72]">
        Font weight
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(wallArtFieldClassName, "w-full")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          className={cn(
            wallArtPopoverClassName,
            "[&_[data-slot=select-item]]:rounded-[16px] [&_[data-slot=select-item][data-state=checked]]:bg-[#2d2622] [&_[data-slot=select-item][data-state=checked]]:text-[#f7f0e6]",
          )}
        >
          {[
            ["300", "Light"],
            ["400", "Regular"],
            ["500", "Medium"],
            ["600", "Semi Bold"],
            ["700", "Bold"],
            ["900", "Black"],
          ].map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function WallArtEditorDrawer({
  initialSong,
  songOptions,
  trigger,
}: WallArtEditorDrawerProps) {
  const spiralId = useId().replace(/:/g, "");
  const template2Id = useId().replace(/:/g, "");
  const imageLyricUploadInputId = `${template2Id}-image-lyric-upload`;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const presetPanelCloseTimeoutRef = useRef<number | null>(null);
  const selectableSongs = useMemo(() => {
    const seen = new Set<string>();
    const options = [initialSong, ...(songOptions ?? [])].filter(
      (song): song is WallArtSongOption => Boolean(song),
    );

    return options.filter((song) => {
      if (seen.has(song.id)) return false;
      seen.add(song.id);
      return true;
    });
  }, [initialSong, songOptions]);
  const fallbackSong = selectableSongs[0] ?? null;
  const fallbackSongId = fallbackSong?.id ?? "";
  const [selectedSongId, setSelectedSongId] = useState(fallbackSongId);
  const selectedSong =
    selectableSongs.find((song) => song.id === selectedSongId) ??
    fallbackSong;
  const hasSongs = selectableSongs.length > 0;
  const activeSongTitle = selectedSong?.title ?? "";
  const activeLyrics = selectedSong?.lyrics ?? "";
  const activeImageUrl = selectedSong?.imageUrl ?? null;
  const activeShareUrl = selectedSong?.shareUrl;
  const initialTemplateSettings = useMemo(
    () => createWallArtTemplateSettingsMap(activeSongTitle, activeLyrics),
    [activeLyrics, activeSongTitle],
  );
  const [activeTarget, setActiveTarget] = useState<ActiveTarget>("lyrics");
  const [activeTemplate, setActiveTemplate] =
    useState<WallArtTemplateKey>("template2");
  const [openPresetPanel, setOpenPresetPanel] =
    useState<PresetPanelKey | null>(null);
  const [templateSettings, setTemplateSettings] = useState<
    Record<WallArtTemplateKey, WallArtTemplateSettings>
  >(() => initialTemplateSettings);
  const initialCurrentSettings = initialTemplateSettings.template2;
  const [activePresetIndex, setActivePresetIndex] = useState(
    initialCurrentSettings.activePresetIndex,
  );
  const [template2PresetIndex, setTemplate2PresetIndex] = useState(
    initialCurrentSettings.template2PresetIndex,
  );
  const [imageLyricPresetIndex, setImageLyricPresetIndex] = useState(
    initialCurrentSettings.imageLyricPresetIndex,
  );
  const [posterBackground, setPosterBackground] = useState(
    initialCurrentSettings.posterBackground,
  );
  const [discColor, setDiscColor] = useState(initialCurrentSettings.discColor);
  const [printSizeId, setPrintSizeId] = useState(
    initialCurrentSettings.printSizeId,
  );
  const [customWidthCm, setCustomWidthCm] = useState(
    initialCurrentSettings.customWidthCm,
  );
  const [customHeightCm, setCustomHeightCm] = useState(
    initialCurrentSettings.customHeightCm,
  );
  const [printContentScale, setPrintContentScale] = useState(
    initialCurrentSettings.printContentScale,
  );
  const [printContentOffsetX, setPrintContentOffsetX] = useState(
    initialCurrentSettings.printContentOffsetX,
  );
  const [printContentOffsetY, setPrintContentOffsetY] = useState(
    initialCurrentSettings.printContentOffsetY,
  );
  const [qrCodeOffsetX, setQrCodeOffsetX] = useState(
    initialCurrentSettings.qrCodeOffsetX,
  );
  const [qrCodeOffsetY, setQrCodeOffsetY] = useState(
    initialCurrentSettings.qrCodeOffsetY,
  );
  const [qrCodeSize, setQrCodeSize] = useState(
    initialCurrentSettings.qrCodeSize,
  );
  const [frameColor, setFrameColor] = useState(
    initialCurrentSettings.frameColor,
  );
  const [frameWidth, setFrameWidth] = useState(
    initialCurrentSettings.frameWidth,
  );
  const [centerRadius, setCenterRadius] = useState(
    initialCurrentSettings.centerRadius,
  );
  const [template2DiscRadius, setTemplate2DiscRadius] = useState(
    initialCurrentSettings.template2DiscRadius,
  );
  const [textOuterRadius, setTextOuterRadius] = useState(
    initialCurrentSettings.textOuterRadius,
  );
  const [showQrCode, setShowQrCode] = useState(
    initialCurrentSettings.showQrCode,
  );
  const [useCover, setUseCover] = useState(initialCurrentSettings.useCover);
  const [uploadedImage, setUploadedImage] = useState(
    initialCurrentSettings.uploadedImage,
  );
  const [imageLyricMode, setImageLyricMode] = useState<ImageLyricMode>(
    initialCurrentSettings.imageLyricMode,
  );
  const [imageLyricDensity, setImageLyricDensity] = useState(
    initialCurrentSettings.imageLyricDensity,
  );
  const [imageLyricContrast, setImageLyricContrast] = useState(
    initialCurrentSettings.imageLyricContrast,
  );
  const [imageLyricOpacity, setImageLyricOpacity] = useState(
    initialCurrentSettings.imageLyricOpacity,
  );
  const [imageLyricInvert, setImageLyricInvert] = useState(
    initialCurrentSettings.imageLyricInvert,
  );
  const [imageLyricUploadedImage, setImageLyricUploadedImage] = useState(
    initialCurrentSettings.imageLyricUploadedImage,
  );
  const [maskedLyricImage, setMaskedLyricImage] = useState("");
  const [imageCropDraft, setImageCropDraft] = useState<ImageCropDraft | null>(
    null,
  );
  const [imageCropDragStart, setImageCropDragStart] = useState<{
    pointerX: number;
    pointerY: number;
    cropX: number;
    cropY: number;
  } | null>(null);
  const [title, setTitle] = useState(initialCurrentSettings.title);
  const [template2TitleLine1, setTemplate2TitleLine1] = useState(
    initialCurrentSettings.template2TitleLine1,
  );
  const [template2TitleLine2, setTemplate2TitleLine2] = useState(
    initialCurrentSettings.template2TitleLine2,
  );
  const [heartSize, setHeartSize] = useState(initialCurrentSettings.heartSize);
  const [subtitle, setSubtitle] = useState(initialCurrentSettings.subtitle);
  const [description, setDescription] = useState(
    initialCurrentSettings.description,
  );
  const [lyricText, setLyricText] = useState(initialCurrentSettings.lyricText);
  const [styles, setStyles] = useState<Record<EditableTextKey, TextStyle>>(
    initialCurrentSettings.styles,
  );
  const [customTexts, setCustomTexts] = useState<CustomTextLayer[]>(
    initialCurrentSettings.customTexts,
  );
  const [activeCustomTextId, setActiveCustomTextId] = useState<string | null>(
    null,
  );
  const [customTextDragStart, setCustomTextDragStart] =
    useState<CustomTextDragState | null>(null);
  useEffect(() => {
    if (selectableSongs.some((song) => song.id === selectedSongId)) return;
    setSelectedSongId(fallbackSongId);
  }, [fallbackSongId, selectableSongs, selectedSongId]);

  const selectedPrintSize =
    printSizePresets.find((item) => item.id === printSizeId) ??
    printSizePresets[0];
  const posterWidthCm =
    printSizeId === "custom"
      ? customWidthCm
      : (selectedPrintSize?.widthCm ?? 21);
  const posterHeightCm =
    printSizeId === "custom"
      ? customHeightCm
      : (selectedPrintSize?.heightCm ?? 29.7);
  const posterAspectRatio = posterWidthCm / posterHeightCm;
  const posterViewBoxHeight = Math.round(BASE_POSTER_WIDTH / posterAspectRatio);
  const imageCropSelectedPrintSize =
    imageCropDraft?.printSizeId === "custom"
      ? null
      : printSizePresets.find((item) => item.id === imageCropDraft?.printSizeId);
  const imageCropWidthCm =
    imageCropDraft?.printSizeId === "custom"
      ? (imageCropDraft?.customWidthCm ?? posterWidthCm)
      : (imageCropSelectedPrintSize?.widthCm ?? posterWidthCm);
  const imageCropHeightCm =
    imageCropDraft?.printSizeId === "custom"
      ? (imageCropDraft?.customHeightCm ?? posterHeightCm)
      : (imageCropSelectedPrintSize?.heightCm ?? posterHeightCm);
  const imageCropPreviewHeight = imageCropDraft
    ? Math.round(IMAGE_CROP_PREVIEW_WIDTH / (imageCropWidthCm / imageCropHeightCm))
    : 0;
  const imageCropPreviewDisplayHeight = imageCropPreviewHeight
    ? Math.min(imageCropPreviewHeight, IMAGE_CROP_PREVIEW_MAX_HEIGHT)
    : 0;
  const imageCropPreviewDisplayWidth =
    imageCropPreviewHeight && imageCropPreviewDisplayHeight
      ? Math.round(
          IMAGE_CROP_PREVIEW_WIDTH *
            (imageCropPreviewDisplayHeight / imageCropPreviewHeight),
        )
      : IMAGE_CROP_PREVIEW_WIDTH;
  const imageCropPreviewDisplayScale =
    imageCropPreviewDisplayWidth / IMAGE_CROP_PREVIEW_WIDTH;
  const imageCropMinScale = imageCropDraft
    ? imageCropDraft.crop.scale *
      Math.max(
        IMAGE_CROP_PREVIEW_WIDTH / imageCropDraft.crop.renderedWidth,
        (imageCropPreviewHeight || IMAGE_CROP_PREVIEW_WIDTH) /
          imageCropDraft.crop.renderedHeight,
      )
    : 0;
  const printContentTransform = buildWallArtPrintTransform({
    baseWidth: BASE_POSTER_WIDTH,
    baseHeight: posterViewBoxHeight,
    contentScale: printContentScale,
    offsetX: printContentOffsetX,
    offsetY: printContentOffsetY,
  });
  const titleY = posterViewBoxHeight * 0.844;
  const subtitleY = posterViewBoxHeight * 0.899;
  const descriptionY = posterViewBoxHeight * 0.932;

  const lyricInnerRadius = useMemo(
    () =>
      calculateSpiralInnerRadius({
        centerRadius,
        lyricFontSize: styles.lyrics.fontSize,
      }),
    [centerRadius, styles.lyrics.fontSize],
  );
  const safeTextOuterRadius = Math.max(
    lyricInnerRadius + styles.lyrics.fontSize * 3.2,
    textOuterRadius,
  );
  const spiralTurns = useMemo(
    () =>
      calculateSpiralTurns({
        innerRadius: lyricInnerRadius,
        outerRadius: safeTextOuterRadius,
        fontSize: styles.lyrics.fontSize,
      }),
    [lyricInnerRadius, safeTextOuterRadius, styles.lyrics.fontSize],
  );
  const spiralPath = useMemo(
    () =>
      buildSpiralPath({
        center: POSTER_CENTER,
        innerRadius: lyricInnerRadius,
        outerRadius: safeTextOuterRadius,
        turns: spiralTurns,
        pointsPerTurn: 42,
        direction: "outward",
      }),
    [lyricInnerRadius, safeTextOuterRadius, spiralTurns],
  );
  const lyricCapacity = useMemo(
    () =>
      calculateSpiralTextCapacity({
        innerRadius: lyricInnerRadius,
        outerRadius: safeTextOuterRadius,
        turns: spiralTurns,
        fontSize: styles.lyrics.fontSize,
      }),
    [
      lyricInnerRadius,
      safeTextOuterRadius,
      spiralTurns,
      styles.lyrics.fontSize,
    ],
  );
  const displayLyrics = useMemo(
    () => fitSpiralLyrics(lyricText, lyricCapacity),
    [lyricText, lyricCapacity],
  );
  const template2LyricsLines = useMemo(
    () =>
      buildTemplate2LyricLines(lyricText, {
        targetWidth: template2DiscRadius * 1.86,
        fontSize: styles.lyrics.fontSize,
        minLines: 15,
      }),
    [lyricText, styles.lyrics.fontSize, template2DiscRadius],
  );
  const template2LyricLineHeight = Math.round(styles.lyrics.fontSize * 1.25);
  const heartLyricsFontSize = Math.max(20, Math.round(styles.lyrics.fontSize));
  const heartIntervalProvider = useMemo(
    () =>
      createHeartIntervalProvider({
        ...heartTemplateShape,
        heartSize,
      }),
    [heartSize],
  );
  const heartShapePath = useMemo(
    () =>
      buildHeartShapePath({
        ...heartTemplateShape,
        heartSize,
      }),
    [heartSize],
  );
  const heartLyricsLayout = useMemo(
    () =>
      buildShapeTextLayout({
        text: lyricText,
        startY: 230,
        endY: 1130,
        fontSize: heartLyricsFontSize,
        lineHeightRatio: 1.04,
        intervalProvider: heartIntervalProvider,
        textAnchor: "middle",
      }),
    [heartIntervalProvider, heartLyricsFontSize, lyricText],
  );
  const heartTitleLines = useMemo(
    () => splitTemplate2TitleLines(title),
    [title],
  );
  const centerImage = uploadedImage || activeImageUrl || "";
  const imageLyricSourceImage = imageLyricUploadedImage;
  const activeTextTarget = isEditableTextKey(activeTarget)
    ? activeTarget
    : "lyrics";
  const activeCustomText = customTexts.find(
    (item) => item.id === activeCustomTextId,
  );
  const activeStyle =
    activeTarget === "customText" && activeCustomText
      ? activeCustomText.style
      : styles[activeTextTarget];
  const titleFontSize =
    styles.title.fontSize *
    styles.title.scale *
    (activeTemplate === "spiral" ? 1 : 1.45);
  const subtitleFontSize =
    styles.subtitle.fontSize *
    styles.subtitle.scale *
    (activeTemplate === "spiral" ? 1 : 0.95);
  const descriptionFontSize =
    styles.description.fontSize *
    styles.description.scale *
    (activeTemplate === "spiral" ? 1 : 1.05);
  const template2DiscCenterY = 485;
  const heartTitleFontSize = titleFontSize * 1.05;
  const heartTitleLineHeight = heartTitleFontSize * 1.36;
  const heartTitleStartY = heartTitleLines[1] ? 110 : 140;
  const qrCodePlacement = calculateWallArtQrCodePlacement({
    baseWidth: BASE_POSTER_WIDTH,
    baseHeight: posterViewBoxHeight,
    frameWidth,
    qrCodeSize,
  });
  const safeQrCodeOffsetX = clampNumber(
    qrCodeOffsetX,
    qrCodePlacement.minOffsetX,
    qrCodePlacement.maxOffsetX,
  );
  const safeQrCodeOffsetY = clampNumber(
    qrCodeOffsetY,
    qrCodePlacement.minOffsetY,
    qrCodePlacement.maxOffsetY,
  );
  const qrCodeX = qrCodePlacement.defaultX + safeQrCodeOffsetX;
  const qrCodeY = qrCodePlacement.defaultY + safeQrCodeOffsetY;
  const qrCodeInnerPadding = Math.max(7, Math.round(qrCodeSize * 0.08));
  const qrCodeInnerSize = qrCodeSize - qrCodeInnerPadding * 2;

  useEffect(() => {
    return () => {
      if (presetPanelCloseTimeoutRef.current) {
        window.clearTimeout(presetPanelCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!imageLyricSourceImage) {
      setMaskedLyricImage("");
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        await document.fonts.ready;
        if (cancelled) return;

        const dataUrl = await renderImageLyricMask({
          source: imageLyricSourceImage,
          width: BASE_POSTER_WIDTH,
          height: posterViewBoxHeight,
          baseWidth: BASE_POSTER_WIDTH,
          baseHeight: posterViewBoxHeight,
          lyricText,
          fontFamily: styles.lyrics.fontFamily,
          fontSize: styles.lyrics.fontSize,
          fontWeight: styles.lyrics.fontWeight,
          density: imageLyricDensity,
          contrast: imageLyricContrast,
          opacity: imageLyricOpacity,
          invert: imageLyricInvert,
          mode: imageLyricMode,
        });
        if (!cancelled) setMaskedLyricImage(dataUrl);
      } catch {
        if (!cancelled) setMaskedLyricImage("");
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    imageLyricDensity,
    imageLyricContrast,
    imageLyricInvert,
    imageLyricMode,
    imageLyricOpacity,
    imageLyricSourceImage,
    lyricText,
    posterViewBoxHeight,
    styles.lyrics.fontFamily,
    styles.lyrics.fontSize,
    styles.lyrics.fontWeight,
  ]);

  function captureCurrentTemplateSettings(): WallArtTemplateSettings {
    return {
      activePresetIndex,
      template2PresetIndex,
      imageLyricPresetIndex,
      posterBackground,
      discColor,
      printSizeId,
      customWidthCm,
      customHeightCm,
      printContentScale,
      printContentOffsetX,
      printContentOffsetY,
      qrCodeOffsetX,
      qrCodeOffsetY,
      qrCodeSize,
      frameColor,
      frameWidth,
      centerRadius,
      template2DiscRadius,
      textOuterRadius,
      showQrCode,
      useCover,
      uploadedImage,
      imageLyricMode,
      imageLyricDensity,
      imageLyricContrast,
      imageLyricOpacity,
      imageLyricInvert,
      imageLyricUploadedImage,
      title,
      template2TitleLine1,
      template2TitleLine2,
      heartSize,
      subtitle,
      description,
      lyricText,
      styles,
      customTexts,
    };
  }

  function applyTemplateSettings(settings: WallArtTemplateSettings) {
    setActivePresetIndex(settings.activePresetIndex);
    setTemplate2PresetIndex(settings.template2PresetIndex);
    setImageLyricPresetIndex(settings.imageLyricPresetIndex);
    setPosterBackground(settings.posterBackground);
    setDiscColor(settings.discColor);
    setPrintSizeId(settings.printSizeId);
    setCustomWidthCm(settings.customWidthCm);
    setCustomHeightCm(settings.customHeightCm);
    setPrintContentScale(settings.printContentScale);
    setPrintContentOffsetX(settings.printContentOffsetX);
    setPrintContentOffsetY(settings.printContentOffsetY);
    setQrCodeOffsetX(settings.qrCodeOffsetX);
    setQrCodeOffsetY(settings.qrCodeOffsetY);
    setQrCodeSize(settings.qrCodeSize);
    setFrameColor(settings.frameColor);
    setFrameWidth(settings.frameWidth);
    setCenterRadius(settings.centerRadius);
    setTemplate2DiscRadius(settings.template2DiscRadius);
    setTextOuterRadius(settings.textOuterRadius);
    setShowQrCode(settings.showQrCode);
    setUseCover(settings.useCover);
    setUploadedImage(settings.uploadedImage);
    setImageLyricMode(settings.imageLyricMode);
    setImageLyricDensity(settings.imageLyricDensity);
    setImageLyricContrast(settings.imageLyricContrast);
    setImageLyricOpacity(settings.imageLyricOpacity);
    setImageLyricInvert(settings.imageLyricInvert);
    setImageLyricUploadedImage(settings.imageLyricUploadedImage);
    setTitle(settings.title);
    setTemplate2TitleLine1(settings.template2TitleLine1);
    setTemplate2TitleLine2(settings.template2TitleLine2);
    setHeartSize(settings.heartSize);
    setSubtitle(settings.subtitle);
    setDescription(settings.description);
    setLyricText(settings.lyricText);
    setStyles(settings.styles);
    setCustomTexts(settings.customTexts);
    setActiveCustomTextId(settings.customTexts[0]?.id ?? null);
  }

  function handleSongSelection(nextSongId: string) {
    const nextSong = selectableSongs.find((song) => song.id === nextSongId);
    if (!nextSong) return;

    const nextTemplateSettings = createWallArtTemplateSettingsMap(
      nextSong.title,
      nextSong.lyrics,
    );

    setSelectedSongId(nextSong.id);
    setTemplateSettings(nextTemplateSettings);
    applyTemplateSettings(nextTemplateSettings[activeTemplate]);
    setImageCropDraft(null);
    setMaskedLyricImage("");
  }

  function keepPresetPanelOpen(panel: PresetPanelKey) {
    if (presetPanelCloseTimeoutRef.current) {
      window.clearTimeout(presetPanelCloseTimeoutRef.current);
      presetPanelCloseTimeoutRef.current = null;
    }
    setOpenPresetPanel(panel);
  }

  function schedulePresetPanelClose() {
    if (presetPanelCloseTimeoutRef.current) {
      window.clearTimeout(presetPanelCloseTimeoutRef.current);
    }
    presetPanelCloseTimeoutRef.current = window.setTimeout(() => {
      setOpenPresetPanel(null);
      presetPanelCloseTimeoutRef.current = null;
    }, 180);
  }

  function updateStyle(key: EditableTextKey, patch: Partial<TextStyle>) {
    setStyles((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  }

  function createDefaultCustomTextStyle(index: number): TextStyle {
    return {
      ...styles.title,
      fontSize: Math.max(18, Math.round(styles.title.fontSize * 0.72)),
      offsetX: Math.round(BASE_POSTER_WIDTH / 2),
      offsetY: Math.round(posterViewBoxHeight * 0.42 + index * 42),
      scale: 1,
      rotation: 0,
    };
  }

  function addCustomText() {
    const next: CustomTextLayer = {
      id: `custom-text-${Date.now()}-${customTexts.length + 1}`,
      text: "Add your text",
      style: createDefaultCustomTextStyle(customTexts.length),
    };

    setCustomTexts((current) => [...current, next]);
    setActiveCustomTextId(next.id);
    setActiveTarget("customText");
  }

  function updateActiveCustomText(patch: Partial<CustomTextLayer>) {
    if (!activeCustomTextId) return;

    setCustomTexts((current) =>
      current.map((item) =>
        item.id === activeCustomTextId ? { ...item, ...patch } : item,
      ),
    );
  }

  function updateActiveCustomTextStyle(patch: Partial<TextStyle>) {
    if (!activeCustomTextId) return;

    setCustomTexts((current) =>
      current.map((item) =>
        item.id === activeCustomTextId
          ? { ...item, style: { ...item.style, ...patch } }
          : item,
      ),
    );
  }

  function removeActiveCustomText() {
    if (!activeCustomTextId) return;

    setCustomTexts((current) => {
      const next = current.filter((item) => item.id !== activeCustomTextId);
      setActiveCustomTextId(next[0]?.id ?? null);
      if (!next.length) setActiveTarget("title");

      return next;
    });
  }

  function selectCustomText(id: string) {
    setActiveCustomTextId(id);
    setActiveTarget("customText");
  }

  function handleCustomTextPointerDown(
    event: ReactPointerEvent<SVGGElement>,
    layer: CustomTextLayer,
  ) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    selectCustomText(layer.id);
    setCustomTextDragStart({
      id: layer.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: layer.style.offsetX,
      offsetY: layer.style.offsetY,
    });
  }

  function handleCustomTextPointerMove(event: ReactPointerEvent<SVGGElement>) {
    if (!customTextDragStart) return;

    setCustomTexts((current) =>
      current.map((item) =>
        item.id === customTextDragStart.id
          ? {
              ...item,
              style: {
                ...item.style,
                offsetX:
                  customTextDragStart.offsetX +
                  event.clientX -
                  customTextDragStart.pointerX,
                offsetY:
                  customTextDragStart.offsetY +
                  event.clientY -
                  customTextDragStart.pointerY,
              },
            }
          : item,
      ),
    );
  }

  function updateTemplate2Title(line1: string, line2: string) {
    setTemplate2TitleLine1(line1);
    setTemplate2TitleLine2(line2);
    setTitle(
      [line1, line2]
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" "),
    );
  }

  function applyPreset(index: number) {
    const preset = wallArtColorPresets[index];
    if (!preset) return;

    setActivePresetIndex(index);
    setPosterBackground(preset.posterBackground);
    setDiscColor(preset.discColor);
    setStyles((current) => ({
      ...current,
      lyrics: { ...current.lyrics, color: preset.lyricColor },
      title: { ...current.title, color: preset.titleColor },
      subtitle: { ...current.subtitle, color: preset.titleColor },
      description: { ...current.description, color: preset.titleColor },
    }));
    setCustomTexts((current) =>
      current.map((item) => ({
        ...item,
        style: { ...item.style, color: preset.titleColor },
      })),
    );
  }

  function applyTemplate2Preset(index: number) {
    const preset = wallArtTemplate2ColorPresets[index];
    if (!preset) return;

    setTemplate2PresetIndex(index);
    setPosterBackground(preset.posterBackground);
    setDiscColor(preset.discColor);
    setStyles((current) => ({
      ...current,
      lyrics: { ...current.lyrics, color: preset.lyricColor },
      title: { ...current.title, color: preset.titleColor },
      subtitle: { ...current.subtitle, color: preset.titleColor },
      description: { ...current.description, color: preset.titleColor },
    }));
    setCustomTexts((current) =>
      current.map((item) => ({
        ...item,
        style: { ...item.style, color: preset.titleColor },
      })),
    );
  }

  function applyImageLyricPreset(index: number) {
    const preset = lyricPortraitPresetImages[index];
    if (!preset) return;

    setImageLyricPresetIndex(index);
    setImageLyricUploadedImage(preset.originSrc);
    setImageCropDraft(null);
  }

  function switchTemplate(template: WallArtTemplateKey) {
    if (template === activeTemplate) return;

    const nextSettings = templateSettings[template];
    setTemplateSettings((current) => ({
      ...current,
      [activeTemplate]: captureCurrentTemplateSettings(),
    }));
    setActiveTemplate(template);
    applyTemplateSettings(nextSettings);
    if (template === "heart") {
      setActiveTarget((current) =>
        [
          "title",
          "lyrics",
          "customText",
          "poster",
          "heart",
          "frame",
          "print",
        ].includes(current)
          ? current
          : "lyrics",
      );
      return;
    }
    if (template === "imageLyrics") {
      setActiveTarget((current) =>
        [
          "image",
          "lyrics",
          "title",
          "subtitle",
          "description",
          "customText",
          "poster",
          "frame",
          "print",
        ].includes(current)
          ? current
          : "image",
      );
      return;
    }
    setActiveTarget((current) =>
      current === "heart" || current === "image" ? "lyrics" : current,
    );
  }

  function resetPrintContentPosition() {
    setPrintContentScale(1);
    setPrintContentOffsetX(0);
    setPrintContentOffsetY(0);
  }

  function handleImageUpload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(String(reader.result || ""));
      setUseCover(true);
    };
    reader.readAsDataURL(file);
  }

  function handleImageLyricUpload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || "");
      const image = new Image();
      image.onload = () => {
        const crop = buildInitialImageCrop({
          imageWidth: image.width,
          imageHeight: image.height,
          canvasWidth: IMAGE_CROP_PREVIEW_WIDTH,
          canvasHeight: Math.round(
            IMAGE_CROP_PREVIEW_WIDTH / posterAspectRatio,
          ),
        });
        setImageCropDraft({
          source,
          imageWidth: image.width,
          imageHeight: image.height,
          printSizeId,
          customWidthCm,
          customHeightCm,
          crop,
        });
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  }

  function updateImageCropCanvasSize({
    printSizeId: nextPrintSizeId,
    customWidthCm: nextCustomWidthCm,
    customHeightCm: nextCustomHeightCm,
  }: {
    printSizeId?: string;
    customWidthCm?: number;
    customHeightCm?: number;
  }) {
    setImageCropDraft((current) => {
      if (!current) return current;
      const draft = {
        ...current,
        printSizeId: nextPrintSizeId ?? current.printSizeId,
        customWidthCm: nextCustomWidthCm ?? current.customWidthCm,
        customHeightCm: nextCustomHeightCm ?? current.customHeightCm,
      };
      const size =
        draft.printSizeId === "custom"
          ? null
          : printSizePresets.find((item) => item.id === draft.printSizeId);
      const widthCm =
        draft.printSizeId === "custom"
          ? draft.customWidthCm
          : (size?.widthCm ?? posterWidthCm);
      const heightCm =
        draft.printSizeId === "custom"
          ? draft.customHeightCm
          : (size?.heightCm ?? posterHeightCm);
      const canvasHeight = Math.round(
        IMAGE_CROP_PREVIEW_WIDTH / (widthCm / heightCm),
      );

      return {
        ...draft,
        crop: buildInitialImageCrop({
          imageWidth: draft.imageWidth,
          imageHeight: draft.imageHeight,
          canvasWidth: IMAGE_CROP_PREVIEW_WIDTH,
          canvasHeight,
          rotate: draft.crop.rotate,
          flipX: draft.crop.flipX,
          flipY: draft.crop.flipY,
        }),
      };
    });
  }

  function updateImageCropTransform(
    patch: Partial<Pick<ImageCropTransform, "x" | "y" | "scale">>,
  ) {
    setImageCropDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        crop: clampImageCrop(
          {
            x: patch.x ?? current.crop.x,
            y: patch.y ?? current.crop.y,
            scale: patch.scale ?? current.crop.scale,
            rotate: current.crop.rotate,
            flipX: current.crop.flipX,
            flipY: current.crop.flipY,
          },
          {
            imageWidth: current.imageWidth,
            imageHeight: current.imageHeight,
            canvasWidth: IMAGE_CROP_PREVIEW_WIDTH,
            canvasHeight: imageCropPreviewHeight || IMAGE_CROP_PREVIEW_WIDTH,
            maxScale: Math.max(current.crop.scale * 3, current.crop.scale + 2),
          },
        ),
      };
    });
  }

  function updateImageCropOrientation(
    patch: Partial<Pick<ImageCropTransform, "rotate" | "flipX" | "flipY">>,
  ) {
    setImageCropDraft((current) => {
      if (!current) return current;
      const rotate = patch.rotate ?? current.crop.rotate;
      const flipX = patch.flipX ?? current.crop.flipX;
      const flipY = patch.flipY ?? current.crop.flipY;

      if (patch.rotate !== undefined && patch.rotate !== current.crop.rotate) {
        return {
          ...current,
          crop: buildInitialImageCrop({
            imageWidth: current.imageWidth,
            imageHeight: current.imageHeight,
            canvasWidth: IMAGE_CROP_PREVIEW_WIDTH,
            canvasHeight: imageCropPreviewHeight || IMAGE_CROP_PREVIEW_WIDTH,
            rotate,
            flipX,
            flipY,
          }),
        };
      }

      return {
        ...current,
        crop: {
          ...current.crop,
          rotate,
          flipX,
          flipY,
        },
      };
    });
  }

  async function applyImageCrop() {
    if (!imageCropDraft) return;

    const targetWidth = 1200;
    const targetHeight = Math.round(
      targetWidth / (imageCropWidthCm / imageCropHeightCm),
    );
    const source = imageCropDraft.source;
    const crop = imageCropDraft.crop;
    const image = new Image();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas is not available."));
          return;
        }
        const scale = targetWidth / IMAGE_CROP_PREVIEW_WIDTH;
        const renderedImageWidth = image.width * crop.scale * scale;
        const renderedImageHeight = image.height * crop.scale * scale;
        context.save();
        context.translate(
          (crop.x + crop.renderedWidth / 2) * scale,
          (crop.y + crop.renderedHeight / 2) * scale,
        );
        context.rotate((crop.rotate * Math.PI) / 180);
        context.scale(crop.flipX ? -1 : 1, crop.flipY ? -1 : 1);
        context.drawImage(
          image,
          -renderedImageWidth / 2,
          -renderedImageHeight / 2,
          renderedImageWidth,
          renderedImageHeight,
        );
        context.restore();
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => reject(new Error("Unable to load crop image."));
      image.src = source;
    });

    setImageLyricUploadedImage(dataUrl);
    setPrintSizeId(imageCropDraft.printSizeId);
    setCustomWidthCm(imageCropDraft.customWidthCm);
    setCustomHeightCm(imageCropDraft.customHeightCm);
    setImageCropDraft(null);
  }

  async function imageUrlToDataUrl(src: string): Promise<string | null> {
    if (!src || src.startsWith("data:")) return src;

    try {
      const response = await fetch(src, { mode: "cors" });
      if (!response.ok) return null;
      const blob = await response.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  async function inlineSvgImages(svg: SVGSVGElement): Promise<void> {
    const images = Array.from(svg.querySelectorAll("image"));

    await Promise.all(
      images.map(async (image) => {
        const href =
          image.getAttribute("href") ||
          image.getAttributeNS("http://www.w3.org/1999/xlink", "href") ||
          "";
        const dataUrl = await imageUrlToDataUrl(href);

        if (!dataUrl) {
          image.remove();
          return;
        }

        image.setAttribute("href", dataUrl);
        image.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataUrl);
      }),
    );
  }

  async function inlineSvgFontFaces(svg: SVGSVGElement): Promise<void> {
    const rules = await Promise.all(
      wallArtFontFiles.map(async ([family, src, weight]) => {
        const dataUrl = await imageUrlToDataUrl(src);
        if (!dataUrl) return "";

        return `@font-face{font-family:'${family}';src:url('${dataUrl}') format('truetype');font-style:normal;font-weight:${weight};}`;
      }),
    );
    const styleText = rules.filter(Boolean).join("");
    if (!styleText) return;

    const defs =
      svg.querySelector("defs") ??
      svg.insertBefore(
        document.createElementNS("http://www.w3.org/2000/svg", "defs"),
        svg.firstChild,
      );
    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style",
    );
    style.textContent = styleText;
    defs.insertBefore(style, defs.firstChild);
  }

  async function downloadPoster() {
    const svg = svgRef.current;
    if (!svg) return;

    const { width, height } = calculatePrintPixelSize({
      widthCm: posterWidthCm,
      heightCm: posterHeightCm,
      dpi: 300,
    });
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if (activeTemplate === "imageLyrics" && imageLyricSourceImage) {
      const imageLyricMask = clone.querySelector(
        "[data-image-lyric-mask]",
      ) as SVGImageElement | null;
      if (imageLyricMask) {
        const highResolutionMask = await renderImageLyricMask({
          source: imageLyricSourceImage,
          width,
          height,
          baseWidth: BASE_POSTER_WIDTH,
          baseHeight: posterViewBoxHeight,
          lyricText,
          fontFamily: styles.lyrics.fontFamily,
          fontSize: styles.lyrics.fontSize,
          fontWeight: styles.lyrics.fontWeight,
          density: imageLyricDensity,
          contrast: imageLyricContrast,
          opacity: imageLyricOpacity,
          invert: imageLyricInvert,
          mode: imageLyricMode,
        });
        imageLyricMask.setAttribute("href", highResolutionMask);
        imageLyricMask.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href",
          highResolutionMask,
        );
      }
    }
    await inlineSvgFontFaces(clone);
    await inlineSvgImages(clone);
    clone.querySelectorAll("foreignObject").forEach((node) => node.remove());
    clone
      .querySelectorAll("[data-preview-frame]")
      .forEach((node) => node.remove());
    clone
      .querySelectorAll("[data-export-content]")
      .forEach((node) => node.removeAttribute("clip-path"));

    const svgText = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas is not available."));
          return;
        }
        context.fillStyle = posterBackground;
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        try {
          canvas.toBlob((pngBlob) => {
            URL.revokeObjectURL(url);
            if (!pngBlob) {
              reject(new Error("Unable to create poster image."));
              return;
            }
            const link = document.createElement("a");
            link.href = URL.createObjectURL(pngBlob);
            link.download = `${title || "wall-art"}-${width}x${height}-300dpi.png`;
            link.click();
            URL.revokeObjectURL(link.href);
            resolve();
          }, "image/png");
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Unable to render poster image."));
      };
      image.src = url;
    });
  }

  return (
    <>
      <Dialog
        open={Boolean(imageCropDraft)}
        onOpenChange={(open) => {
          if (!open) {
            setImageCropDraft(null);
            setImageCropDragStart(null);
          }
        }}
      >
        <DialogContent className="max-h-[92svh] overflow-y-auto rounded-[32px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,239,231,0.78))] p-7 shadow-[0_32px_100px_rgba(49,37,28,0.2),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-2xl sm:max-w-4xl [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:border [&_[data-slot=dialog-close]]:border-white/50 [&_[data-slot=dialog-close]]:bg-white/72 [&_[data-slot=dialog-close]]:p-2 [&_[data-slot=dialog-close]]:opacity-100 [&_[data-slot=dialog-close]]:shadow-[0_12px_28px_rgba(70,53,38,0.12)]">
          <DialogHeader className="gap-3">
            <DialogTitle className="text-[1.65rem] font-black tracking-[-0.02em] text-[#241b16]">
              Crop lyric portrait image
            </DialogTitle>
            <DialogDescription className="max-w-2xl text-[15px] leading-7 text-[#706356]">
              Choose the poster ratio, then move and scale the image before it
              becomes lyric texture.
            </DialogDescription>
          </DialogHeader>

          {imageCropDraft && (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="min-w-0 rounded-[28px] border border-white/25 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%),linear-gradient(180deg,#2e2925,#171412)] p-4 shadow-[0_22px_55px_rgba(31,24,19,0.28)]">
                <div
                  className="mx-auto max-w-full overflow-hidden rounded-[22px] shadow-[0_26px_50px_rgba(0,0,0,0.34)]"
                  style={{
                    aspectRatio: `${imageCropWidthCm} / ${imageCropHeightCm}`,
                    width: imageCropPreviewDisplayWidth,
                    maxHeight: IMAGE_CROP_PREVIEW_MAX_HEIGHT,
                  }}
                >
                <div
                  className="relative origin-top-left touch-none overflow-hidden bg-black"
                  style={{
                    height: imageCropPreviewHeight || IMAGE_CROP_PREVIEW_WIDTH,
                    transform: `scale(${imageCropPreviewDisplayScale})`,
                    width: IMAGE_CROP_PREVIEW_WIDTH,
                  }}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setImageCropDragStart({
                      pointerX: event.clientX,
                      pointerY: event.clientY,
                      cropX: imageCropDraft.crop.x,
                      cropY: imageCropDraft.crop.y,
                    });
                  }}
                  onPointerMove={(event) => {
                    if (!imageCropDragStart) return;
                    updateImageCropTransform({
                      x:
                        imageCropDragStart.cropX +
                        (event.clientX - imageCropDragStart.pointerX) /
                          imageCropPreviewDisplayScale,
                      y:
                        imageCropDragStart.cropY +
                        (event.clientY - imageCropDragStart.pointerY) /
                          imageCropPreviewDisplayScale,
                    });
                  }}
                  onPointerUp={() => setImageCropDragStart(null)}
                  onPointerCancel={() => setImageCropDragStart(null)}
                >
                  <div
                    className="absolute"
                    style={{
                      height: imageCropDraft.crop.renderedHeight,
                      left: imageCropDraft.crop.x,
                      top: imageCropDraft.crop.y,
                      width: imageCropDraft.crop.renderedWidth,
                    }}
                  >
                    <img
                      alt="Crop preview"
                      className="absolute left-1/2 top-1/2 max-w-none select-none"
                      draggable={false}
                      src={imageCropDraft.source}
                      style={{
                        height: imageCropDraft.imageHeight * imageCropDraft.crop.scale,
                        transform: getImageCropPreviewTransform(imageCropDraft.crop),
                        width: imageCropDraft.imageWidth * imageCropDraft.crop.scale,
                      }}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-white/60" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.18)_1px,transparent_1px)] bg-[size:33.333%_33.333%]" />
                  <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.02)]" />
                </div>
                </div>
              </div>

              <div className={cn(wallArtSubtleGlassPanelClassName, "space-y-4 p-5")}>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f7f72]">
                    Canvas size
                  </Label>
                  <Select
                    value={imageCropDraft.printSizeId}
                    onValueChange={(value) =>
                      updateImageCropCanvasSize({ printSizeId: value })
                    }
                  >
                    <SelectTrigger className={cn(wallArtFieldClassName, "w-full")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={cn(
                        wallArtPopoverClassName,
                        "[&_[data-slot=select-item]]:rounded-[16px] [&_[data-slot=select-item][data-state=checked]]:bg-[#2d2622] [&_[data-slot=select-item][data-state=checked]]:text-[#f7f0e6]",
                      )}
                    >
                      {printSizePresets.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {imageCropDraft.printSizeId === "custom" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Width cm</Label>
                      <Input
                        className={wallArtFieldClassName}
                        min={5}
                        step={0.1}
                        type="number"
                        value={imageCropDraft.customWidthCm}
                        onChange={(event) =>
                          updateImageCropCanvasSize({
                            customWidthCm: Number(event.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height cm</Label>
                      <Input
                        className={wallArtFieldClassName}
                        min={5}
                        step={0.1}
                        type="number"
                        value={imageCropDraft.customHeightCm}
                        onChange={(event) =>
                          updateImageCropCanvasSize({
                            customHeightCm: Number(event.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f7f72]">
                    Transform
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className={
                        imageCropDraft.crop.flipX
                          ? wallArtPillButtonActiveClassName
                          : wallArtPillButtonClassName
                      }
                      type="button"
                      variant={imageCropDraft.crop.flipX ? "default" : "outline"}
                      onClick={() =>
                        updateImageCropOrientation({
                          flipX: !imageCropDraft.crop.flipX,
                        })
                      }
                    >
                      <FlipHorizontal className="size-4" />
                      Flip H
                    </Button>
                    <Button
                      className={
                        imageCropDraft.crop.flipY
                          ? wallArtPillButtonActiveClassName
                          : wallArtPillButtonClassName
                      }
                      type="button"
                      variant={imageCropDraft.crop.flipY ? "default" : "outline"}
                      onClick={() =>
                        updateImageCropOrientation({
                          flipY: !imageCropDraft.crop.flipY,
                        })
                      }
                    >
                      <FlipVertical className="size-4" />
                      Flip V
                    </Button>
                    <Button
                      className={wallArtPillButtonClassName}
                      type="button"
                      variant="outline"
                      onClick={() =>
                        updateImageCropOrientation({
                          rotate: getNextImageCropRotation(
                            imageCropDraft.crop.rotate,
                            -1,
                          ),
                        })
                      }
                    >
                      <RotateCcw className="size-4" />
                      Rotate
                    </Button>
                    <Button
                      className={wallArtPillButtonClassName}
                      type="button"
                      variant="outline"
                      onClick={() =>
                        updateImageCropOrientation({
                          rotate: getNextImageCropRotation(
                            imageCropDraft.crop.rotate,
                            1,
                          ),
                        })
                      }
                    >
                      <RotateCw className="size-4" />
                      {imageCropDraft.crop.rotate}°
                    </Button>
                  </div>
                </div>
                <ControlRow
                  label="Zoom"
                  max={Math.max(
                    imageCropDraft.crop.scale * 3,
                    imageCropDraft.crop.scale + 2,
                  )}
                  min={imageCropMinScale}
                  step={0.01}
                  value={Number(imageCropDraft.crop.scale.toFixed(2))}
                  onChange={(scale) => updateImageCropTransform({ scale })}
                />
                <ControlRow
                  label="Move X"
                  max={0}
                  min={Math.round(
                    IMAGE_CROP_PREVIEW_WIDTH -
                      imageCropDraft.crop.renderedWidth,
                  )}
                  step={1}
                  value={Math.round(imageCropDraft.crop.x)}
                  onChange={(x) => updateImageCropTransform({ x })}
                />
                <ControlRow
                  label="Move Y"
                  max={0}
                  min={Math.round(
                    imageCropPreviewHeight -
                      imageCropDraft.crop.renderedHeight,
                  )}
                  step={1}
                  value={Math.round(imageCropDraft.crop.y)}
                  onChange={(y) => updateImageCropTransform({ y })}
                />
                <div className={cn(wallArtInfoCardClassName, "text-xs leading-5 text-[#7b6d62]")}>
                  The crop ratio matches the selected print canvas. Drag the
                  image directly for fine positioning.
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button
              className={wallArtSecondaryButtonClassName}
              type="button"
              variant="outline"
              onClick={() => setImageCropDraft(null)}
            >
              Cancel
            </Button>
            <Button
              className={wallArtPrimaryButtonClassName}
              type="button"
              onClick={applyImageCrop}
            >
              <Move className="size-4" />
              Apply crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent className="w-screen max-w-none gap-0 overflow-visible border-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.58),transparent_32%),linear-gradient(180deg,#f6f1eb_0%,#ede5dc_38%,#e8ded4_100%)] p-0 sm:max-w-none [&_[data-slot=sheet-close]]:top-4 [&_[data-slot=sheet-close]]:right-4 [&_[data-slot=sheet-close]]:size-9 [&_[data-slot=sheet-close]]:rounded-[14px] [&_[data-slot=sheet-close]]:border-none [&_[data-slot=sheet-close]]:bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(245,238,230,0.62))] [&_[data-slot=sheet-close]]:opacity-100 [&_[data-slot=sheet-close]]:text-[#473b33] [&_[data-slot=sheet-close]]:shadow-[0_14px_28px_rgba(66,51,37,0.12),0_1px_0_rgba(255,255,255,0.76)_inset,0_0_0_1px_rgba(255,255,255,0.14)_inset] [&_[data-slot=sheet-close]]:backdrop-blur-2xl [&_[data-slot=sheet-close]]:transition-all [&_[data-slot=sheet-close]]:duration-200 hover:[&_[data-slot=sheet-close]]:scale-[1.03] hover:[&_[data-slot=sheet-close]]:bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,241,233,0.72))] hover:[&_[data-slot=sheet-close]]:text-[#2f2520]">
        <style>{`${wallArtFontFaceCss}${wallArtMotionCss}`}</style>
        {activeImageUrl && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="absolute inset-[-14%] scale-[1.18] bg-center bg-cover opacity-60 blur-[92px] saturate-[1.08]"
              style={{ backgroundImage: `url("${activeImageUrl}")` }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(180deg,rgba(246,241,235,0.54)_0%,rgba(239,231,221,0.68)_36%,rgba(233,224,213,0.78)_100%)] backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(221,197,180,0.04)_42%,rgba(95,74,57,0.06)_100%)] mix-blend-soft-light" />
          </div>
        )}
        <SheetHeader className="relative z-10 mx-3 mt-3 rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(247,241,233,0.66))] px-4 py-3 shadow-[0_16px_34px_rgba(70,53,38,0.1),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.16)_inset] backdrop-blur-2xl sm:mx-4 sm:mt-4 sm:px-5 lg:mx-5 lg:px-6">
          <div className="flex min-w-0 flex-col gap-3 pr-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(255,247,241,0.62)_42%,rgba(232,198,176,0.34)_100%)] text-[#b56e4f] shadow-[0_12px_22px_rgba(181,110,79,0.14),inset_0_1px_0_rgba(255,255,255,0.84)]">
                <Disc3 className="size-3.5" />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 lg:flex-row lg:items-baseline lg:gap-3">
                <SheetTitle className="shrink-0 text-[1.45rem] font-black tracking-[-0.03em] text-[#241b16]">
                  Wall Art Studio
                </SheetTitle>
                <SheetDescription className="max-w-[32rem] text-[13px] leading-5 text-[#75695d] lg:truncate">
                  Choose a template, edit the spiral lyrics, and tune the poster
                  details.
                </SheetDescription>
              </div>
            </div>

            <Select value={selectedSongId} onValueChange={handleSongSelection}>
              <SelectTrigger
                aria-label="Choose song"
                className="h-11 w-full shrink-0 rounded-full bg-white/74 px-4 text-left text-[15px] font-black text-[#2d251f] shadow-[0_14px_28px_rgba(70,53,38,0.1),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.18)_inset] backdrop-blur-xl lg:w-[330px]"
                disabled={!hasSongs}
              >
                <SelectValue placeholder={hasSongs ? "Choose song" : "No songs yet"} />
              </SelectTrigger>
              <SelectContent
                align="end"
                className={cn(
                  wallArtPopoverClassName,
                  "w-[260px] lg:w-[330px] [&_[data-slot=select-item]]:rounded-[14px] [&_[data-slot=select-item]]:py-2.5 [&_[data-slot=select-item][data-state=checked]]:bg-[#2d2622] [&_[data-slot=select-item][data-state=checked]]:text-[#f7f0e6]",
                )}
              >
                {selectableSongs.map((song) => (
                  <SelectItem key={song.id} value={song.id}>
                    <span className="block max-w-[220px] truncate">
                      {song.title || "Untitled song"}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>

        {hasSongs ? (
        <div className="relative z-10 grid min-h-0 flex-1 overflow-hidden px-3 pb-3 pt-3 sm:px-4 sm:pb-4 lg:grid-cols-[185px_minmax(0,1fr)_310px] lg:gap-4 lg:px-5 lg:pb-5">
          <aside className={cn(wallArtGlassPanelClassName, "flex min-h-0 flex-col p-2.5 lg:p-3")}>
            <div className="flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#74685d]">
              <span className="flex size-7 items-center justify-center rounded-full bg-white/72 text-[#b56e4f] shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">
                <ImageIcon className="size-3.5" />
              </span>
              Templates
            </div>
            <div className="mt-2.5 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
              <div
                className="group relative"
                onMouseEnter={() => keepPresetPanelOpen("imageLyrics")}
                onMouseLeave={schedulePresetPanelClose}
              >
                <button
                  className={getWallArtTemplateCardClassName(
                    activeTemplate === "imageLyrics",
                  )}
                  type="button"
                  onClick={() => switchTemplate("imageLyrics")}
                >
                  <div className={wallArtTemplateThumbClassName}>
                    <img
                      alt={
                        lyricPortraitPresetImages[imageLyricPresetIndex]
                          ?.name ?? "Image lyric portrait"
                      }
                      className="size-full object-cover"
                      src={
                        lyricPortraitPresetImages[imageLyricPresetIndex]?.src ??
                        lyricPortraitPresetImages[0].src
                      }
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 px-1">
                    <p className="text-[12px] font-black text-[#271d17]">Lyric Portrait</p>
                    {activeTemplate === "imageLyrics" && (
                      <Badge className={wallArtTemplateActiveBadgeClassName}>Active</Badge>
                    )}
                  </div>
                  <p className="mt-1 px-1 text-[10px] leading-4.5 text-[#7c6f64]">
                    Hover to switch portrait presets.
                  </p>
                </button>

                <div
                  className={cn(
                    presetHoverBridgeClassName,
                    openPresetPanel === "imageLyrics"
                      ? "pointer-events-auto"
                      : "pointer-events-none",
                  )}
                  onMouseEnter={() => keepPresetPanelOpen("imageLyrics")}
                  onMouseLeave={schedulePresetPanelClose}
                />
                <div
                  className={cn(
                    wallArtTemplatePopoverClassName,
                    openPresetPanel === "imageLyrics"
                      ? "visible opacity-100"
                      : "invisible opacity-0",
                  )}
                  onMouseEnter={() => keepPresetPanelOpen("imageLyrics")}
                  onMouseLeave={schedulePresetPanelClose}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {lyricPortraitPresetImages.map((preset, index) => (
                      <button
                        key={preset.src}
                        className={getWallArtTemplatePresetCardClassName(
                          activeTemplate === "imageLyrics" &&
                            imageLyricPresetIndex === index,
                        )}
                        type="button"
                        onClick={() => {
                          switchTemplate("imageLyrics");
                          applyImageLyricPreset(index);
                        }}
                      >
                        <img
                          alt={preset.name}
                          className="aspect-[4/5] w-full object-cover"
                          src={preset.src}
                        />
                        <span className="block bg-white/72 px-2 py-1.5 text-[10px] font-bold text-[#342a23]">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group relative">
                <button
                  className={getWallArtTemplateCardClassName(
                    activeTemplate === "heart",
                  )}
                  type="button"
                  onClick={() => switchTemplate("heart")}
                >
                  <div className={wallArtTemplateThumbClassName}>
                    <img
                      alt="Heart lyric"
                      className="size-full object-cover"
                      src={heartTemplatePreview}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 px-1">
                    <p className="text-[12px] font-black text-[#271d17]">Heart Lyric</p>
                    {activeTemplate === "heart" && (
                      <Badge className={wallArtTemplateActiveBadgeClassName}>Active</Badge>
                    )}
                  </div>
                  <p className="mt-1 px-1 text-[10px] leading-4.5 text-[#7c6f64]">
                    Heart-shaped lyric template.
                  </p>
                </button>
              </div>

              <div className="group relative">
                <button
                  className={getWallArtTemplateCardClassName(
                    activeTemplate === "template2",
                  )}
                  type="button"
                  onClick={() => switchTemplate("template2")}
                >
                  <div className={wallArtTemplateThumbClassName}>
                    <img
                      alt={
                        template2PresetImages[template2PresetIndex]?.name ??
                        "Record poster"
                      }
                      className="size-full object-cover"
                      src={
                        template2PresetImages[template2PresetIndex]?.src ??
                        template2PresetImages[0].src
                      }
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 px-1">
                    <p className="text-[12px] font-black text-[#271d17]">Record Poster</p>
                    {activeTemplate === "template2" && (
                      <Badge className={wallArtTemplateActiveBadgeClassName}>Active</Badge>
                    )}
                  </div>
                  <p className="mt-1 px-1 text-[10px] leading-4.5 text-[#7c6f64]">
                    Hover to switch color presets.
                  </p>
                </button>

                <div
                  className={cn(
                    presetHoverBridgeClassName,
                    openPresetPanel === "template2"
                      ? "pointer-events-auto"
                      : "pointer-events-none",
                  )}
                  onMouseEnter={() => keepPresetPanelOpen("template2")}
                  onMouseLeave={schedulePresetPanelClose}
                />
                <div
                  className={cn(
                    wallArtTemplatePopoverClassName,
                    openPresetPanel === "template2"
                      ? "visible opacity-100"
                      : "invisible opacity-0",
                  )}
                  onMouseEnter={() => keepPresetPanelOpen("template2")}
                  onMouseLeave={schedulePresetPanelClose}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {template2PresetImages.map((preset, index) => (
                      <button
                        key={preset.src}
                        className={getWallArtTemplatePresetCardClassName(
                          activeTemplate === "template2" &&
                            template2PresetIndex === index,
                        )}
                        type="button"
                        onClick={() => {
                          switchTemplate("template2");
                          applyTemplate2Preset(index);
                        }}
                      >
                        <img
                          alt={preset.name}
                          className="aspect-[4/5] w-full object-cover"
                          src={preset.src}
                        />
                        <span className="block bg-white/72 px-2 py-1.5 text-[10px] font-bold text-[#342a23]">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="group relative"
                onMouseEnter={() => keepPresetPanelOpen("spiral")}
                onMouseLeave={schedulePresetPanelClose}
              >
                <button
                  className={getWallArtTemplateCardClassName(
                    activeTemplate === "spiral",
                  )}
                  type="button"
                  onClick={() => switchTemplate("spiral")}
                >
                  <div className={wallArtTemplateThumbClassName}>
                    <img
                      alt={
                        presetImages[activePresetIndex]?.name ?? "Spiral record"
                      }
                      className="size-full object-cover"
                      src={
                        presetImages[activePresetIndex]?.src ??
                        presetImages[0].src
                      }
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 px-1">
                    <p className="text-[12px] font-black text-[#271d17]">Spiral Record</p>
                    {activeTemplate === "spiral" && (
                      <Badge className={wallArtTemplateActiveBadgeClassName}>Active</Badge>
                    )}
                  </div>
                  <p className="mt-1 px-1 text-[10px] leading-4.5 text-[#7c6f64]">
                    Hover to switch color presets.
                  </p>
                </button>

                <div
                  className={cn(
                    presetHoverBridgeClassName,
                    openPresetPanel === "spiral"
                      ? "pointer-events-auto"
                      : "pointer-events-none",
                  )}
                  onMouseEnter={() => keepPresetPanelOpen("spiral")}
                  onMouseLeave={schedulePresetPanelClose}
                />
                <div
                  className={cn(
                    wallArtTemplatePopoverClassName,
                    openPresetPanel === "spiral"
                      ? "visible opacity-100"
                      : "invisible opacity-0",
                  )}
                  onMouseEnter={() => keepPresetPanelOpen("spiral")}
                  onMouseLeave={schedulePresetPanelClose}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {presetImages.map((preset, index) => (
                      <button
                        key={preset.src}
                        className={getWallArtTemplatePresetCardClassName(
                          activeTemplate === "spiral" &&
                            activePresetIndex === index,
                        )}
                        type="button"
                        onClick={() => {
                          switchTemplate("spiral");
                          applyPreset(index);
                        }}
                      >
                        <img
                          alt={preset.name}
                          className="aspect-[4/5] w-full object-cover"
                          src={preset.src}
                        />
                        <span className="block bg-white/72 px-2 py-1.5 text-[10px] font-bold text-[#342a23]">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="min-h-0 overflow-hidden py-0.5">
            <div className={cn(wallArtGlassPanelClassName, "relative flex h-full min-h-0 flex-col items-center justify-center px-4 py-4 md:px-5")}>
              <Button
                className={wallArtFloatingActionClassName}
                type="button"
                onClick={downloadPoster}
              >
                <Download className="size-3.5 transition-transform duration-300 group-hover:[animation:wallArtDownloadIconDrift_0.7s_ease]" />
                Export
              </Button>
              <div
                className="w-auto max-w-full flex-1 overflow-hidden rounded-[4px] shadow-[0_20px_48px_rgba(34,26,20,0.22)]"
                style={{
                  aspectRatio: `${posterWidthCm} / ${posterHeightCm}`,
                  maxHeight: "calc(100svh - 176px)",
                }}
              >
                <svg
                  ref={svgRef}
                  className="size-full"
                  role="img"
                  viewBox={`0 0 ${BASE_POSTER_WIDTH} ${posterViewBoxHeight}`}
                >
                  <title>{title}</title>
                  <defs>
                    <path d={spiralPath} id={`${spiralId}-spiral`} />
                    <clipPath id={`${spiralId}-content-clip`}>
                      <rect
                        height={posterViewBoxHeight - frameWidth * 2}
                        width={BASE_POSTER_WIDTH - frameWidth * 2}
                        x={frameWidth}
                        y={frameWidth}
                      />
                    </clipPath>
                    <filter
                      id={`${spiralId}-frame-shadow`}
                      x="-12%"
                      y="-12%"
                      width="124%"
                      height="124%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="18"
                        floodColor="#000000"
                        floodOpacity="0.28"
                        stdDeviation="18"
                      />
                    </filter>
                    <filter
                      id={`${spiralId}-inner-shadow`}
                      x="-10%"
                      y="-10%"
                      width="120%"
                      height="120%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="5"
                        floodColor="#000000"
                        floodOpacity="0.45"
                        stdDeviation="6"
                      />
                    </filter>
                    <pattern
                      height="90"
                      id={`${spiralId}-wood`}
                      patternUnits="userSpaceOnUse"
                      width="140"
                    >
                      <rect fill={frameColor} height="90" width="140" />
                      <path
                        d="M0 22 C32 5 68 42 140 18 M0 50 C42 73 88 30 140 58 M0 76 C38 54 76 84 140 72"
                        fill="none"
                        opacity="0.22"
                        stroke="#f6e2bc"
                        strokeWidth="5"
                      />
                      <path
                        d="M0 36 C46 18 92 57 140 35 M0 64 C44 44 88 83 140 61"
                        fill="none"
                        opacity="0.18"
                        stroke="#1f130d"
                        strokeWidth="3"
                      />
                    </pattern>
                    {centerImage && (
                      <clipPath id={`${spiralId}-clip`}>
                        <circle
                          cx={POSTER_CENTER}
                          cy={POSTER_CENTER}
                          r={centerRadius}
                        />
                      </clipPath>
                    )}
                    {centerImage && (
                      <clipPath id={`${template2Id}-disc-clip`}>
                        <circle
                          cx={POSTER_CENTER}
                          cy={template2DiscCenterY}
                          r={template2DiscRadius}
                        />
                      </clipPath>
                    )}
                  </defs>
                  <rect
                    fill={
                      activeTemplate === "template2"
                        ? "#f5f0eb"
                        : posterBackground
                    }
                    height={posterViewBoxHeight}
                    width={BASE_POSTER_WIDTH}
                  />
                  <g
                    clipPath={`url(#${spiralId}-content-clip)`}
                    data-export-content="true"
                  >
                    <g transform={printContentTransform}>
                      {activeTemplate === "template2" && (
                        <g>
                          <rect
                            fill={posterBackground}
                            height={posterViewBoxHeight}
                            width={BASE_POSTER_WIDTH}
                          />
                          <circle
                            cx="500"
                            cy={template2DiscCenterY}
                            fill={
                              useCover && centerImage ? "#111111" : discColor
                            }
                            r={template2DiscRadius}
                            onClick={() => setActiveTarget("disc")}
                          />
                          {useCover && centerImage && (
                            <image
                              clipPath={`url(#${template2Id}-disc-clip)`}
                              height={template2DiscRadius * 2}
                              href={centerImage}
                              preserveAspectRatio="xMidYMid slice"
                              width={template2DiscRadius * 2}
                              x={POSTER_CENTER - template2DiscRadius}
                              y={template2DiscCenterY - template2DiscRadius}
                              onClick={() => setActiveTarget("disc")}
                            />
                          )}
                          <circle
                            cx="500"
                            cy={template2DiscCenterY}
                            fill="#acacac"
                            r={Math.round(template2DiscRadius * 0.29)}
                            stroke="#f2f2f2"
                            strokeWidth="4"
                          />
                          <circle
                            cx="500"
                            cy={template2DiscCenterY}
                            fill="#555555"
                            r={Math.round(template2DiscRadius * 0.05)}
                          />
                          <text
                            fill={styles.title.color}
                            fontFamily={styles.title.fontFamily}
                            fontSize={titleFontSize}
                            fontWeight={styles.title.fontWeight}
                            letterSpacing="0.02em"
                            transform={`rotate(${styles.title.rotation} ${108 + styles.title.offsetX} ${200 + styles.title.offsetY})`}
                            x={108 + styles.title.offsetX}
                            y={178 + styles.title.offsetY}
                            onClick={() => setActiveTarget("title")}
                          >
                            {[template2TitleLine1, template2TitleLine2]
                              .filter(Boolean)
                              .map((line, index) => (
                                <tspan
                                  key={`${line}-${index}`}
                                  x={108 + styles.title.offsetX}
                                  y={
                                    200 +
                                    styles.title.offsetY +
                                    index * titleFontSize * 1.2
                                  }
                                >
                                  {line.toUpperCase()}
                                </tspan>
                              ))}
                          </text>
                          <text
                            fill={styles.lyrics.color}
                            fontFamily={styles.lyrics.fontFamily}
                            fontSize={styles.lyrics.fontSize}
                            fontWeight={styles.lyrics.fontWeight}
                            letterSpacing="1.6"
                            textAnchor="middle"
                            onClick={() => setActiveTarget("lyrics")}
                          >
                            {template2LyricsLines.map((line, index) => (
                              <tspan
                                key={index}
                                x="500"
                                y={638 + index * template2LyricLineHeight}
                              >
                                {line.toUpperCase()}
                              </tspan>
                            ))}
                          </text>
                          <text
                            fill={styles.subtitle.color}
                            fontFamily={styles.subtitle.fontFamily}
                            fontSize={subtitleFontSize * 1.95}
                            fontWeight={styles.subtitle.fontWeight}
                            letterSpacing="0.48em"
                            textAnchor="end"
                            transform={`rotate(${styles.subtitle.rotation} ${878 + styles.subtitle.offsetX} ${posterViewBoxHeight - 152 + styles.subtitle.offsetY})`}
                            x={878 + styles.subtitle.offsetX}
                            y={posterViewBoxHeight - 152 + styles.subtitle.offsetY}
                            onClick={() => setActiveTarget("subtitle")}
                          >
                            {subtitle.toUpperCase()}
                          </text>
                          <line
                            x1={styles.subtitle.offsetX}
                            x2={882 + styles.subtitle.offsetX}
                            y1={posterViewBoxHeight - 124 + styles.subtitle.offsetY}
                            y2={posterViewBoxHeight - 124 + styles.subtitle.offsetY}
                            stroke="#1d1d1d"
                            strokeWidth="5"
                          />
                          <text
                            fill={styles.description.color}
                            fontFamily={styles.description.fontFamily}
                            fontSize={descriptionFontSize * 1.44}
                            letterSpacing="0.36em"
                            textAnchor="end"
                            transform={`rotate(${styles.description.rotation} ${878 + styles.description.offsetX} ${posterViewBoxHeight - 82 + styles.description.offsetY})`}
                            x={878 + styles.description.offsetX}
                            y={
                              posterViewBoxHeight - 82 + styles.description.offsetY
                            }
                            onClick={() => setActiveTarget("description")}
                          >
                            {description.toUpperCase()}
                          </text>
                        </g>
                      )}
                      {activeTemplate === "heart" && (
                        <g>
                          <rect
                            fill={posterBackground}
                            height={posterViewBoxHeight}
                            width={BASE_POSTER_WIDTH}
                          />
                          <text
                            fill={styles.title.color}
                            fontFamily={styles.title.fontFamily}
                            fontSize={heartTitleFontSize}
                            fontWeight={styles.title.fontWeight}
                            textAnchor="middle"
                            transform={`rotate(${styles.title.rotation} ${500 + styles.title.offsetX} ${heartTitleStartY + styles.title.offsetY})`}
                            x={500 + styles.title.offsetX}
                            y={heartTitleStartY + styles.title.offsetY}
                            onClick={() => setActiveTarget("title")}
                          >
                            {heartTitleLines[0]?.toUpperCase() ??
                              title.toUpperCase()}
                          </text>
                          {heartTitleLines[1] && (
                            <text
                              fill={styles.title.color}
                            fontFamily={styles.title.fontFamily}
                            fontSize={heartTitleFontSize}
                            fontWeight={styles.title.fontWeight}
                            textAnchor="middle"
                            transform={`rotate(${styles.title.rotation} ${500 + styles.title.offsetX} ${heartTitleStartY + heartTitleLineHeight + styles.title.offsetY})`}
                            x={500 + styles.title.offsetX}
                            y={
                                heartTitleStartY +
                                heartTitleLineHeight +
                                styles.title.offsetY
                              }
                              onClick={() => setActiveTarget("title")}
                            >
                              {heartTitleLines[1].toUpperCase()}
                            </text>
                          )}
                          <path
                            d={heartShapePath}
                            fill={posterBackground}
                            opacity="0.82"
                          />
                          {heartLyricsLayout.map((line, index) => (
                            <text
                              key={`${line.text}-${line.y}-${index}`}
                              fill={styles.lyrics.color}
                              fontFamily={styles.lyrics.fontFamily}
                              fontSize={line.fontSize}
                              fontWeight={styles.lyrics.fontWeight}
                              lengthAdjust="spacing"
                              textLength={line.width}
                              textAnchor={line.textAnchor}
                              x={line.x}
                              y={line.y}
                              onClick={() => setActiveTarget("lyrics")}
                            >
                              {line.text}
                            </text>
                          ))}
                          <text
                            x="500"
                            y={1160 + (heartSize - 1) * 150}
                            textAnchor="middle"
                          >
                            <tspan
                              fill="#b3122f"
                              fontSize="40"
                              onClick={() => setActiveTarget("heart")}
                            >
                              ♥
                            </tspan>
                          </text>
                        </g>
                      )}
                      {activeTemplate === "imageLyrics" && (
                        <g>
                          <rect
                            fill={posterBackground}
                            height={posterViewBoxHeight}
                            width={BASE_POSTER_WIDTH}
                          />
                          {maskedLyricImage ? (
                            <image
                              data-image-lyric-mask="true"
                              height={posterViewBoxHeight}
                              href={maskedLyricImage}
                              preserveAspectRatio="none"
                              width={BASE_POSTER_WIDTH}
                              x="0"
                              y="0"
                              onClick={() => setActiveTarget("lyrics")}
                            />
                          ) : (
                            <g
                              textAnchor="middle"
                              onClick={() => setActiveTarget("image")}
                            >
                              <rect
                                fill="#ffffff"
                                height={posterViewBoxHeight - 220}
                                opacity="0.42"
                                rx="4"
                                width="820"
                                x="90"
                                y="78"
                              />
                              <text
                                fill="#2a2824"
                                fontFamily="Georgia, serif"
                                fontSize="34"
                                fontWeight="700"
                                x="500"
                                y={posterViewBoxHeight * 0.38}
                              >
                                Upload an image
                              </text>
                              <text
                                fill="#70685d"
                                fontFamily="Montserrat, ui-sans-serif, system-ui"
                                fontSize="18"
                                x="500"
                                y={posterViewBoxHeight * 0.42}
                              >
                                The portrait will be rebuilt from your lyrics.
                              </text>
                            </g>
                          )}
                          <text
                            fill={styles.title.color}
                            fontFamily={styles.title.fontFamily}
                            fontSize={styles.title.fontSize * styles.title.scale * 0.92}
                            fontWeight={styles.title.fontWeight}
                            textAnchor="start"
                            transform={`rotate(${styles.title.rotation} ${86 + styles.title.offsetX} ${posterViewBoxHeight - 142 + styles.title.offsetY})`}
                            x={86 + styles.title.offsetX}
                            y={posterViewBoxHeight - 142 + styles.title.offsetY}
                            onClick={() => setActiveTarget("title")}
                          >
                            {title}
                          </text>
                          <text
                            fill={styles.subtitle.color}
                            fontFamily={styles.subtitle.fontFamily}
                            fontSize={
                              styles.subtitle.fontSize * styles.subtitle.scale * 0.82
                            }
                            fontWeight={styles.subtitle.fontWeight}
                            textAnchor="start"
                            transform={`rotate(${styles.subtitle.rotation} ${88 + styles.subtitle.offsetX} ${posterViewBoxHeight - 102 + styles.subtitle.offsetY})`}
                            x={88 + styles.subtitle.offsetX}
                            y={posterViewBoxHeight - 102 + styles.subtitle.offsetY}
                            onClick={() => setActiveTarget("subtitle")}
                          >
                            {subtitle}
                          </text>
                          <text
                            fill={styles.description.color}
                            fontFamily={styles.description.fontFamily}
                            fontSize={
                              styles.description.fontSize *
                              styles.description.scale *
                              0.9
                            }
                            textAnchor="start"
                            transform={`rotate(${styles.description.rotation} ${88 + styles.description.offsetX} ${posterViewBoxHeight - 68 + styles.description.offsetY})`}
                            x={88 + styles.description.offsetX}
                            y={posterViewBoxHeight - 68 + styles.description.offsetY}
                            onClick={() => setActiveTarget("description")}
                          >
                            {description}
                          </text>
                        </g>
                      )}
                      {activeTemplate === "spiral" && (
                        <>
                          <rect
                            fill="rgba(255,255,255,0.04)"
                            height={posterViewBoxHeight}
                            width={BASE_POSTER_WIDTH}
                          />
                          <circle
                            cx={POSTER_CENTER}
                            cy={POSTER_CENTER}
                            fill={
                              useCover && centerImage ? "#111111" : discColor
                            }
                            r={centerRadius}
                            role="button"
                            tabIndex={0}
                            onClick={() => setActiveTarget("disc")}
                          />
                          {useCover && centerImage && (
                            <image
                              clipPath={`url(#${spiralId}-clip)`}
                              height={centerRadius * 2}
                              href={centerImage}
                              preserveAspectRatio="xMidYMid slice"
                              width={centerRadius * 2}
                              x={POSTER_CENTER - centerRadius}
                              y={POSTER_CENTER - centerRadius}
                              onClick={() => setActiveTarget("disc")}
                            />
                          )}
                          <circle
                            cx={POSTER_CENTER}
                            cy={POSTER_CENTER}
                            fill={posterBackground}
                            r="18"
                          />
                          <text
                            dominantBaseline="middle"
                            style={{
                              fill: styles.lyrics.color,
                              fontFamily: styles.lyrics.fontFamily,
                              fontSize: styles.lyrics.fontSize,
                              fontWeight: styles.lyrics.fontWeight,
                            }}
                            onClick={() => setActiveTarget("lyrics")}
                          >
                            <textPath
                              href={`#${spiralId}-spiral`}
                              startOffset="0%"
                            >
                              {displayLyrics}
                            </textPath>
                          </text>
                          <text
                            fill={styles.title.color}
                            fontFamily={styles.title.fontFamily}
                            fontSize={styles.title.fontSize * styles.title.scale}
                            fontWeight={styles.title.fontWeight}
                            letterSpacing="0"
                            textAnchor="middle"
                            transform={`rotate(${styles.title.rotation} ${500 + styles.title.offsetX} ${titleY + styles.title.offsetY})`}
                            x={500 + styles.title.offsetX}
                            y={titleY + styles.title.offsetY}
                            onClick={() => setActiveTarget("title")}
                          >
                            {title.toUpperCase()}
                          </text>
                          <text
                            fill={styles.subtitle.color}
                            fontFamily={styles.subtitle.fontFamily}
                            fontSize={styles.subtitle.fontSize * styles.subtitle.scale}
                            fontWeight={styles.subtitle.fontWeight}
                            letterSpacing="0"
                            textAnchor="middle"
                            transform={`rotate(${styles.subtitle.rotation} ${500 + styles.subtitle.offsetX} ${subtitleY + styles.subtitle.offsetY})`}
                            x={500 + styles.subtitle.offsetX}
                            y={subtitleY + styles.subtitle.offsetY}
                            onClick={() => setActiveTarget("subtitle")}
                          >
                            {subtitle.toUpperCase()}
                          </text>
                          <text
                            fill={styles.description.color}
                            fontFamily={styles.description.fontFamily}
                            fontSize={descriptionFontSize}
                            fontWeight={styles.description.fontWeight}
                            letterSpacing="0"
                            textAnchor="middle"
                            transform={`rotate(${styles.description.rotation} ${500 + styles.description.offsetX} ${descriptionY + styles.description.offsetY})`}
                            x={500 + styles.description.offsetX}
                            y={descriptionY + styles.description.offsetY}
                            onClick={() => setActiveTarget("description")}
                          >
                            {description.toUpperCase()}
                          </text>
                        </>
                      )}
                      {showQrCode && activeShareUrl && (
                        <g transform={`translate(${qrCodeX} ${qrCodeY})`}>
                          <rect
                            fill="#ffffff"
                            height={qrCodeSize}
                            rx="10"
                            width={qrCodeSize}
                          />
                          <g
                            transform={`translate(${qrCodeInnerPadding} ${qrCodeInnerPadding})`}
                          >
                            <QRCodeSVG
                              bgColor="#ffffff"
                              fgColor="#1f1d1b"
                              includeMargin={false}
                              level="M"
                              size={qrCodeInnerSize}
                              value={activeShareUrl}
                            />
                          </g>
                        </g>
                      )}
                      {customTexts.map((layer) => (
                        <g
                          key={layer.id}
                          data-custom-text-layer="true"
                          className="cursor-move"
                          transform={`translate(${layer.style.offsetX} ${layer.style.offsetY}) rotate(${layer.style.rotation}) scale(${layer.style.scale})`}
                          onClick={(event) => {
                            event.stopPropagation();
                            selectCustomText(layer.id);
                          }}
                          onPointerCancel={() => setCustomTextDragStart(null)}
                          onPointerDown={(event) =>
                            handleCustomTextPointerDown(event, layer)
                          }
                          onPointerMove={handleCustomTextPointerMove}
                          onPointerUp={() => setCustomTextDragStart(null)}
                        >
                          <text
                            dominantBaseline="middle"
                            fill={layer.style.color}
                            fontFamily={layer.style.fontFamily}
                            fontSize={layer.style.fontSize}
                            fontWeight={layer.style.fontWeight}
                            textAnchor="middle"
                          >
                            {layer.text}
                          </text>
                          {activeTarget === "customText" &&
                            activeCustomTextId === layer.id && (
                              <rect
                                fill="none"
                                height={layer.style.fontSize * 1.35}
                                pointerEvents="none"
                                stroke="#2563eb"
                                strokeDasharray="8 6"
                                strokeWidth="2"
                                width={
                                  Math.max(
                                    layer.text.length *
                                      layer.style.fontSize *
                                      0.62,
                                    layer.style.fontSize * 4,
                                  )
                                }
                                x={
                                  -Math.max(
                                    layer.text.length *
                                      layer.style.fontSize *
                                      0.62,
                                    layer.style.fontSize * 4,
                                  ) / 2
                                }
                                y={-(layer.style.fontSize * 1.35) / 2}
                              />
                            )}
                        </g>
                      ))}
                    </g>
                  </g>
                  {["spiral", "template2", "heart", "imageLyrics"].includes(
                    activeTemplate,
                  ) && (
                    <>
                      <path
                        d={`M 0 0 H ${BASE_POSTER_WIDTH} V ${posterViewBoxHeight} H 0 Z M ${frameWidth} ${frameWidth} V ${posterViewBoxHeight - frameWidth} H ${BASE_POSTER_WIDTH - frameWidth} V ${frameWidth} Z`}
                        data-preview-frame="true"
                        fill={`url(#${spiralId}-wood)`}
                        fillRule="evenodd"
                        filter={`url(#${spiralId}-frame-shadow)`}
                        onClick={() => setActiveTarget("frame")}
                      />
                      <rect
                        data-preview-frame="true"
                        fill="none"
                        filter={`url(#${spiralId}-inner-shadow)`}
                        height={posterViewBoxHeight - frameWidth * 2}
                        pointerEvents="none"
                        stroke="#000000"
                        strokeOpacity="0.22"
                        strokeWidth="10"
                        width={BASE_POSTER_WIDTH - frameWidth * 2}
                        x={frameWidth}
                        y={frameWidth}
                      />
                      <rect
                        data-preview-frame="true"
                        fill="none"
                        height={posterViewBoxHeight - frameWidth * 2}
                        pointerEvents="none"
                        stroke="#000000"
                        strokeOpacity="0.12"
                        strokeWidth={Math.max(8, Math.round(frameWidth * 0.38))}
                        width={BASE_POSTER_WIDTH - frameWidth * 2}
                        x={frameWidth}
                        y={frameWidth}
                      />
                      <rect
                        data-preview-frame="true"
                        fill="none"
                        height={posterViewBoxHeight - frameWidth}
                        pointerEvents="none"
                        stroke="#f8dfb2"
                        strokeOpacity="0.28"
                        strokeWidth={Math.max(3, Math.round(frameWidth * 0.16))}
                        width={BASE_POSTER_WIDTH - frameWidth}
                        x={frameWidth / 2}
                        y={frameWidth / 2}
                      />
                      <rect
                        data-preview-frame="true"
                        fill="none"
                        height={posterViewBoxHeight - frameWidth * 2}
                        pointerEvents="none"
                        stroke="#ffffff"
                        strokeOpacity="0.16"
                        strokeWidth="5"
                        width={BASE_POSTER_WIDTH - frameWidth * 2}
                        x={frameWidth + 3}
                        y={frameWidth + 3}
                      />
                    </>
                  )}
                </svg>
              </div>
            </div>
          </section>

          <aside className={cn(wallArtGlassPanelClassName, "min-h-0 overflow-auto p-3 lg:p-4")}>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-white/76 text-[#b56e4f] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                <SlidersHorizontal className="size-4" />
              </span>
              <h3 className="text-[0.95rem] font-black tracking-[-0.02em] text-[#241b16]">Edit</h3>
              <Badge className="ml-auto rounded-full border-none bg-white/74 px-2.5 py-0.5 text-[10px] font-bold text-[#635649] shadow-[inset_0_1px_0_rgba(255,255,255,0.74)]" variant="secondary">
                {activeTarget}
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {(activeTemplate === "heart"
                ? heartEditTargets
                : activeTemplate === "imageLyrics"
                  ? imageLyricEditTargets
                : editTargets
              ).map(([key, label]) => (
                <Button
                  key={key}
                  className={
                    activeTarget === key
                      ? cn(wallArtPillButtonActiveClassName, "h-9 text-[13px] font-bold")
                      : cn(wallArtPillButtonClassName, "h-9 text-[13px] font-bold")
                  }
                  size="sm"
                  type="button"
                  variant={activeTarget === key ? "default" : "outline"}
                  onClick={() => setActiveTarget(key as ActiveTarget)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <Button
              className={
                activeTarget === "customText"
                  ? cn(wallArtPillButtonActiveClassName, "mt-2.5 h-10 w-full text-[13px] font-bold")
                  : cn(wallArtPillButtonClassName, "mt-2.5 h-10 w-full text-[13px] font-bold")
              }
              type="button"
              variant={activeTarget === "customText" ? "default" : "outline"}
              onClick={addCustomText}
            >
              <Plus className="size-4" />
              Add text
            </Button>

            <Separator className="my-5 bg-white/45" />

            {activeTarget === "image" ? (
              <div className={wallArtEditorSectionClassName}>
                <div className={cn(wallArtInfoCardClassName, "space-y-2.5")}>
                  <div>
                    <Label className="text-[13px] font-bold text-[#241b16]">Source image</Label>
                    <p className="mt-1 text-[11px] leading-4.5 text-[#76695d]">
                      Upload and crop an image. The final portrait keeps the
                      original color only where lyric text is drawn.
                    </p>
                  </div>
                  <Input
                    accept="image/*"
                    className="peer sr-only"
                    id={imageLyricUploadInputId}
                    type="file"
                    onChange={(event) =>
                      handleImageLyricUpload(event.target.files?.[0])
                    }
                  />
                  <label
                    className={cn(
                      "group flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[18px] border border-white/40 bg-white/66 transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_10px_20px_rgba(70,53,38,0.06)]",
                      "hover:bg-white/82 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_14px_28px_rgba(70,53,38,0.1)]",
                      "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#c9bbac]/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-transparent",
                    )}
                    htmlFor={imageLyricUploadInputId}
                    title={
                      imageLyricSourceImage
                        ? "Click to replace image"
                        : "Click to upload image"
                    }
                  >
                    {imageLyricSourceImage ? (
                      <div className="relative size-full">
                        <img
                          alt="Lyric portrait source"
                          className="size-full object-cover transition duration-200 group-hover:scale-[1.025]"
                          src={imageLyricSourceImage}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-200 group-hover:bg-black/28">
                          <span className="inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-bold text-[#2d251f] opacity-0 shadow-[0_12px_22px_rgba(27,21,17,0.18)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                            <ImagePlus className="size-4" />
                            Replace image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 px-4 text-center">
                        <span className="flex size-10 items-center justify-center rounded-full bg-white/82 text-[#8a7a6c] transition-colors duration-200 group-hover:bg-white group-hover:text-[#b56e4f]">
                          <ImagePlus className="size-4.5" />
                        </span>
                        <span className="text-[13px] font-bold text-[#241b16]">
                          Upload source image
                        </span>
                        <span className="text-[11px] leading-4.5 text-[#76695d]">
                          Click to choose an image for the lyric portrait.
                        </span>
                      </div>
                    )}
                  </label>
                </div>
                <div className="space-y-2">
                  <Label className={wallArtSectionHeadingClassName}>
                    Render mode
                  </Label>
                  <Select
                    value={imageLyricMode}
                    onValueChange={(value) =>
                      setImageLyricMode(value as ImageLyricMode)
                    }
                  >
                    <SelectTrigger className={cn(wallArtFieldClassName, "w-full")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={cn(
                        wallArtPopoverClassName,
                        "[&_[data-slot=select-item]]:rounded-[16px] [&_[data-slot=select-item][data-state=checked]]:bg-[#2d2622] [&_[data-slot=select-item][data-state=checked]]:text-[#f7f0e6]",
                      )}
                    >
                      <SelectItem value="color">Color from image</SelectItem>
                      <SelectItem value="grayscale">
                        Black and white luminance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ControlRow
                  label="Density"
                  max={1.8}
                  min={0.55}
                  step={0.05}
                  value={Number(imageLyricDensity.toFixed(2))}
                  onChange={setImageLyricDensity}
                />
                <ControlRow
                  label="Contrast"
                  max={2.6}
                  min={0.45}
                  step={0.05}
                  value={Number(imageLyricContrast.toFixed(2))}
                  onChange={setImageLyricContrast}
                />
                <ControlRow
                  label="Mask opacity"
                  max={1}
                  min={0.2}
                  step={0.02}
                  value={Number(imageLyricOpacity.toFixed(2))}
                  onChange={setImageLyricOpacity}
                />
                <div className={cn(wallArtInfoCardClassName, "flex items-center justify-between gap-3")}>
                  <div>
                    <Label className="text-[13px] font-bold text-[#241b16]">Invert source</Label>
                    <p className="mt-1 text-[11px] leading-4.5 text-[#76695d]">
                      Reverse the source image before applying the lyric mask.
                    </p>
                  </div>
                  <Switch
                    className="[&_[data-slot=switch-thumb]]:bg-white [&_[data-slot=switch-thumb]]:shadow-[0_6px_14px_rgba(45,38,34,0.16)] data-[state=checked]:bg-[#2d2622] data-[state=unchecked]:bg-white/80"
                    checked={imageLyricInvert}
                    onCheckedChange={setImageLyricInvert}
                  />
                </div>
              </div>
            ) : activeTarget === "poster" ? (
              <div className={wallArtEditorSectionClassName}>
                <ColorInput
                  label="Background"
                  value={posterBackground}
                  onChange={setPosterBackground}
                />
              </div>
            ) : activeTarget === "heart" ? (
              <div className={wallArtEditorSectionClassName}>
                <ControlRow
                  label="Heart size"
                  max={1.28}
                  min={0.78}
                  step={0.01}
                  value={heartSize}
                  onChange={setHeartSize}
                />
              </div>
            ) : activeTarget === "frame" ? (
              <div className={wallArtEditorSectionClassName}>
                <ColorInput
                  label="Frame color"
                  value={frameColor}
                  onChange={setFrameColor}
                />
                <ControlRow
                  label="Frame width"
                  max={80}
                  min={12}
                  value={frameWidth}
                  onChange={setFrameWidth}
                />
              </div>
            ) : activeTarget === "print" ? (
              <div className={wallArtEditorSectionClassName}>
                <div className="space-y-2">
                  <Label className={wallArtSectionHeadingClassName}>
                    Print size
                  </Label>
                  <Select value={printSizeId} onValueChange={setPrintSizeId}>
                    <SelectTrigger className={cn(wallArtFieldClassName, "w-full")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={cn(
                        wallArtPopoverClassName,
                        "[&_[data-slot=select-item]]:rounded-[16px] [&_[data-slot=select-item][data-state=checked]]:bg-[#2d2622] [&_[data-slot=select-item][data-state=checked]]:text-[#f7f0e6]",
                      )}
                    >
                      {printSizePresets.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {printSizeId === "custom" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Width cm</Label>
                      <Input
                        className={wallArtFieldClassName}
                        min={5}
                        step={0.1}
                        type="number"
                        value={customWidthCm}
                        onChange={(event) =>
                          setCustomWidthCm(Number(event.target.value) || 1)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height cm</Label>
                      <Input
                        className={wallArtFieldClassName}
                        min={5}
                        step={0.1}
                        type="number"
                        value={customHeightCm}
                        onChange={(event) =>
                          setCustomHeightCm(Number(event.target.value) || 1)
                        }
                      />
                    </div>
                  </div>
                )}
                <div className={cn(wallArtInfoCardClassName, "text-[11px] leading-4.5 text-[#76695d]")}>
                  Download exports at 300dpi for the selected size.
                </div>
                <div className={cn(wallArtInfoCardClassName, "space-y-4")}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <QrCodeIcon className="size-4 shrink-0 text-[#b56e4f]" />
                      <div>
                        <Label className="text-[13px] font-bold text-[#241b16]">
                          Show QR code
                        </Label>
                        <p className="mt-1 text-[11px] leading-4.5 text-[#76695d]">
                          Print the playable share QR on the artwork.
                        </p>
                      </div>
                    </div>
                    <Switch
                      className="[&_[data-slot=switch-thumb]]:bg-white [&_[data-slot=switch-thumb]]:shadow-[0_6px_14px_rgba(45,38,34,0.16)] data-[state=checked]:bg-[#2d2622] data-[state=unchecked]:bg-white/80"
                      checked={showQrCode}
                      disabled={!activeShareUrl}
                      onCheckedChange={setShowQrCode}
                    />
                  </div>
                  {!activeShareUrl && (
                    <p className="text-[11px] leading-4.5 text-[#87786d]">
                      This song does not have a share link yet.
                    </p>
                  )}
                  <ControlRow
                    label="QR size"
                    max={220}
                    min={72}
                    step={1}
                    value={qrCodeSize}
                    onChange={setQrCodeSize}
                  />
                  <ControlRow
                    label="QR move X"
                    max={qrCodePlacement.maxOffsetX}
                    min={qrCodePlacement.minOffsetX}
                    step={1}
                    value={safeQrCodeOffsetX}
                    onChange={setQrCodeOffsetX}
                  />
                  <ControlRow
                    label="QR move Y"
                    max={qrCodePlacement.maxOffsetY}
                    min={qrCodePlacement.minOffsetY}
                    step={1}
                    value={safeQrCodeOffsetY}
                    onChange={setQrCodeOffsetY}
                  />
                </div>
                <div className={cn(wallArtInfoCardClassName, "space-y-4")}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label className="text-[13px] font-bold text-[#241b16]">
                        Artwork position
                      </Label>
                      <p className="mt-1 text-[11px] leading-4.5 text-[#76695d]">
                        Crop-like fit controls for the selected print size.
                      </p>
                    </div>
                    <Button
                      className={cn(wallArtMicroButtonClassName, "shrink-0")}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={resetPrintContentPosition}
                    >
                      Reset
                    </Button>
                  </div>
                  <ControlRow
                    label="Scale"
                    max={1.6}
                    min={0.72}
                    step={0.01}
                    value={Number(printContentScale.toFixed(2))}
                    onChange={setPrintContentScale}
                  />
                  <ControlRow
                    label="Move X"
                    max={260}
                    min={-260}
                    step={1}
                    value={printContentOffsetX}
                    onChange={setPrintContentOffsetX}
                  />
                  <ControlRow
                    label="Move Y"
                    max={360}
                    min={-360}
                    step={1}
                    value={printContentOffsetY}
                    onChange={setPrintContentOffsetY}
                  />
                </div>
              </div>
            ) : activeTarget === "disc" ? (
              <div className={wallArtEditorSectionClassName}>
                <ColorInput
                  label="Disc color"
                  value={discColor}
                  onChange={setDiscColor}
                />
                <ControlRow
                  label="Disc radius"
                  max={activeTemplate === "template2" ? 440 : 240}
                  min={activeTemplate === "template2" ? 280 : 110}
                  value={
                    activeTemplate === "template2"
                      ? template2DiscRadius
                      : centerRadius
                  }
                  onChange={
                    activeTemplate === "template2"
                      ? setTemplate2DiscRadius
                      : setCenterRadius
                  }
                />
                {activeTemplate !== "heart" && (
                  <div className={cn(wallArtInfoCardClassName, "space-y-3")}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Label className="text-[13px] font-bold text-[#241b16]">
                          Disc artwork
                        </Label>
                        <p className="mt-1 text-[11px] text-[#76695d]">
                          Use cover art or upload an image for the disc.
                        </p>
                      </div>
                      <Button
                        className={cn(
                          useCover
                            ? wallArtPillButtonActiveClassName
                            : wallArtMicroButtonClassName,
                          "size-9",
                        )}
                        size="sm"
                        type="button"
                        variant={useCover ? "default" : "outline"}
                        onClick={() => setUseCover((current) => !current)}
                      >
                        <ImagePlus className="size-4" />
                      </Button>
                    </div>
                    <Input
                      accept="image/*"
                      className={wallArtFieldClassName}
                      type="file"
                      onChange={(event) =>
                        handleImageUpload(event.target.files?.[0])
                      }
                    />
                  </div>
                )}
              </div>
            ) : activeTarget === "customText" ? (
              <div className={wallArtEditorSectionClassName}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-black text-[#241b16]">
                    <Type className="size-4 text-[#b56e4f]" />
                    Text layer
                  </div>
                  {activeCustomText && (
                    <Button
                      className={wallArtMicroButtonClassName}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={removeActiveCustomText}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
                {activeCustomText ? (
                  <>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input
                        className={wallArtFieldClassName}
                        value={activeCustomText.text}
                        onChange={(event) =>
                          updateActiveCustomText({ text: event.target.value })
                        }
                      />
                    </div>
                    <FontSelect
                      value={activeStyle.fontFamily}
                      onChange={(value) =>
                        updateActiveCustomTextStyle({ fontFamily: value })
                      }
                    />
                    <FontWeightSelect
                      value={activeStyle.fontWeight}
                      onChange={(fontWeight) =>
                        updateActiveCustomTextStyle({ fontWeight })
                      }
                    />
                    <ControlRow
                      label="Font size"
                      max={120}
                      min={8}
                      value={activeStyle.fontSize}
                      onChange={(fontSize) =>
                        updateActiveCustomTextStyle({ fontSize })
                      }
                    />
                    <ControlRow
                      label="Move X"
                      max={BASE_POSTER_WIDTH}
                      min={0}
                      step={1}
                      value={Math.round(activeStyle.offsetX)}
                      onChange={(offsetX) =>
                        updateActiveCustomTextStyle({ offsetX })
                      }
                    />
                    <ControlRow
                      label="Move Y"
                      max={posterViewBoxHeight}
                      min={0}
                      step={1}
                      value={Math.round(activeStyle.offsetY)}
                      onChange={(offsetY) =>
                        updateActiveCustomTextStyle({ offsetY })
                      }
                    />
                    <ControlRow
                      label="Scale"
                      max={3}
                      min={0.25}
                      step={0.01}
                      value={Number(activeStyle.scale.toFixed(2))}
                      onChange={(scale) =>
                        updateActiveCustomTextStyle({ scale })
                      }
                    />
                    <ControlRow
                      label="Rotate"
                      max={180}
                      min={-180}
                      step={1}
                      value={activeStyle.rotation}
                      onChange={(rotation) =>
                        updateActiveCustomTextStyle({ rotation })
                      }
                    />
                    <ColorInput
                      label="Text color"
                      value={activeStyle.color}
                      onChange={(color) =>
                        updateActiveCustomTextStyle({ color })
                      }
                    />
                  </>
                ) : (
                  <Button
                    className={cn(wallArtPillButtonClassName, "h-10 w-full text-[13px] font-bold")}
                    type="button"
                    onClick={addCustomText}
                  >
                    <Plus className="size-4" />
                    Add text
                  </Button>
                )}
              </div>
            ) : (
              <div className={wallArtEditorSectionClassName}>
                <div className="flex items-center gap-2 text-[13px] font-black text-[#241b16]">
                  <Type className="size-4 text-[#b56e4f]" />
                  Text layer
                </div>
                {activeTextTarget === "lyrics" ? (
                  <div className="space-y-2">
                    <Label>Lyrics</Label>
                    <Textarea
                      className={cn(wallArtTextareaClassName, "h-48 min-h-24 resize-none")}
                      value={lyricText}
                      onChange={(event) =>
                        setLyricText(cleanWallArtLyrics(event.target.value))
                      }
                    />
                  </div>
                ) : activeTemplate === "template2" &&
                  activeTextTarget === "title" ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Song title line 1</Label>
                      <Input
                        className={wallArtFieldClassName}
                        value={template2TitleLine1}
                        onChange={(event) =>
                          updateTemplate2Title(
                            event.target.value,
                            template2TitleLine2,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Song title line 2</Label>
                      <Input
                        className={wallArtFieldClassName}
                        placeholder="Optional"
                        value={template2TitleLine2}
                        onChange={(event) =>
                          updateTemplate2Title(
                            template2TitleLine1,
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>
                      {(activeTemplate === "template2" ||
                        activeTemplate === "imageLyrics") &&
                      activeTextTarget === "title"
                        ? "Song title"
                        : (activeTemplate === "template2" ||
                              activeTemplate === "imageLyrics") &&
                            activeTextTarget === "subtitle"
                          ? "Artist name"
                          : (activeTemplate === "template2" ||
                                activeTemplate === "imageLyrics") &&
                              activeTextTarget === "description"
                            ? "Album name"
                            : "Text"}
                    </Label>
                    <Input
                      className={wallArtFieldClassName}
                      value={
                        activeTextTarget === "title"
                          ? title
                          : activeTextTarget === "subtitle"
                            ? subtitle
                            : description
                      }
                      onChange={(event) => {
                        if (activeTextTarget === "title")
                          setTitle(event.target.value);
                        if (activeTextTarget === "subtitle")
                          setSubtitle(event.target.value);
                        if (activeTextTarget === "description")
                          setDescription(event.target.value);
                      }}
                    />
                  </div>
                )}
                <FontSelect
                  value={activeStyle.fontFamily}
                  onChange={(value) =>
                    updateStyle(activeTextTarget, { fontFamily: value })
                  }
                />
                <FontWeightSelect
                  value={activeStyle.fontWeight}
                  onChange={(fontWeight) =>
                    updateStyle(activeTextTarget, { fontWeight })
                  }
                />
                <ControlRow
                  label="Font size"
                  max={
                    activeTemplate === "heart" && activeTextTarget === "lyrics"
                      ? 40
                      : activeTextTarget === "lyrics"
                        ? 30
                        : 76
                  }
                  min={
                    activeTemplate === "heart" && activeTextTarget === "lyrics"
                      ? 20
                      : activeTextTarget === "lyrics"
                        ? 10
                        : 10
                  }
                  value={activeStyle.fontSize}
                  onChange={(fontSize) =>
                    updateStyle(activeTextTarget, { fontSize })
                  }
                />
                {activeTextTarget === "lyrics" &&
                  activeTemplate === "spiral" && (
                    <ControlRow
                      label="Text radius"
                      max={490}
                      min={260}
                      value={textOuterRadius}
                      onChange={setTextOuterRadius}
                    />
                  )}
                {activeTextTarget !== "lyrics" && (
                  <>
                    <ControlRow
                      label="Move X"
                      max={420}
                      min={-420}
                      step={1}
                      value={activeStyle.offsetX}
                      onChange={(offsetX) =>
                        updateStyle(activeTextTarget, { offsetX })
                      }
                    />
                    <ControlRow
                      label="Move Y"
                      max={420}
                      min={-420}
                      step={1}
                      value={activeStyle.offsetY}
                      onChange={(offsetY) =>
                        updateStyle(activeTextTarget, { offsetY })
                      }
                    />
                    <ControlRow
                      label="Scale"
                      max={2.2}
                      min={0.35}
                      step={0.01}
                      value={Number(activeStyle.scale.toFixed(2))}
                      onChange={(scale) =>
                        updateStyle(activeTextTarget, { scale })
                      }
                    />
                    <ControlRow
                      label="Rotate"
                      max={180}
                      min={-180}
                      step={1}
                      value={activeStyle.rotation}
                      onChange={(rotation) =>
                        updateStyle(activeTextTarget, { rotation })
                      }
                    />
                  </>
                )}
                <ColorInput
                  label="Text color"
                  value={activeStyle.color}
                  onChange={(color) => updateStyle(activeTextTarget, { color })}
                />
              </div>
            )}

            <Separator className="my-6 bg-white/45" />
            <div className={cn(wallArtInfoCardClassName, "space-y-2.5")}>
              <div className="flex items-center gap-2 text-[13px] font-black text-[#241b16]">
                <Palette className="size-4 text-[#b56e4f]" />
                Quick note
              </div>
              <p className="text-[11px] leading-4.5 text-[#76695d]">
                Click any text on the poster to switch the right panel to that
                layer. The current version focuses on the spiral lyric template
                from the reference.
              </p>
            </div>
          </aside>
        </div>
        ) : (
          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-6 py-10">
            <div className={cn(wallArtGlassPanelClassName, "w-full max-w-md p-6 text-center")}>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.96),rgba(255,247,241,0.62)_42%,rgba(232,198,176,0.34)_100%)] text-[#b56e4f] shadow-[0_14px_24px_rgba(181,110,79,0.14),inset_0_1px_0_rgba(255,255,255,0.84)]">
                <Disc3 className="size-4.5" />
              </div>
              <h3 className="mt-4 text-[1.7rem] font-black tracking-[-0.03em] text-[#241b16]">
                Create a song first
              </h3>
              <p className="mt-3 text-[13px] leading-6 text-[#76695d]">
                Wall Art Studio uses your finalized song title, lyrics, cover
                art, and share link to build printable keepsakes.
              </p>
              <Button asChild className={cn(wallArtPrimaryButtonClassName, "mt-5 h-10 px-5 text-[13px] font-bold")}>
                <Link href="/create-song">Create Song</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
      </Sheet>
    </>
  );
}
