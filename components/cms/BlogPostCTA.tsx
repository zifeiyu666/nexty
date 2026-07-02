"use client";

import { MagneticButton } from "@/components/ui/magnetic-button";

export function BlogPostCTA() {
  return (
    <section className="mt-14 border-t border-[#e4ded8] pt-10">
      <p className="text-xl font-medium leading-8 text-black sm:text-xl">
        Ready to create your own?
      </p>
      <MagneticButton
        href="/create-song"
        size="sm"
        magneticRange={110}
        strength={0.22}
        contentStrength={0.12}
        trailingArrow
        className="mt-5 min-w-[180px] border-[#ef5b4e] bg-[#ae4372] px-7 text-sm font-bold text-white shadow-[0_14px_32px_rgba(174,67,114,0.24)] hover:border-[#f36a5d] hover:bg-[#bb4b7b] hover:text-white hover:shadow-[0_18px_38px_rgba(174,67,114,0.3)] sm:min-w-[200px]"
      >
        <span>Create your song</span>
      </MagneticButton>
    </section>
  );
}
