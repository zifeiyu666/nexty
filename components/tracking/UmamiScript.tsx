"use client";

import Script from "next/script";

const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

const UmamiScript = () => {
  return (
    <>
      {UMAMI_SRC && UMAMI_WEBSITE_ID ? (
        <Script
          src={UMAMI_SRC}
          data-website-id={UMAMI_WEBSITE_ID}
          defer
          strategy="afterInteractive"
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default UmamiScript;
