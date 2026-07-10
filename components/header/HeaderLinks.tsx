"use client";

import {
  HeaderActionText,
  type HeaderActionTextProps,
} from "@/components/header/HeaderActionText";
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

type HeaderLinksProps = {
  links: HeaderLink[];
  variant?: "default" | "adaptive";
};

export type RollingNavTextProps = HeaderActionTextProps;
export const RollingNavText = HeaderActionText;

const HeaderLinks = ({ links, variant = "default" }: HeaderLinksProps) => {
  const pathname = usePathname();

  const triggerClassName =
    variant === "adaptive"
      ? "group/nav-link bg-transparent rounded-xl px-4 py-2 flex items-center gap-x-1 text-sm font-medium text-[#fdf9f4] transition-colors hover:bg-white/10 data-[state=open]:bg-white/10 group-data-[scrolled=true]/header:text-[#270a05] group-data-[scrolled=true]/header:hover:bg-zinc-950/5 group-data-[scrolled=true]/header:data-[state=open]:bg-zinc-950/5"
      : "group/nav-link bg-transparent rounded-xl px-4 py-2 flex items-center gap-x-1 hover:bg-accent-foreground/10 hover:text-accent-foreground text-sm font-medium text-muted-foreground";

  const linkClassName =
    variant === "adaptive"
      ? "group/nav-link bg-transparent rounded-xl px-4 py-2 flex items-center gap-x-1 text-sm font-medium text-[#fdf9f4] transition-colors hover:bg-white/10 group-data-[scrolled=true]/header:text-[#270a05] group-data-[scrolled=true]/header:hover:bg-zinc-950/5"
      : "group/nav-link bg-transparent rounded-xl px-4 py-2 flex items-center gap-x-1 text-sm font-medium text-muted-foreground hover:bg-accent-foreground/10 hover:text-accent-foreground";

  const activeClassName =
    variant === "adaptive"
      ? "bg-white/10 font-semibold text-[#fdf9f4] group-data-[scrolled=true]/header:bg-zinc-950/5 group-data-[scrolled=true]/header:text-[#270a05]"
      : "font-medium text-accent-foreground";

  return (
    <NavigationMenu viewport={false} className="hidden lg:block">
      <NavigationMenuList className="flex-wrap">
        {links.map((link) => (
          <NavigationMenuItem key={link.name}>
            {link.items ? (
              <>
                <NavigationMenuTrigger className={triggerClassName}>
                  <RollingNavText rollingTextClassName="text-current">
                    {link.name}
                  </RollingNavText>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-[320px] max-w-[calc(100vw-2rem)] gap-1">
                    {link.items.map((child) => (
                      <li
                        key={child.href}
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
                            className="flex flex-col gap-y-1 text-sm text-muted-foreground hover:text-accent-foreground"
                          >
                            <div className="flex min-w-0 items-start gap-x-1 leading-snug">
                              <span className="min-w-0 whitespace-normal break-words">
                                {child.name}
                              </span>
                              {child.target === "_blank" && (
                                <span className="shrink-0 text-xs">
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
                <RollingNavText rollingTextClassName="text-current">
                  {link.name}
                </RollingNavText>
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
