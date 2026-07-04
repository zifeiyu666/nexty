import { GlobalMusicController } from "@/components/music/GlobalMusicController";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: siteConfig.themeColors,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" style={{ colorScheme: "light" }}>
      <body>
        {children}
        <GlobalMusicController />
      </body>
    </html>
  );
}
