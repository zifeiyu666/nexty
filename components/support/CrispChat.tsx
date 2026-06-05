"use client";

import { authClient } from "@/lib/auth/auth-client";
import Script from "next/script";
import { useEffect } from "react";

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

export default function CrispChat() {
  const { data: session } = authClient.useSession();

  const email = session?.user?.email;
  const name = session?.user?.name;
  const image = session?.user?.image;

  if (!CRISP_WEBSITE_ID) return null;

  useEffect(() => {
    // Ensure widget is visible (queued if Crisp isn't ready yet).
    window.$crisp = window.$crisp || [];
    window.$crisp.push(["do", "chat:show"]);
  }, []);

  useEffect(() => {
    if (!email) return;
    window.$crisp = window.$crisp || [];
    window.$crisp.push(["set", "user:email", [email]]);
    if (name) window.$crisp.push(["set", "user:nickname", [name]]);
    if (image) window.$crisp.push(["set", "user:avatar", [image]]);
  }, [email, name, image]);

  return (
    <Script
      id="crisp-snippet"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.$crisp = window.$crisp || [];
          window.$crisp.push(["do", "chat:show"]);
          window.CRISP_WEBSITE_ID = "${CRISP_WEBSITE_ID}";
          (function () {
            var d = document;
            var s = d.createElement("script");
            s.src = "https://client.crisp.chat/l.js";
            s.async = 1;
            s.defer = 1;
            d.getElementsByTagName("head")[0].appendChild(s);
          })();
        `,
      }}
    />
  );
}
