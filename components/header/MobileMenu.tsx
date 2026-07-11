"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link as I18nLink } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/auth-client";
import { user as userSchema } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { HeaderLink } from "@/types/common";
import { LayoutDashboard, LogIn, LogOutIcon, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type MobileMenuProps = {
  links: HeaderLink[];
  user?: typeof userSchema.$inferSelect | null;
  variant?: "default" | "adaptive";
};

export default function MobileMenu({
  links,
  user,
  variant = "default",
}: MobileMenuProps) {
  const t = useTranslations("Home");
  const loginT = useTranslations("Login");
  const router = useRouter();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.refresh(),
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "rounded-full p-2 transition-colors",
          variant === "adaptive"
            ? "text-[#fdf9f4] hover:bg-white/10 group-data-[scrolled=true]/header:text-[#270a05] group-data-[scrolled=true]/header:hover:bg-zinc-950/5"
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          <I18nLink
            href="/"
            title={t("title")}
            prefetch={true}
            className="flex items-center space-x-1 font-bold"
          >
            <Image
              alt={t("title")}
              src="/images/brand/one-custom-song-wordmark-header.png"
              className="h-6 w-auto"
              width={2024}
              height={333}
            />
          </I18nLink>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {links.map((link) =>
            link.items ? (
              <DropdownMenuSub key={link.name}>
                <DropdownMenuSubTrigger className="px-2 py-1.5">
                  {link.name}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-72 max-w-[calc(100vw-2rem)]">
                  {link.items.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <I18nLink
                        href={child.href}
                        title={child.name}
                        prefetch={
                          child.target && child.target === "_blank"
                            ? false
                            : true
                        }
                        target={child.target || "_self"}
                        rel={child.rel || undefined}
                        className="flex min-w-0 flex-col gap-y-1"
                      >
                        <span className="whitespace-normal break-words leading-snug">
                          {child.name}
                        </span>
                        {child.description && (
                          <span className="text-xs text-muted-foreground">
                            {child.description}
                          </span>
                        )}
                      </I18nLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem key={link.name} asChild>
                <I18nLink
                  href={link.href}
                  title={link.name}
                  prefetch={
                    link.target && link.target === "_blank" ? false : true
                  }
                  target={link.target || "_self"}
                  rel={link.rel || undefined}
                >
                  {link.name}
                </I18nLink>
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user ? (
            <>
              <DropdownMenuItem asChild>
                <I18nLink href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </I18nLink>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 text-red-600 dark:text-red-400"
                onClick={signOut}
              >
                <LogOutIcon className="size-4" />
                {loginT("Button.signOut")}
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem asChild>
              <I18nLink href="/login" className="flex items-center gap-2">
                <LogIn className="size-4" />
                {loginT("Button.signIn")}
              </I18nLink>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
