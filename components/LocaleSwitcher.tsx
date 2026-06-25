"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Locale,
  LOCALE_NAMES,
  routing,
  SHORT_LOCALE_NAMES,
  usePathname,
  useRouter,
} from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocaleStore } from "@/stores/localeStore";
import { ChevronDown, Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";

type LocaleSwitcherProps = {
  variant?: "dropdown" | "group" | "adaptive";
  className?: string;
};

export default function LocaleSwitcher({
  variant = "dropdown",
  className,
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const { dismissLanguageAlert } = useLocaleStore();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(nextLocale: Locale) {
    if (nextLocale === locale) return;
    dismissLanguageAlert();

    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params: params || {} },
        { locale: nextLocale }
      );
    });
  }

  if (variant === "group") {
    return (
      <div
        role="group"
        aria-label="Select language"
        className={cn(
          "inline-flex items-center rounded-md border border-border bg-background p-0.5 shadow-xs",
          isPending && "opacity-70",
          className
        )}
      >
        {routing.locales.map((cur) => {
          const active = cur === locale;
          return (
            <button
              key={cur}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectChange(cur)}
              className={cn(
                "h-7 min-w-9 px-2 rounded-[5px] text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {SHORT_LOCALE_NAMES[cur] ?? cur.toUpperCase()}
            </button>
          );
        })}
      </div>
    );
  }

  const isAdaptive = variant === "adaptive";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Select language"
          className={cn(
            "group inline-flex h-8 items-center gap-1.5 rounded-full pl-2.5 pr-2 text-sm font-medium border-0",
            isAdaptive
              ? "bg-white/10 text-white group-data-[scrolled=true]/header:bg-zinc-950/5 group-data-[scrolled=true]/header:text-zinc-900"
              : "border border-border/60 bg-background/40 text-foreground/80 backdrop-blur-sm",
            "shadow-xs transition-all duration-200",
            isAdaptive
              ? "shadow-none hover:bg-white/15 hover:text-white group-data-[scrolled=true]/header:hover:bg-zinc-950/10 group-data-[scrolled=true]/header:hover:text-zinc-900"
              : "hover:border-border hover:bg-accent hover:text-accent-foreground",
            isAdaptive
              ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent group-data-[scrolled=true]/header:focus-visible:ring-ring/40"
              : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            isAdaptive
              ? "data-[state=open]:bg-white/15 data-[state=open]:text-white group-data-[scrolled=true]/header:data-[state=open]:bg-zinc-950/10 group-data-[scrolled=true]/header:data-[state=open]:text-zinc-900"
              : "data-[state=open]:border-primary/30 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:shadow-sm",
            isPending && "opacity-70",
            className
          )}
        >
          <Languages
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              isAdaptive
                ? "text-current"
                : "text-primary/80 group-hover:text-primary group-data-[state=open]:text-primary"
            )}
          />
          <span className="leading-none tracking-tight">
            {LOCALE_NAMES[locale] ?? locale}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-36 rounded-lg border-border/70 p-1.5 shadow-md"
      >
        <DropdownMenuRadioGroup value={locale} onValueChange={onSelectChange}>
          {routing.locales.map((cur) => {
            const active = cur === locale;
            return (
              <DropdownMenuRadioItem
                key={cur}
                value={cur}
                className={cn(
                  "rounded-md py-1.5 pl-8 pr-3 text-sm transition-colors",
                  active && "bg-accent/60 text-accent-foreground font-medium"
                )}
              >
                {LOCALE_NAMES[cur]}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
