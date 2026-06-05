"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserBenefits } from "@/hooks/useUserBenefits";
import { DEFAULT_LOCALE, Link as I18nLink, useRouter } from "@/i18n/routing";
import confetti from "canvas-confetti";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  Home,
  Loader2,
  Receipt,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const buildVerifySuccessUrl = ({
  sessionId,
  checkoutId,
  subscriptionId,
  provider,
}: {
  sessionId: string;
  checkoutId: string;
  subscriptionId: string;
  provider: string;
}) => {
  const baseUrl = "/api/payment/verify-success";

  const params = new URLSearchParams();

  if (provider === "stripe") {
    params.append("session_id", sessionId);
  } else if (provider === "creem") {
    params.append("checkout_id", checkoutId);
  } else if (provider === "paypal") {
    if (subscriptionId) {
      params.append("subscription_id", subscriptionId);
    }
  }
  params.append("provider", provider);

  return `${baseUrl}?${params.toString()}`;
};

function SuccessContent() {
  const locale = useLocale();
  const router = useRouter();
  const { mutate: revalidateBenefits } = useUserBenefits();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session_id");
  const checkoutId = searchParams.get("checkout_id");
  const subscriptionId = searchParams.get("subscription_id");
  const orderId = searchParams.get("order_id");
  const provider = searchParams.get("provider");

  const [status, setStatus] = useState<
    "verifying" | "pending" | "success" | "error"
  >("verifying");
  const [paymentData, setPaymentData] = useState<{
    message: string;
    orderId?: string;
    subscriptionId?: string;
    planName?: string;
  }>({
    message: "Verifying your payment details...",
  });

  useEffect(() => {
    if (provider === "stripe" && !sessionId) {
      setStatus("error");
      setPaymentData({
        message: "Checkout session ID missing. Payment cannot be verified.",
      });
      return;
    }
    if (provider === "creem" && !checkoutId) {
      setStatus("error");
      setPaymentData({
        message: "Checkout ID missing. Payment cannot be verified.",
      });
      return;
    }

    // PayPal one-time payment: capture-order has already finalized it, so when
    // an order_id is present (and there is no subscription_id) we can show the
    // result directly without calling the verify endpoint.
    if (provider === "paypal" && orderId && !subscriptionId) {
      const isPending = searchParams.get("pending") === "true";
      if (isPending) {
        setStatus("pending");
        setPaymentData({
          message:
            "Your payment is being verified by PayPal. This usually takes a few moments. You can check your dashboard for updates.",
          orderId: orderId,
          planName: "PayPal Payment",
        });
        return;
      }
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
      });
      setStatus("success");
      setPaymentData({
        message: "Payment successful! Your plan has been updated.",
        orderId: orderId,
        planName: "PayPal Payment",
      });
      revalidateBenefits();
      return;
    }

    const verifySession = async () => {
      try {
        const url = buildVerifySuccessUrl({
          sessionId: sessionId ?? "",
          checkoutId: checkoutId ?? "",
          subscriptionId: subscriptionId ?? "",
          provider: provider ?? "",
        });
        const response = await fetch(url, {
          headers: {
            "Accept-Language": (locale || DEFAULT_LOCALE) as string,
          },
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Verification failed.");
        }

        if (!result.success) {
          throw new Error(result.error || "Verification failed.");
        }

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
        });

        setStatus("success");
        setPaymentData({
          message:
            result.data.message ||
            "Your payment has been confirmed. Your plan has been updated.",
          orderId: result.data.orderId,
          subscriptionId: result.data.subscriptionId,
          planName: result.data.planName,
        });
        revalidateBenefits();
      } catch (error) {
        setStatus("error");
        setPaymentData({
          message:
            error instanceof Error
              ? error.message
              : "An error occurred during verification.",
        });
      }
    };

    verifySession();
  }, [
    sessionId,
    checkoutId,
    subscriptionId,
    orderId,
    provider,
    locale,
    revalidateBenefits,
    searchParams,
  ]);

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        duration: 0.4,
      },
    },
  };

  const renderVerifying = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="p-10 flex flex-col items-center justify-center text-center space-y-6 shadow-xl border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Verifying Payment
          </h1>
          <p className="text-muted-foreground text-balance max-w-xs mx-auto">
            {paymentData.message}
          </p>
        </div>
      </Card>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      className="w-full max-w-md relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background decoration */}
      <Card className="p-8 flex flex-col items-center text-center shadow-xl border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-green-400 to-emerald-600" />

        <motion.div variants={fadeIn} className="mb-6 mt-2">
          <div className="relative group cursor-default">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700 ease-out"></div>
            <div className="relative bg-linear-to-b from-green-50 to-white dark:from-green-950/30 dark:to-background rounded-full p-4 ring-1 ring-green-100 dark:ring-green-900 shadow-sm">
              <CheckCircle
                className="w-16 h-16 text-green-500"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </motion.div>

        <motion.h1
          variants={fadeIn}
          className="text-3xl font-bold mb-3 tracking-tight"
        >
          Payment Successful!
        </motion.h1>

        <motion.p
          variants={fadeIn}
          className="text-muted-foreground text-center mb-8 text-balance leading-relaxed"
        >
          {paymentData.message}
        </motion.p>

        <motion.div variants={fadeIn} className="w-full mb-8">
          <div className="bg-muted/40 rounded-xl border border-border/50 overflow-hidden">
            <div className="bg-muted/60 px-4 py-3 border-b border-border/50 flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <span>Transaction Details</span>
            </div>
            <div className="p-4 space-y-3.5 text-sm">
              {paymentData.orderId && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono font-medium text-foreground bg-background px-2 py-0.5 rounded border border-border/50 text-xs">
                    {paymentData.orderId}
                  </span>
                </div>
              )}
              {paymentData.subscriptionId && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Subscription</span>
                  <span
                    className="font-mono font-medium text-foreground bg-background px-2 py-0.5 rounded border border-border/50 text-xs truncate max-w-[150px]"
                    title={paymentData.subscriptionId}
                  >
                    {paymentData.subscriptionId}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground">Plan Purchased</span>
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {paymentData.planName || "Premium Plan"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <Button
            className="flex-1 shadow-md hover:shadow-lg transition-all"
            asChild
            size="lg"
          >
            <I18nLink href="/" title="Back to Home" prefetch={true}>
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </I18nLink>
          </Button>
          <Button className="flex-1" asChild variant="outline" size="lg">
            <I18nLink href="/dashboard" title="Go to Dashboard" prefetch={true}>
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </I18nLink>
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );

  const renderPending = () => (
    <motion.div
      className="w-full max-w-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="p-8 flex flex-col items-center text-center shadow-xl border-border/50 bg-background/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-yellow-400 to-amber-600" />

        <motion.div variants={fadeIn} className="mb-6 mt-2">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-100 rounded-full scale-150 opacity-20 animate-pulse dark:bg-yellow-900/20"></div>
            <div className="relative bg-yellow-50 dark:bg-yellow-950/30 rounded-full p-4 ring-1 ring-yellow-100 dark:ring-yellow-900">
              <Clock className="w-16 h-16 text-yellow-500" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        <motion.h1
          variants={fadeIn}
          className="text-2xl font-bold mb-3 tracking-tight"
        >
          Payment Processing
        </motion.h1>
        <motion.p
          variants={fadeIn}
          className="text-muted-foreground text-center mb-8 max-w-xs mx-auto text-balance"
        >
          {paymentData.message}
        </motion.p>

        {paymentData.orderId && (
          <motion.div variants={fadeIn} className="w-full mb-8">
            <div className="bg-muted/40 rounded-xl border border-border/50 p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-medium text-foreground bg-background px-2 py-0.5 rounded border border-border/50 text-xs">
                  {paymentData.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">
                  {paymentData.planName || "-"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={fadeIn}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <Button variant="outline" className="flex-1" asChild>
            <I18nLink href="/dashboard" title="Go to Dashboard" prefetch={true}>
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </I18nLink>
          </Button>
          <Button className="flex-1" onClick={() => router.refresh()}>
            <RefreshCw className="w-4 h-4" /> Refresh Status
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );

  const renderError = () => (
    <motion.div
      className="w-full max-w-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="p-8 flex flex-col items-center text-center shadow-xl border-red-100 dark:border-red-900/30 bg-background/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-400 to-rose-600" />

        <motion.div variants={fadeIn} className="mb-6 mt-2">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full scale-150 opacity-50 dark:bg-red-900/20"></div>
            <div className="relative bg-red-50 dark:bg-red-950/30 rounded-full p-4 ring-1 ring-red-100 dark:ring-red-900">
              <XCircle className="w-16 h-16 text-red-500" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        <motion.h1
          variants={fadeIn}
          className="text-2xl font-bold mb-3 tracking-tight"
        >
          Verification Failed
        </motion.h1>
        <motion.p
          variants={fadeIn}
          className="text-muted-foreground text-center mb-8 max-w-xs mx-auto text-balance"
        >
          {paymentData.message}
        </motion.p>

        <motion.div
          variants={fadeIn}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <Button variant="outline" className="flex-1" asChild>
            <I18nLink href="/" title="Back to Home" prefetch={true}>
              <CreditCard className="w-4 h-4" /> Back to Home
            </I18nLink>
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 w-full">
      {status === "verifying" && renderVerifying()}
      {status === "pending" && renderPending()}
      {status === "success" && renderSuccess()}
      {status === "error" && renderError()}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="container max-w-4xl mx-auto">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <Loader2 className="w-12 h-12 mb-4 text-primary animate-spin" />
            <h1 className="text-xl font-medium text-muted-foreground">
              Loading Payment Status...
            </h1>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </main>
  );
}
