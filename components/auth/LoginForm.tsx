"use client";

import { GoogleIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import { authClient } from "@/lib/auth/auth-client";
import { normalizeEmail } from "@/lib/email";
import { initializeTracking } from "@/lib/tracking/client";
import { Turnstile } from "@marsidev/react-turnstile";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LoginFormProps {
  className?: string;
}

type LoginMode = "otp" | "magic-link";

export default function LoginForm({ className = "" }: LoginFormProps) {
  const t = useTranslations("Login");
  const locale = useLocale();

  const [lastMethod, setLastMethod] = useState<string | null>(null);

  const [mode, setMode] = useState<LoginMode>("otp");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [showTurnstile, setShowTurnstile] = useState(false);
  const turnstileRef = useRef<any>(null);

  // OTP specific state
  const [otpCode, setOtpCode] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  useEffect(() => {
    setLastMethod(authClient.getLastUsedLoginMethod());
  }, []);

  // Initialize user tracking on component mount
  useEffect(() => {
    initializeTracking();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const getCallbackUrl = () => {
    return new URL(
      next || locale === DEFAULT_LOCALE ? "" : `/${locale}`,
      window.location.origin
    ).toString();
  };

  const handleEmailLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.magicLink({
        email: normalizeEmail(email),
        name: "my-name",
        callbackURL: getCallbackUrl(),
        errorCallbackURL: "/redirect-error",
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken || "",
          },
        },
      });

      if (error) {
        // Handle rate limit error
        if (error.status === 429) {
          toast.error(t("Toast.rateLimitTitle"), {
            description: t("Toast.rateLimitDescription"),
          });
          return;
        }
        toast.error(t("Toast.Email.errorTitle"), {
          description: error.message || t("Toast.Email.errorDescription"),
        });
        return;
      }

      toast.success(t("Toast.Email.successTitle"), {
        description: t("Toast.Email.successDescription"),
      });
    } catch (error) {
      toast.error(t("Toast.Email.errorTitle"), {
        description: t("Toast.Email.errorDescription"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOtpLoading(true);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: normalizeEmail(email),
        type: "sign-in",
        fetchOptions:
          captchaToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
            ? {
                headers: {
                  "x-captcha-response": captchaToken,
                },
              }
            : undefined,
      });

      if (error) {
        // Handle rate limit error
        if (error.status === 429) {
          toast.error(t("Toast.rateLimitTitle"), {
            description: t("Toast.rateLimitDescription"),
          });
          return;
        }
        toast.error(t("Toast.OTP.errorTitle"), {
          description: error.message || t("Toast.OTP.sendErrorDescription"),
        });
        return;
      }

      toast.success(t("Toast.OTP.sendSuccessTitle"), {
        description: t("Toast.OTP.sendSuccessDescription"),
      });
      setCountdown(60);
    } catch (error) {
      toast.error(t("Toast.OTP.errorTitle"), {
        description: t("Toast.OTP.sendErrorDescription"),
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    setIsOtpLoading(true);

    try {
      const { error } = await authClient.signIn.emailOtp({
        email: normalizeEmail(email),
        otp: otpCode,
        fetchOptions:
          captchaToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
            ? {
                headers: {
                  "x-captcha-response": captchaToken,
                },
              }
            : undefined,
      });

      if (error) {
        // Handle rate limit error
        if (error.status === 429) {
          toast.error(t("Toast.rateLimitTitle"), {
            description: t("Toast.rateLimitDescription"),
          });
          return;
        }
        toast.error(t("Toast.OTP.errorTitle"), {
          description: error.message || t("Toast.OTP.verifyErrorDescription"),
        });
        return;
      }

      toast.success(t("Toast.OTP.verifySuccessTitle"), {
        description: t("Toast.OTP.verifySuccessDescription"),
      });

      window.location.assign(getCallbackUrl());
    } catch (error) {
      toast.error(t("Toast.OTP.errorTitle"), {
        description: t("Toast.OTP.verifyErrorDescription"),
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  const signInSocial = async (provider: string) => {
    const callback = new URL(
      next || locale === DEFAULT_LOCALE ? "" : `/${locale}`,
      window.location.origin
    );

    await authClient.signIn.social(
      {
        provider: provider,
        callbackURL: callback.toString(),
        errorCallbackURL: `/redirect-error`,
      },
      {
        onRequest: () => {
          if (provider === "google") {
            setIsGoogleLoading(true);
          } else if (provider === "github") {
            setIsGithubLoading(true);
          }
        },
        onResponse: (ctx) => {
          console.log("onResponse", ctx.response);
        },
        onSuccess: (ctx) => {
          console.log("onSuccess", ctx.data);
          // setIsGoogleLoading(false);
          // setIsGithubLoading(false);
        },
        onError: (ctx) => {
          console.error("social login error", ctx.error.message);
          setIsGoogleLoading(false);
          setIsGithubLoading(false);
          toast.error(`${provider} login failed`, {
            description: ctx.error.message,
          });
        },
      }
    );
  };

  const toggleMode = () => {
    setMode(mode === "otp" ? "magic-link" : "otp");
    setOtpCode("");
  };

  return (
    <div className={`grid gap-6 ${className}`}>
      <div className="grid gap-4">
        <Button
          variant="outline"
          onClick={() => signInSocial("google")}
          disabled={isGoogleLoading || isGithubLoading}
          className="relative"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="h-4 w-4" />
          )}
          {t("signInMethods.signInWithGoogle")}
          {lastMethod === "google" && (
            <Badge
              variant="secondary"
              className="absolute right-2 text-[10px] px-1.5 py-0.5 pointer-events-none"
            >
              Last used
            </Badge>
          )}
        </Button>
        {/* <Button
          variant="outline"
          onClick={() => signInSocial("github")}
          disabled={isGoogleLoading || isGithubLoading}
          className="relative"
        >
          {isGithubLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Github className="h-4 w-4" />
          )}
          {t("signInMethods.signInWithGithub")}
          {lastMethod === "github" && (
            <Badge
              variant="secondary"
              className="absolute right-2 text-[10px] px-1.5 py-0.5 pointer-events-none"
            >
              Last used
            </Badge>
          )}
        </Button> */}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("signInMethods.or")}
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="grid">
          <div className="text-sm font-medium">Email</div>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isOtpLoading}
            onMouseEnter={() => setShowTurnstile(true)}
          />
        </div>

        {mode === "otp" && (
          <div className="grid">
            <div className="text-sm font-medium">
              {t("signInMethods.otpMethod")}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                disabled={isLoading || isOtpLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="min-w-[120px]"
                onClick={handleSendOTP}
                disabled={
                  !email ||
                  isOtpLoading ||
                  countdown > 0 ||
                  (!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
                    !captchaToken)
                }
              >
                {isOtpLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : (
                  t("signInMethods.sendOTP")
                )}
              </Button>
            </div>
          </div>
        )}

        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && showTurnstile && (
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token: string) => {
              console.log("[Turnstile] Success, token received");
              setCaptchaToken(token);
            }}
            onError={(error: any) => {
              console.error("[Turnstile] Error:", error);
              setCaptchaToken("");
              toast.error("Verification failed", {
                description: "Please try again or refresh the page",
              });
            }}
            onExpire={() => {
              console.log("[Turnstile] Token expired, resetting...");
              setCaptchaToken("");
              // Auto-reset the widget to get a new token
              turnstileRef.current?.reset?.();
            }}
            options={{
              size: "flexible",
              theme: "auto",
              language: locale,
            }}
          />
        )}

        <Button
          onClick={mode === "otp" ? handleVerifyOTP : handleEmailLogin}
          disabled={
            !email ||
            isLoading ||
            isOtpLoading ||
            (mode === "otp" && otpCode.length !== 6) ||
            (!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken)
          }
          className="w-full bg-primary/90 hover:bg-primary"
        >
          {isLoading || isOtpLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "otp" ? (
            t("Button.signIn")
          ) : (
            <>
              <LinkIcon className="h-4 w-4" />
              {t("signInMethods.magicLinkMethod")}
            </>
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            className="text-xs font-normal text-muted-foreground hover:text-primary"
            onClick={toggleMode}
          >
            {mode === "otp"
              ? `Or ${t("signInMethods.magicLinkMethod")}`
              : `Or ${t("signInMethods.otpMethod")}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
