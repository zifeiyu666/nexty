"use client";

import Script from "next/script";

const RYBBIT_SRC = process.env.NEXT_PUBLIC_RYBBIT_SRC;
const RYBBIT_SITE_ID = process.env.NEXT_PUBLIC_RYBBIT_SITE_ID;
const RYBBIT_SESSION_REPLAY =
  process.env.NEXT_PUBLIC_RYBBIT_SESSION_REPLAY === "true";
const RYBBIT_REPLAY_MASK_SELECTORS =
  process.env.NEXT_PUBLIC_RYBBIT_REPLAY_MASK_SELECTORS;

const RybbitScript = () => {
  return (
    <>
      {RYBBIT_SRC && RYBBIT_SITE_ID ? (
        <Script
          src={RYBBIT_SRC}
          data-site-id={RYBBIT_SITE_ID}
          data-session-replay={RYBBIT_SESSION_REPLAY ? "true" : undefined}
          data-replay-mask-text-selectors={RYBBIT_REPLAY_MASK_SELECTORS}
          defer
          strategy="afterInteractive"
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default RybbitScript;
