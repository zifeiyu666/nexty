"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link as I18nLink, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { HeaderLink } from "@/types/common";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

type HeaderLinksProps = {
  variant?: "default" | "adaptive";
};

const HeaderLinks = ({ variant = "default" }: HeaderLinksProps) => {
  const tHeader = useTranslations("Header");
  const pathname = usePathname();

  const headerLinks: HeaderLink[] = tHeader.raw("links");
  const pricingLink = headerLinks.find((link) => link.id === "pricing");
  if (pricingLink) {
    pricingLink.href = process.env.NEXT_PUBLIC_PRICING_PATH!;
  }

  const triggerClassName =
    variant === "adaptive"
      ? "bg-transparent rounded-xl px-4 py-2 flex items-center gap-x-1 text-sm font-normal text-white/82 transition-colors hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white group-data-[scrolled=true]/header:text-zinc-700 group-data-[scrolled=true]/header:hover:bg-zinc-950/5 group-data-[scrolled=true]/header:hover:text-zinc-950 group-data-[scrolled=true]/header:data-[state=open]:bg-zinc-950/5 group-data-[scrolled=true]/header:data-[state=open]:text-zinc-950"
      : "bg-transparent rounded-xl px-4 py-2 flex items-center gap-x-1 hover:bg-accent-foreground/10 hover:text-accent-foreground text-sm font-normal text-muted-foreground";

  const linkClassName =
    variant === "adaptive"
      ? "bg-transparent rounded-xl px-4 py-2 flex items-center gap-x-1 text-sm font-normal text-white/82 transition-colors hover:bg-white/10 hover:text-white group-data-[scrolled=true]/header:text-zinc-700 group-data-[scrolled=true]/header:hover:bg-zinc-950/5 group-data-[scrolled=true]/header:hover:text-zinc-950"
      : "bg-transparent rounded-xl px-4 py-2 flex items-center gap-x-1 text-sm font-normal text-muted-foreground hover:bg-accent-foreground/10 hover:text-accent-foreground";

  const activeClassName =
    variant === "adaptive"
      ? "bg-white/10 font-semibold text-white group-data-[scrolled=true]/header:bg-zinc-950/5 group-data-[scrolled=true]/header:text-zinc-950"
      : "font-medium text-accent-foreground";

  return (
    <NavigationMenu viewport={false} className="hidden lg:block">
      <NavigationMenuList className="flex-wrap">
        {headerLinks.map((link) => (
          <NavigationMenuItem key={link.name}>
            {link.items ? (
              <>
                <NavigationMenuTrigger className={triggerClassName}>
                  {link.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-[250px] gap-1">
                    {link.items.map((child) => (
                      <li
                        key={child.name}
                        className="hover:bg-accent-foreground/10"
                      >
                        <NavigationMenuLink asChild>
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
                            className={cn(
                              "flex flex-col gap-y-1 text-sm text-muted-foreground hover:text-accent-foreground"
                            )}
                          >
                            <div className="flex items-center gap-x-1">
                              {child.name}
                              {child.target === "_blank" && (
                                <span className="text-xs">
                                  <ExternalLink className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                            {child.description && (
                              <div className="text-xs text-muted-foreground">
                                {child.description}
                              </div>
                            )}
                          </I18nLink>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <I18nLink
                key={link.name}
                href={link.href}
                title={link.name}
                prefetch={
                  link.target && link.target === "_blank" ? false : true
                }
                target={link.target || "_self"}
                rel={link.rel || undefined}
                className={cn(
                  linkClassName,
                  pathname === link.href && activeClassName
                )}
              >
                {link.name}
                {link.target === "_blank" && (
                  <span className="text-xs">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                )}
              </I18nLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default HeaderLinks;
