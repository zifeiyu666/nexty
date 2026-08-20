import { WallArtStudioCta } from "@/components/song/WallArtStudioCta";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  Check,
  Download,
  Frame,
  Gift,
  Heart,
  LayoutTemplate,
  Music2,
  Palette,
  PenLine,
  Printer,
  Type,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

type LandingVariant = "wall-art" | "poster-maker";

type LyricArtLandingPageProps = {
  isAuthenticated: boolean;
  songOptions: WallArtSongOption[];
  variant: LandingVariant;
};

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
};

type UseCase = {
  title: string;
  description: string;
};

type Faq = {
  question: string;
  answer: string;
};

const previewImages = [
  {
    src: "https://cdn.sendthesong.io/products/wall-art-01.webp",
    alt: "Custom song lyrics wall art in a portrait frame",
    className: "md:translate-y-10",
  },
  {
    src: "https://cdn.sendthesong.io/products/wall-art-14.webp",
    alt: "Framed song lyrics wall art in a landscape layout",
    className: "",
  },
  {
    src: "https://cdn.sendthesong.io/products/wall-art-07.webp",
    alt: "Personalized lyric wall decor preview",
    className: "md:translate-y-16",
  },
];

const wallArtFeatures: Feature[] = [
  {
    title: "Personal details, beautifully set",
    description:
      "Add the song title, names, a meaningful date, and the lyrics that belong to your story.",
    icon: <PenLine className="size-5" />,
  },
  {
    title: "Made to look at home",
    description:
      "Choose record-inspired, heart-shaped, photo lyric, and modern typography layouts.",
    icon: <Frame className="size-5" />,
  },
  {
    title: "Ready for your favorite frame",
    description:
      "Export a high-resolution digital design for home printing or your preferred print shop.",
    icon: <Printer className="size-5" />,
  },
];

const posterFeatures: Feature[] = [
  {
    title: "Fast poster layouts",
    description:
      "Start with a polished lyric template instead of arranging every line from a blank canvas.",
    icon: <LayoutTemplate className="size-5" />,
  },
  {
    title: "Aesthetic typography controls",
    description:
      "Adjust lyrics, colors, spacing, imagery, framing, and the visual balance of your design.",
    icon: <Type className="size-5" />,
  },
  {
    title: "Printable digital output",
    description:
      "Create a high-resolution custom music poster that is ready to save, print, and frame.",
    icon: <Download className="size-5" />,
  },
];

const wallArtUseCases: UseCase[] = [
  {
    title: "Wedding & first dance",
    description:
      "Frame the lyrics from the song that opened the dance floor—or create a new custom wedding song from your story.",
  },
  {
    title: "Anniversary gift",
    description:
      "Pair names, dates, and meaningful lyrics in a personalized keepsake made for the life you share.",
  },
  {
    title: "Bedroom or music room",
    description:
      "Turn a favorite track into lyric wall decor that feels considered, personal, and easy to display.",
  },
  {
    title: "Birthday & milestone",
    description:
      "Celebrate a person, year, or memory with a printable lyric design that goes beyond an ordinary card.",
  },
];

const posterUseCases: UseCase[] = [
  {
    title: "Minimalist lyric poster",
    description:
      "Use quiet type, spacious composition, and restrained color for a modern gallery-style print.",
  },
  {
    title: "Aesthetic music poster",
    description:
      "Combine bold typography, album-inspired color, and a record motif for a more expressive design.",
  },
  {
    title: "Printable personalized gift",
    description:
      "Add a name, date, or short dedication and download a poster for weddings, birthdays, or anniversaries.",
  },
  {
    title: "Original song keepsake",
    description:
      "Create a song from your own story, then turn the finished lyrics into a one-of-a-kind poster.",
  },
];

const wallArtFaqs: Faq[] = [
  {
    question: "What can I personalize on my song lyrics wall art?",
    answer:
      "You can use your finalized song lyrics, title, cover image, names, dates, colors, framing, and layout controls available in the Wall Art Studio.",
  },
  {
    question: "Can I create framed song lyrics wall art?",
    answer:
      "The studio creates a high-resolution printable digital file. You can print it at home or through a print shop, then place it in a frame that matches your space.",
  },
  {
    question: "What if I have a story but no song or lyrics yet?",
    answer:
      "Start with our custom song flow. Share the recipient, occasion, memories, and mood; once your song is finalized, you can bring its lyrics directly into the wall art editor.",
  },
  {
    question: "Can I make wedding or anniversary lyric wall art?",
    answer:
      "Yes. First-dance songs, vows, anniversary songs, and meaningful relationship lyrics work especially well with names and a special date added to the design.",
  },
  {
    question: "Do I need design experience?",
    answer:
      "No. Choose a template, select your song, and adjust the visual controls while the editor shows a live preview of the artwork.",
  },
];

const posterFaqs: Faq[] = [
  {
    question: "How do I make a song lyrics poster?",
    answer:
      "Open the poster studio, select one of your finalized songs, choose a layout, customize the type and artwork, then export the finished poster.",
  },
  {
    question: "Can I create an aesthetic lyric poster?",
    answer:
      "Yes. The templates include record-style, heart lyric, photo lyric, and typography-led compositions with editable colors and visual settings.",
  },
  {
    question: "Can I download and print my custom music poster?",
    answer:
      "Yes. The editor is designed to export high-resolution artwork that can be printed at home or through a local or online print shop.",
  },
  {
    question: "What if I do not have lyrics yet?",
    answer:
      "Use the custom song creator to turn your story into an original song first. Once it is finalized, its title, lyrics, artwork, and share link become available to the poster editor.",
  },
  {
    question: "Can I add a name, date, or custom message?",
    answer:
      "The available templates let you edit the visible lyric text and supporting design details, so you can shape the poster around the person or moment it celebrates.",
  },
];

function StudioButton({
  isAuthenticated,
  label,
  songOptions,
  variant = "dark",
}: {
  isAuthenticated: boolean;
  label: string;
  songOptions: WallArtSongOption[];
  variant?: "dark" | "light";
}) {
  const className =
    variant === "dark"
      ? "group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#251a15] px-7 text-sm font-black text-white shadow-[0_18px_42px_rgba(37,26,21,0.2)] transition hover:-translate-y-0.5 hover:bg-[#3b2921]"
      : "group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#fff8ed] px-7 text-sm font-black text-[#251a15] shadow-[0_18px_42px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-white";

  return (
    <WallArtStudioCta
      className={className}
      isAuthenticated={isAuthenticated}
      label={label}
      songOptions={songOptions}
    />
  );
}

function PreviewComposition({ variant }: { variant: LandingVariant }) {
  return (
    <div className="relative mx-auto min-h-[460px] w-full max-w-[650px] sm:min-h-[570px]">
      <div
        className={`absolute inset-x-[8%] bottom-0 top-[10%] rounded-[2rem] ${
          variant === "wall-art" ? "bg-[#dfe8df]" : "bg-[#cfe7df]"
        }`}
      />
      <div className="absolute left-[5%] top-[4%] w-[43%] -rotate-3 overflow-hidden rounded-sm border-[7px] border-[#f8f1e7] bg-white shadow-[0_30px_70px_rgba(44,29,20,0.25)] sm:border-[10px]">
        <div className="relative aspect-[0.557]">
          <Image
            alt="Personalized song lyrics wall art preview"
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 24vw, 42vw"
            src="https://cdn.sendthesong.io/products/wall-art-01.webp"
          />
        </div>
      </div>
      <div className="absolute right-[3%] top-[16%] w-[47%] rotate-2 overflow-hidden rounded-sm border-[7px] border-[#2b211c] bg-[#2b211c] shadow-[0_34px_76px_rgba(44,29,20,0.3)] sm:border-[10px]">
        <div className="relative aspect-[0.7]">
          <Image
            alt="Aesthetic lyric poster with custom song lyrics"
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 26vw, 45vw"
            src="https://cdn.sendthesong.io/products/wall-art-07.webp"
          />
        </div>
      </div>
      <div className="absolute bottom-[3%] left-[22%] w-[60%] -rotate-1 overflow-hidden rounded-sm border-[7px] border-white bg-white shadow-[0_30px_74px_rgba(44,29,20,0.28)] sm:border-[10px]">
        <div className="relative aspect-[1.86]">
          <Image
            alt="Custom music poster printable landscape design"
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 32vw, 58vw"
            src="https://cdn.sendthesong.io/products/wall-art-14.webp"
          />
        </div>
      </div>
      <div className="absolute right-[1%] top-[3%] flex size-16 rotate-6 items-center justify-center rounded-full bg-[#f4c76b] text-[#2a1c16] shadow-xl sm:size-20">
        {variant === "wall-art" ? (
          <Heart className="size-7 fill-current sm:size-9" />
        ) : (
          <Type className="size-7 sm:size-9" />
        )}
      </div>
    </div>
  );
}

export default function LyricArtLandingPage({
  isAuthenticated,
  songOptions,
  variant,
}: LyricArtLandingPageProps) {
  const isWallArt = variant === "wall-art";
  const features = isWallArt ? wallArtFeatures : posterFeatures;
  const useCases = isWallArt ? wallArtUseCases : posterUseCases;
  const faqs = isWallArt ? wallArtFaqs : posterFaqs;
  const studioLabel = isWallArt
    ? "Create your lyric wall art"
    : "Make a lyric poster";

  return (
    <div className="w-full overflow-hidden bg-[#fbf7f0] text-[#271b16]">
      <section className="relative isolate px-5 pb-16 pt-12 sm:px-8 md:pb-24 md:pt-16 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_8%,rgba(244,199,107,0.25),transparent_27%),radial-gradient(circle_at_88%_20%,rgba(139,190,173,0.24),transparent_32%),linear-gradient(135deg,#fffaf3_0%,#f8f2e9_55%,#eef5ef_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] [background-image:linear-gradient(rgba(39,27,22,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(39,27,22,0.1)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div
          className={`mx-auto grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-8 ${
            isWallArt ? "max-w-6xl" : "max-w-7xl"
          }`}
        >
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d8cbbb] bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#80614e] shadow-sm backdrop-blur">
              {isWallArt ? (
                <Frame className="size-4" />
              ) : (
                <LayoutTemplate className="size-4" />
              )}
              {isWallArt
                ? "Personalized music keepsakes"
                : "Online lyric design studio"}
            </p>

            <h1 className="mt-6 max-w-[11ch] text-balance text-[2.75rem] font-black leading-[0.96] tracking-[-0.045em] sm:text-[3.8rem] lg:text-[4.7rem]">
              {isWallArt
                ? "Create Custom Song Lyrics Wall Art"
                : "Song Lyrics Poster Maker"}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#6f6158] sm:text-lg sm:leading-8">
              {isWallArt
                ? "Turn the song that means the most into personalized lyric wall decor. Customize the lyrics, title, colors, artwork, and layout, then export a print-ready keepsake made for your favorite frame."
                : "Design an aesthetic lyric poster online in minutes. Choose a template, customize the typography and artwork, then download a high-resolution custom music poster ready to print."}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <StudioButton
                isAuthenticated={isAuthenticated}
                label={studioLabel}
                songOptions={songOptions}
              />
              <Link
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#cfc0b2] bg-white/65 px-6 text-sm font-black text-[#5b463b] transition hover:bg-white"
                href="/create-song?step=recipient"
              >
                Create a custom song first
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-[#6a5b52]">
              {[
                "Live design preview",
                "Editable lyric layouts",
                "High-resolution export",
              ].map((item) => (
                <span className="inline-flex items-center gap-2" key={item}>
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#d8ece4] text-[#216b5e]">
                    <Check className="size-3.5" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm text-[#74645b]">
              {isWallArt
                ? "Prefer a faster poster workflow? "
                : "Planning a framed keepsake? "}
              <Link
                className="font-black text-[#8f5239] underline decoration-[#d9ad99] underline-offset-4 transition hover:text-[#5f3022]"
                href={
                  isWallArt
                    ? "/lyric-poster-maker"
                    : "/custom-song-lyrics-wall-art"
                }
              >
                {isWallArt
                  ? "Try the lyric poster maker"
                  : "Explore custom song lyrics wall art"}
              </Link>
              .
            </p>
          </div>

          <PreviewComposition variant={variant} />
        </div>
      </section>

      <section className="border-y border-[#eadfd4] bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a16245]">
                {isWallArt ? "Made from your song" : "Designed in your browser"}
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
                {isWallArt
                  ? "Personalized wall art, without the generic gift feeling"
                  : "Everything you need to make lyrics look print-ready"}
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#76685f] sm:text-lg">
              {isWallArt
                ? "A favorite song already carries the memory. The editor helps you give those words a physical presence through considered typography, personal details, and layouts that feel at home on a real wall."
                : "The poster maker uses the same focused Wall Art Studio behind our personalized keepsakes, so you can move quickly from finalized lyrics to an intentional poster composition."}
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article
                className="rounded-[1.5rem] border border-[#eadfd4] bg-[#fdfaf6] p-7 shadow-[0_18px_45px_rgba(58,34,21,0.06)]"
                key={feature.title}
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#dceee7] text-[#246f61]">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-xl font-black tracking-[-0.02em]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#76685f]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#261a15] px-5 py-16 text-white sm:px-8 md:py-24 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f1c66f]">
              How it works
            </p>
            <h2 className="mt-3 text-balance text-3xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
              {isWallArt
                ? "From a meaningful song to art for your wall"
                : "Build a printable lyric poster in four simple steps"}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
              {isWallArt
                ? "Use a song you have already finalized with us, or begin with the story behind the gift and create an original custom song first."
                : "Your finalized custom songs are ready inside the studio, including their lyrics, cover artwork, and share link."}
            </p>
          </div>

          <ol className="grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 sm:grid-cols-2">
            {[
              {
                number: "01",
                title: isWallArt ? "Choose your song" : "Open a song",
                text: isWallArt
                  ? "Select a finalized song and bring its title, lyrics, artwork, and story into the studio."
                  : "Select one of your finalized songs, complete with the lyrics you want to design.",
              },
              {
                number: "02",
                title: "Pick a layout",
                text: "Start with a record poster, heart lyric design, photo lyric portrait, or typography composition.",
              },
              {
                number: "03",
                title: "Make it yours",
                text: "Adjust the visible lyrics, colors, scale, image treatment, framing, and print settings.",
              },
              {
                number: "04",
                title: "Export and print",
                text: "Save a high-resolution design for home printing, a print shop, or the frame you already love.",
              },
            ].map((step) => (
              <li className="bg-[#30211b] p-7 sm:min-h-52" key={step.number}>
                <span className="font-mono text-sm font-bold text-[#f1c66f]">
                  {step.number}
                </span>
                <h3 className="mt-8 text-xl font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#eef4ef] px-5 py-16 sm:px-8 md:py-24 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#35796b]">
              Design inspiration
            </p>
            <h2 className="mt-3 text-balance text-3xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
              {isWallArt
                ? "Custom lyric wall decor for the moments people keep"
                : "Aesthetic lyric poster styles for every kind of song"}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {previewImages.map((image, index) => (
              <figure className={`group ${image.className}`} key={image.src}>
                <div
                  className={`relative overflow-hidden rounded-xl bg-[#ded8cf] shadow-[0_22px_55px_rgba(37,26,21,0.16)] ${
                    index === 1
                      ? "aspect-[1.86] md:aspect-[0.72]"
                      : "aspect-[0.62]"
                  }`}
                >
                  <Image
                    alt={image.alt}
                    className="object-cover transition duration-500 group-hover:scale-[1.025]"
                    fill
                    sizes="(min-width: 768px) 31vw, 48vw"
                    src={image.src}
                  />
                </div>
              </figure>
            ))}
          </div>

          <div className="mt-24 grid gap-5 sm:grid-cols-2">
            {useCases.map((useCase, index) => (
              <article
                className="flex gap-5 border-t border-[#cfded5] py-6"
                key={useCase.title}
              >
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#35796b] shadow-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-black tracking-[-0.02em]">
                    {useCase.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#68766f]">
                    {useCase.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf4] px-5 py-16 sm:px-8 md:py-24 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-[#e9b957] shadow-[0_28px_80px_rgba(83,50,22,0.16)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 sm:p-12 lg:p-14">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#694318]">
              No lyrics yet?
            </p>
            <h2 className="mt-3 max-w-[12ch] text-balance text-3xl font-black leading-tight tracking-[-0.035em] sm:text-5xl">
              Start with your story, not a song title.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#684a27] sm:text-lg">
              Tell us about the person, occasion, memories, and feeling you want
              to capture. We will help turn those details into an original
              custom song, ready to bring back here as lyric art.
            </p>
            <Link
              className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#271b16] px-7 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#3c2b23]"
              href="/create-song?step=recipient"
            >
              Generate a song from your story
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="relative min-h-80 overflow-hidden bg-[#d9a94d] lg:min-h-full">
            <Image
              alt="Personal story becoming a custom song and printable lyric art"
              className="object-cover object-center mix-blend-multiply"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              src="https://cdn.sendthesong.io/products/wall-art-18.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#e9b957]/55 via-transparent to-transparent lg:bg-gradient-to-r" />
            <div className="absolute bottom-6 right-6 flex items-center gap-3 rounded-full bg-white/90 px-5 py-3 text-sm font-black shadow-xl backdrop-blur">
              <Music2 className="size-5 text-[#a15a3c]" />
              Story → song → lyric art
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#eadfd4] bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a16245]">
              Helpful details
            </p>
            <h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.03em] sm:text-5xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-10 divide-y divide-[#e8ddd3] border-y border-[#e8ddd3]">
            {faqs.map((faq) => (
              <details className="group py-1" key={faq.question}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left text-lg font-black marker:hidden sm:text-xl">
                  {faq.question}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f3ece4] text-xl font-medium transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-3xl pb-6 pr-12 text-base leading-7 text-[#76685f]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#261a15] px-5 py-16 text-center text-white sm:px-8 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f1c66f] text-[#261a15]">
            {isWallArt ? (
              <Gift className="size-6" />
            ) : (
              <Palette className="size-6" />
            )}
          </div>
          <h2 className="mt-6 text-balance text-3xl font-black tracking-[-0.03em] sm:text-5xl">
            {isWallArt
              ? "Make the song part of the room"
              : "Make your lyrics worth displaying"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            {isWallArt
              ? "Open your finalized song in the studio and create personalized lyric wall art ready to print and frame."
              : "Choose a song, explore the layouts, and export a custom music poster with your own visual direction."}
          </p>
          <div className="mt-8 flex justify-center">
            <StudioButton
              isAuthenticated={isAuthenticated}
              label={studioLabel}
              songOptions={songOptions}
              variant="light"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
