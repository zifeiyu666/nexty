import { bricolageGrotesque } from "@/app/fonts";
import {
  HeaderActionText,
  headerActionButtonClassName,
} from "@/components/header/HeaderActionText";
import HeaderLinks from "@/components/header/HeaderLinks";
import HeaderShell from "@/components/header/HeaderShell";
import MobileMenu from "@/components/header/MobileMenu";
import { UserAvatar } from "@/components/header/UserAvatar";
import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import { getSession } from "@/lib/auth/server";
import { getHeaderNavigationLinks } from "@/lib/cms/article-navigation";
import { user as userSchema } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Music2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
type User = typeof userSchema.$inferSelect;

const Header = async () => {
  const locale = await getLocale();
  const [t, headerT, session, headerLinks] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Header"),
    getSession(),
    getHeaderNavigationLinks(locale),
  ]);
  const user = session?.user;

  return (
    <HeaderShell>
      <nav className="relative flex items-center justify-between container max-w-8xl mx-auto">
        <I18nLink
          href="/"
          title={t("title")}
          prefetch={true}
          className="absolute left-1/2 flex -translate-x-1/2 items-center space-x-1 lg:static lg:translate-x-0"
        >
          <Image
            src="/logo.png"
            alt=""
            width={512}
            height={512}
            priority
            className="h-10 w-10 mt-[-6px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-[filter] duration-300 group-data-[scrolled=true]/header:drop-shadow-none"
          />
          <span
            className={cn(
              bricolageGrotesque.className,
              "text-[20px] font-extrabold leading-none tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-[filter] duration-300 group-data-[scrolled=true]/header:drop-shadow-none"
            )}
          >
            SendTheSong.io
          </span>
        </I18nLink>

        <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
          <HeaderLinks links={headerLinks} variant="adaptive" />
        </div>

        <div className="flex items-center gap-x-2 flex-1 justify-end">
          {/* PC */}
          <div className="hidden lg:flex items-center gap-x-2">
            <Button
              asChild
              className={headerActionButtonClassName}
            >
              <I18nLink href="/create-song">
                <HeaderActionText icon={<Music2 className="h-3.5 w-3.5" />}>
                  {headerT("createSong")}
                </HeaderActionText>
              </I18nLink>
            </Button>
            <UserAvatar user={user as User} />
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-x-2">
            <MobileMenu
              links={headerLinks}
              user={user as User}
              variant="adaptive"
            />
          </div>
        </div>
      </nav>
    </HeaderShell>
  );
};

export default Header;
