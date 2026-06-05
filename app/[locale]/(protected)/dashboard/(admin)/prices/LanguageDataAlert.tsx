"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

export function LanguageDataAlert() {
  const t = useTranslations("Prices.PricePlanForm");

  return (
    <Alert className="border-primary/50 bg-primary/20 dark:bg-primary/20 mb-0 text-primary">
      <Info className="h-4 w-4" />
      <AlertTitle className="text-primary">Note</AlertTitle>
      <AlertDescription className="text-primary">
        {t("pleaseEnterLanguageData")}
      </AlertDescription>
    </Alert>
  );
}
