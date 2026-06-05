"use client";

import { useCookieConsent } from "@/hooks/useCookieConsent";
import React from "react";

type ConsentGateProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function ConsentGate({
  children,
  fallback = null,
}: ConsentGateProps) {
  const { consented, mounted } = useCookieConsent();
  if (!mounted) return null;
  return <>{consented ? children : fallback}</>;
}
