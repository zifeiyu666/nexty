import { GlobalMusicController } from "@/components/music/GlobalMusicController";
import { siteConfig } from "@/config/site";
import { englishMessages } from "@/i18n/messages";
import "@/styles/globals.css";
import { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";

export const viewport: Viewport = {
  themeColor: siteConfig.themeColors,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" style={{ colorScheme: "light" }}>
      <body>
        <NextIntlClientProvider locale="en" messages={englishMessages}>
          {children}
          <GlobalMusicController />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
