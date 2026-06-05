"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

export function EnvironmentAlert() {
  const t = useTranslations("Prices.EnvironmentAlert");

  return (
    <Alert className="border-primary/50 bg-primary/20 dark:bg-primary/20 mb-0 text-primary">
      <Info className="h-4 w-4" />
      <AlertTitle className="text-primary">{t("title")}</AlertTitle>
      <AlertDescription className="text-primary">
        <ul className="list-inside list-disc text-sm">
          <li>
            <strong>Test</strong> {t("testDescription")}
          </li>
          <li>
            <strong>Live</strong> {t("liveDescription")}
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
