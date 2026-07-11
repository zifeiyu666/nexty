"use client";

import { subscribeToNewsletter } from "@/actions/newsletter";
import { normalizeEmail, validateEmail } from "@/lib/email";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useState } from "react";

type NewsletterLabels = {
  defaultErrorMessage: string;
  description: string;
  invalidEmail: string;
  successMessage: string;
  title: string;
};

type NewsletterProps = {
  labels: NewsletterLabels;
  locale: string;
};

export function Newsletter({ labels, locale }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const normalizedEmailAddress = normalizeEmail(email);
    const { isValid, error: validationError } = validateEmail(
      normalizedEmailAddress
    );

    if (!isValid) {
      setSubscribeStatus("error");
      setErrorMessage(validationError || labels.invalidEmail);
      setTimeout(() => setSubscribeStatus("idle"), 5000);
      return;
    }

    try {
      setSubscribeStatus("loading");

      const result = await subscribeToNewsletter(
        normalizedEmailAddress,
        locale
      );

      if (!result.success) {
        throw new Error(result.error || labels.defaultErrorMessage);
      }

      setSubscribeStatus("success");
      setEmail("");
      setErrorMessage("");
    } catch (error) {
      setSubscribeStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : labels.defaultErrorMessage
      );
    } finally {
      setTimeout(() => setSubscribeStatus("idle"), 5000);
    }
  };
  return (
    <div className="">
      <div className="mb-3 font-semibold text-white">{labels.title}</div>
      <p className="mb-3 text-sm text-white/62">{labels.description}</p>
      <form onSubmit={handleSubscribe} className="flex flex-col gap-2 max-w-64">
        <div className="flex">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full rounded-l-lg border border-white/10 bg-white/8 px-4 py-2 text-white placeholder:text-white/34 focus:outline-hidden focus:ring-1 focus:ring-primary"
            disabled={subscribeStatus === "loading"}
          />
          <button
            type="submit"
            disabled={subscribeStatus === "loading"}
            className={cn(
              "rounded-r-lg bg-primary px-4 py-2 transition hover:bg-primary/90",
              subscribeStatus === "loading"
            )}
            aria-label="Subscribe to newsletter"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        {subscribeStatus === "success" && (
          <p className="mt-1 text-xs text-white/70">
            {labels.successMessage}
          </p>
        )}
        {subscribeStatus === "error" && (
          <p className="mt-1 text-xs text-primary">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
