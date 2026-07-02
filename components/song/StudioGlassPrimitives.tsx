import { SheetClose, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const studioGlassStyles = {
  sheetContent:
    "w-screen max-w-none gap-0 overflow-visible border-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.58),transparent_32%),linear-gradient(180deg,#f6f1eb_0%,#ede5dc_38%,#e8ded4_100%)] p-0 sm:max-w-none [&>button:last-child]:hidden",
  header:
    "relative z-10 mx-2 mt-2 rounded-[12px] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(247,241,233,0.66))] px-3 py-2 shadow-[0_12px_26px_rgba(70,53,38,0.095),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-2xl sm:mx-2.5 sm:mt-2.5 sm:px-3.5 lg:mx-3 lg:px-4",
  headerIcon:
    "flex size-8 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(255,247,241,0.62)_42%,rgba(232,198,176,0.34)_100%)] text-[#b56e4f] shadow-[0_9px_18px_rgba(181,110,79,0.13),inset_0_1px_0_rgba(255,255,255,0.84)]",
  headerTitle:
    "shrink-0 text-[1.1rem] font-black tracking-[-0.03em] text-[#241b16]",
  headerDescription:
    "max-w-[28rem] text-[11px] leading-4 text-[#75695d] lg:truncate",
  panel:
    "rounded-[12px] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,241,233,0.64))] shadow-[0_14px_34px_rgba(70,53,38,0.095),0_1px_0_rgba(255,255,255,0.4)_inset,0_0_0_1px_rgba(255,255,255,0.16)_inset] backdrop-blur-2xl",
  subtlePanel:
    "rounded-[10px] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(250,246,240,0.54))] shadow-[0_9px_20px_rgba(72,56,41,0.075),0_1px_0_rgba(255,255,255,0.64)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-xl",
  field:
    "h-8 rounded-[10px] border-none bg-white/72 px-2.5 text-[11.5px] font-semibold text-[#302720] shadow-[0_7px_15px_rgba(70,53,38,0.07),0_1px_0_rgba(255,255,255,0.76)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-xl transition placeholder:text-[#9a8e82] focus-visible:ring-[#c9bbac]/40",
  textarea:
    "rounded-[10px] border-none bg-white/72 px-2.5 py-2 text-[11.5px] leading-4.5 text-[#302720] shadow-[0_8px_17px_rgba(70,53,38,0.075),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-xl transition placeholder:text-[#9a8e82] focus-visible:ring-[#c9bbac]/40",
  popover:
    "rounded-[12px] border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(246,240,232,0.8))] p-1 shadow-[0_16px_42px_rgba(56,41,29,0.15),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-2xl",
  pillButton:
    "rounded-full border-none bg-white/68 text-[11px] font-bold text-[#4a4038] shadow-[0_7px_15px_rgba(70,53,38,0.07),0_1px_0_rgba(255,255,255,0.74)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-xl transition hover:bg-white/88 hover:text-[#241b16]",
  pillButtonActive:
    "rounded-full border-none bg-[#2d2622] text-[11px] font-bold text-[#f7f0e6] shadow-[0_10px_20px_rgba(45,38,34,0.2)] hover:bg-[#2d2622] hover:text-[#f7f0e6]",
  primaryButton:
    "rounded-full border-none bg-[#2f2823] px-3.5 text-[11.5px] text-[#faf4eb] shadow-[0_12px_23px_rgba(45,38,34,0.19)] transition hover:bg-[#26201d] hover:text-white",
  secondaryButton:
    "rounded-full border-none bg-white/74 text-[11.5px] text-[#2f2722] shadow-[0_7px_15px_rgba(70,53,38,0.075),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-xl transition hover:bg-white",
  editorSection:
    "space-y-2.5 rounded-[10px] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,243,237,0.54))] p-2.5 shadow-[0_10px_24px_rgba(70,53,38,0.07),0_1px_0_rgba(255,255,255,0.74)_inset,0_0_0_1px_rgba(255,255,255,0.1)_inset] backdrop-blur-xl",
  infoCard:
    "rounded-[8px] bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(248,243,237,0.42))] p-2 shadow-[0_8px_17px_rgba(70,53,38,0.052),0_1px_0_rgba(255,255,255,0.72)_inset,0_0_0_1px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl",
  templateCard:
    "w-full overflow-hidden rounded-[10px] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,243,237,0.62))] text-left shadow-[0_10px_22px_rgba(70,53,38,0.075),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.1)_inset] transition duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_14px_26px_rgba(70,53,38,0.11)]",
  templateThumb:
    "aspect-[3/6] max-h-[10.5rem] w-full overflow-hidden bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_6px_14px_rgba(63,47,33,0.075)]",
  templatePopover:
    "fixed z-[150] hidden max-h-[calc(100svh-118px)] w-[220px] overflow-y-auto rounded-[12px] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,240,232,0.78))] p-1.5 shadow-[0_22px_52px_rgba(56,41,29,0.23),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.14)_inset] backdrop-blur-2xl transition",
  templatePresetCard:
    "overflow-hidden rounded-[8px] bg-white/74 shadow-[0_8px_17px_rgba(64,48,34,0.075),0_1px_0_rgba(255,255,255,0.76)_inset,0_0_0_1px_rgba(255,255,255,0.1)_inset] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_22px_rgba(64,48,34,0.11)]",
  scrollArea:
    "min-h-0 [&>[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-1.5 [&>[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:border-l-0 [&>[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:p-0 [&>[data-slot=scroll-area-scrollbar]]:z-10 [&>[data-slot=scroll-area-scrollbar]]:opacity-100 [&>[data-slot=scroll-area-scrollbar]]:transition-opacity [&>[data-slot=scroll-area-scrollbar]:hover>[data-slot=scroll-area-thumb]]:bg-[#ad8a57]/80 [&>[data-slot=scroll-area-thumb]]:rounded-full [&>[data-slot=scroll-area-thumb]]:bg-[linear-gradient(180deg,rgba(210,189,158,0.92),rgba(162,137,101,0.88))] [&>[data-slot=scroll-area-thumb]]:shadow-[0_0_0_1px_rgba(255,248,236,0.72)_inset]",
  scrollAreaViewport:
    "[&>[data-slot=scroll-area-viewport]]:rounded-[inherit]",
  sectionHeading:
    "text-[9px] font-black uppercase tracking-[0.15em] text-[#8f7f72]",
  controlTitle:
    "text-[11.5px] font-black tracking-[-0.01em] text-[#241b16]",
  controlDescription:
    "mt-0.5 text-[10px] leading-3.5 text-[#76695d]",
  microButton:
    "rounded-full border-none bg-white/72 text-[11px] font-bold text-[#322821] shadow-[0_6px_14px_rgba(70,53,38,0.075),0_1px_0_rgba(255,255,255,0.78)_inset,0_0_0_1px_rgba(255,255,255,0.1)_inset] backdrop-blur-xl transition hover:bg-white",
  floatingAction:
    "group absolute right-2 top-2 z-20 h-8 rounded-[11px] bg-[linear-gradient(180deg,rgba(43,34,29,0.76),rgba(31,24,21,0.92))] px-3 text-[10.5px] font-black text-[#fff8f0] shadow-[0_16px_34px_rgba(29,22,19,0.23),0_1px_0_rgba(255,255,255,0.18)_inset] backdrop-blur-2xl transition hover:scale-[1.02] hover:bg-[linear-gradient(180deg,rgba(49,39,33,0.8),rgba(34,27,23,0.96))] hover:text-white sm:right-2.5 sm:top-2.5 sm:h-9 sm:px-3.5 sm:text-[11px]",
  selectContentItems:
    "[&_[data-slot=select-item]]:rounded-[8px] [&_[data-slot=select-item]]:py-1.5 [&_[data-slot=select-item]]:pl-3.5 [&_[data-slot=select-item]]:pr-11 [&_[data-slot=select-item]]:text-[11.5px] [&_[data-slot=select-item]>span:first-child]:right-4 [&_[data-slot=select-item][data-state=checked]]:bg-[#2d2622] [&_[data-slot=select-item][data-state=checked]]:text-[#f7f0e6]",
  slider:
    "[&_[data-slot=slider-range]]:bg-[#362e28] [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-none [&_[data-slot=slider-thumb]]:bg-[#fff8f1] [&_[data-slot=slider-thumb]]:shadow-[0_6px_12px_rgba(53,40,30,0.18),0_0_0_1px_rgba(255,255,255,0.72)_inset] [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-white/65",
} as const;

export function getStudioTemplateCardClassName(active: boolean) {
  return cn(
    studioGlassStyles.templateCard,
    active
      ? "relative bg-[linear-gradient(180deg,rgba(255,248,236,1),rgba(248,233,204,0.98))] text-[#1f1713] shadow-[inset_0_2px_6px_rgba(255,255,255,0.92),inset_0_0_0_2px_rgba(227,154,35,0.92),inset_0_-12px_22px_rgba(236,175,55,0.42),0_10px_20px_rgba(70,53,38,0.12)]"
      : "text-[#312821]",
  );
}

export function getStudioTemplatePresetCardClassName(active: boolean) {
  return cn(
    studioGlassStyles.templatePresetCard,
    active
      ? "bg-white shadow-[0_16px_32px_rgba(64,48,34,0.14),inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(45,38,34,0.06)_inset]"
      : "",
  );
}

export function getStudioPillButtonClassName(active = false) {
  return active
    ? studioGlassStyles.pillButtonActive
    : studioGlassStyles.pillButton;
}

export function StudioBlurBackdrop({
  imageUrl,
}: {
  imageUrl?: string | null;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {imageUrl ? (
        <>
          <div
            className="absolute inset-[-10%] scale-[1.12] bg-center bg-cover opacity-78 blur-[28px] saturate-[1.12]"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.1),transparent_32%),linear-gradient(180deg,rgba(246,241,235,0.26)_0%,rgba(239,231,221,0.4)_34%,rgba(233,224,213,0.52)_100%)] backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(221,197,180,0.02)_42%,rgba(95,74,57,0.04)_100%)] mix-blend-soft-light" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.48),transparent_32%),linear-gradient(180deg,rgba(246,241,235,0.96)_0%,rgba(239,231,221,0.96)_38%,rgba(233,224,213,0.98)_100%)]" />
      )}
    </div>
  );
}

export function StudioCloseButton({
  label,
}: {
  label: string;
}) {
  return (
    <SheetClose asChild>
      <button
        aria-label={label}
        className="group flex size-9 shrink-0 items-center justify-center rounded-full border-none bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(245,238,230,0.22))] text-[#5c4e43] shadow-[0_9px_18px_rgba(66,51,37,0.08),0_1px_0_rgba(255,255,255,0.5)_inset,0_0_0_1px_rgba(255,255,255,0.1)_inset] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(249,242,234,0.3))] hover:text-[#2f2520] hover:shadow-[0_14px_24px_rgba(66,51,37,0.13),0_1px_0_rgba(255,255,255,0.58)_inset] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
        type="button"
      >
        <X className="size-4 transition duration-200 group-hover:rotate-90 group-hover:scale-110" />
      </button>
    </SheetClose>
  );
}

export function StudioHeader({
  action,
  closeLabel,
  description,
  icon: Icon,
  title,
}: {
  action?: ReactNode;
  closeLabel: string;
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <SheetHeader className={studioGlassStyles.header}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className={studioGlassStyles.headerIcon}>
              <Icon className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-col lg:flex-row lg:items-baseline lg:gap-2">
              <SheetTitle className={studioGlassStyles.headerTitle}>
                {title}
              </SheetTitle>
              <SheetDescription className={studioGlassStyles.headerDescription}>
                {description}
              </SheetDescription>
            </div>
          </div>
          {action}
        </div>
        <StudioCloseButton label={closeLabel} />
      </div>
    </SheetHeader>
  );
}
