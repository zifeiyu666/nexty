"use client";

import LoginDialog from "@/components/auth/LoginDialog";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function LoginButton() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Login");

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const loginMode = process.env.NEXT_PUBLIC_LOGIN_MODE || "page";
    if (loginMode === "dialog") {
      setIsLoginDialogOpen(true);
      return;
    }

    const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    router.push(`/login${nextParam}`);
  };

  return (
    <>
      <Button onClick={handleLogin} size="sm">
        {t("Button.signIn")}
      </Button>

      {process.env.NEXT_PUBLIC_LOGIN_MODE === "dialog" && (
        <LoginDialog
          open={isLoginDialogOpen}
          onOpenChange={setIsLoginDialogOpen}
        />
      )}
    </>
  );
}
