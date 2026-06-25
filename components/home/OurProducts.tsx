"use client";

import { type FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { MusicVideoStudioCta } from "@/components/song/MusicVideoStudioCta";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { WallArtStudioCta } from "@/components/song/WallArtStudioCta";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { type MouseEvent } from "react";

const productKeys = ["customSong", "videoGift", "wallArt"] as const;

const productImages: Record<
  (typeof productKeys)[number],
  {
    src: string;
    objectPosition?: string;
  }
> = {
  customSong: {
    src: "/images/products/prd3.png",
    objectPosition: "center",
  },
  videoGift: {
    src: "/images/products/prd1.png",
    objectPosition: "center",
  },
  wallArt: {
    src: "/images/products/prd2.jpg",
    objectPosition: "center",
  },
};

const productHrefs: Record<(typeof productKeys)[number], string> = {
  customSong: "/create-song",
  videoGift: "/musicvideos",
  wallArt: "/create-song",
};

const resetProductMagnet = (card: HTMLElement) => {
  card.style.setProperty("--product-magnet-x", "0px");
  card.style.setProperty("--product-magnet-y", "0px");
  card.style.setProperty("--product-tilt-x", "0deg");
  card.style.setProperty("--product-tilt-y", "0deg");
};

const handleProductPointerMove = (event: MouseEvent<HTMLElement>) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  card.style.setProperty("--product-magnet-x", `${x * 18}px`);
  card.style.setProperty("--product-magnet-y", `${y * 14}px`);
  card.style.setProperty("--product-tilt-x", `${y * -6}deg`);
  card.style.setProperty("--product-tilt-y", `${x * 7}deg`);
};

type OurProductsProps = {
  isAuthenticated: boolean;
  musicVideoSongOptions: FinalSongPlayerData[];
  wallArtSongOptions: WallArtSongOption[];
};

export default function OurProducts({
  isAuthenticated,
  musicVideoSongOptions,
  wallArtSongOptions,
}: OurProductsProps) {
  const t = useTranslations("Landing.OurProducts");
  const ctaClassName =
    "mt-7 inline-flex items-center gap-2 text-base font-bold text-[#170A1E] transition hover:text-primary";

  return (
    <section id="our-products" className="bg-[#fbfaf7] py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            {t("eyebrow")}
          </p> */}
          <h2 className="preset-title">{t("title")}</h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[#625E68] md:text-lg">
            {t("description")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {productKeys.map((productKey) => {
            const image = productImages[productKey];

            return (
              <article
                key={productKey}
                onMouseMove={handleProductPointerMove}
                onMouseLeave={(event) => resetProductMagnet(event.currentTarget)}
                onBlur={(event) => resetProductMagnet(event.currentTarget)}
                className="group flex h-full min-h-[510px] flex-col overflow-hidden rounded-lg bg-white shadow-[0_18px_52px_rgba(36,27,18,0.08)] [--product-magnet-x:0px] [--product-magnet-y:0px] [--product-tilt-x:0deg] [--product-tilt-y:0deg] [transform:perspective(900px)_translate3d(var(--product-magnet-x),var(--product-magnet-y),0)_rotateX(var(--product-tilt-x))_rotateY(var(--product-tilt-y))_scale(var(--product-scale,1))] [transform-style:preserve-3d] transition-[transform,box-shadow] duration-300 ease-out hover:[--product-scale:1.035] hover:shadow-[0_30px_72px_rgba(36,27,18,0.16)] motion-reduce:[transform:none]"
              >
                <div className="relative aspect-[1.32/1] overflow-hidden bg-[#ede7df]">
                  <Image
                    src={image.src}
                    alt={t(`items.${productKey}.imageAlt`)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 ease-out group-hover:scale-[1.045]"
                    style={{ objectPosition: image.objectPosition }}
                  />
                  {/* <span className="absolute right-4 top-4 rounded-full bg-white/88 px-4 py-2 text-sm font-semibold text-[#4D4752] shadow-sm backdrop-blur">
                    {t(`items.${productKey}.label`)}
                  </span> */}
                </div>

                <div className="flex flex-1 flex-col items-center px-6 py-8 text-center md:px-7">
                  <h3 className="mt-2 text-[1.32rem] font-bold leading-[1.05] text-[#251913]">
                    {t(`items.${productKey}.title`)}
                  </h3>
                  {/* <p className="mt-3 text-base font-semibold text-[#6C6872]">
                    {t(`items.${productKey}.price`)}
                  </p> */}
                  <p className="mt-5 flex-1 text-sm leading-6 text-[#68636D]">
                    {t(`items.${productKey}.description`)}
                  </p>
                  {productKey === "wallArt" ? (
                    <WallArtStudioCta
                      className={ctaClassName}
                      isAuthenticated={isAuthenticated}
                      label={t(`items.${productKey}.cta`)}
                      songOptions={wallArtSongOptions}
                    />
                  ) : productKey === "videoGift" ? (
                    <MusicVideoStudioCta
                      className={ctaClassName}
                      isAuthenticated={isAuthenticated}
                      label={t(`items.${productKey}.cta`)}
                      songOptions={musicVideoSongOptions}
                    />
                  ) : (
                    <Link
                      href={productHrefs[productKey]}
                      className={ctaClassName}
                    >
                      {t(`items.${productKey}.cta`)}
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
