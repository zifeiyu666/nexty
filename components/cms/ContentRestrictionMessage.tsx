import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import { ArrowLeftIcon, ArrowRightIcon, LockIcon } from "lucide-react";

interface ContentRestrictionMessageProps {
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  backText: string;
  backLink: string;
}

export function ContentRestrictionMessage({
  title,
  message,
  actionText,
  actionLink,
  backText,
  backLink,
}: ContentRestrictionMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 my-10 bg-secondary/30 rounded-2xl border border-border/50">
      <div className="bg-background p-4 rounded-full shadow-sm mb-6 border border-border/50">
        <LockIcon className="w-8 h-8 text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-semibold text-center mb-3 tracking-tight">
        {title}
      </h2>

      <p className="text-center text-muted-foreground mb-8 max-w-md text-base leading-relaxed">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
        {actionText && actionLink ? (
          <>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:flex-1 bg-background hover:bg-accent/50"
            >
              <I18nLink
                href={backLink}
                title={backText}
                prefetch={false}
                className="inline-flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                {backText}
              </I18nLink>
            </Button>
            <Button asChild size="lg" className="w-full sm:flex-1 font-medium">
              <I18nLink
                href={actionLink}
                title={actionText}
                prefetch={false}
                className="inline-flex items-center justify-center gap-2"
              >
                {actionText}
                <ArrowRightIcon className="w-4 h-4" />
              </I18nLink>
            </Button>
          </>
        ) : (
          <Button
            asChild
            variant="default"
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
          >
            <I18nLink
              href={backLink}
              title={backText}
              prefetch={false}
              className="inline-flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {backText}
            </I18nLink>
          </Button>
        )}
      </div>
    </div>
  );
}
