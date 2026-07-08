import BrandWordmark from "@/components/header/BrandWordmark";
import HeaderLinks from "@/components/header/HeaderLinks";
import HeaderShell from "@/components/header/HeaderShell";
import MobileMenu from "@/components/header/MobileMenu";
import { UserAvatar } from "@/components/header/UserAvatar";
import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import { getSession } from "@/lib/auth/server";
import { getHeaderNavigationLinks } from "@/lib/cms/article-navigation";
import { user as userSchema } from "@/lib/db/schema";
import { Music2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
type User = typeof userSchema.$inferSelect;

const Header = async () => {
  const locale = await getLocale();
  const [t, session, headerLinks] = await Promise.all([
    getTranslations("Home"),
    getSession(),
    getHeaderNavigationLinks(locale),
  ]);
  const user = session?.user;

  return (
    <HeaderShell>
      <nav className="flex justify-between items-center container max-w-8xl mx-auto">
        <div className="flex items-center space-x-6 md:space-x-12">
          <I18nLink
            href="/"
            title={t("title")}
            prefetch={true}
            className="flex items-center space-x-1"
          >
            <Image
              src="/logo.png"
              alt=""
              aria-hidden="true"
              width={28}
              height={28}
            />
            <BrandWordmark
              title={t("title")}
              className="hidden text-xl font-semibold font-science-gothic text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-colors duration-300 group-data-[scrolled=true]/header:text-zinc-950 group-data-[scrolled=true]/header:drop-shadow-none sm:inline-flex"
            />
          </I18nLink>

          <HeaderLinks links={headerLinks} variant="adaptive" />
        </div>

        <div className="flex items-center gap-x-2 flex-1 justify-end">
          {/* PC */}
          <div className="hidden lg:flex items-center gap-x-2">
            <Button
              asChild
              className="h-8 rounded-full bg-white/10 px-3 text-xs font-semibold text-white shadow-none hover:bg-white/15 active:scale-[0.98] group-data-[scrolled=true]/header:bg-zinc-950/5 group-data-[scrolled=true]/header:text-zinc-900 group-data-[scrolled=true]/header:hover:bg-zinc-950/10"
            >
              <I18nLink href="/create-song" className="flex items-center gap-2">
                <Music2 className="h-3.5 w-3.5" />
                Create Song
              </I18nLink>
            </Button>
            <UserAvatar user={user as User} />
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-x-2">
            <Button
              asChild
              size="icon"
              className="h-9 w-9 rounded-full shadow-sm hover:shadow-md active:scale-[0.96]"
              aria-label="Create song"
            >
              <I18nLink href="/create-song">
                <Music2 className="h-4 w-4" />
              </I18nLink>
            </Button>
            <UserAvatar user={user as User} />
            <MobileMenu links={headerLinks} variant="adaptive" />
          </div>
        </div>
      </nav>
    </HeaderShell>
  );
};

export default Header;
