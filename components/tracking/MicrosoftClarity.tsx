"use client";

import clarity from "@microsoft/clarity";
import { useEffect } from "react";

const MicrosoftClarity = () => {
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  useEffect(() => {
    if (clarityProjectId) {
      clarity.init(clarityProjectId);
    }
  }, [clarityProjectId]);

  return null;
};

export default MicrosoftClarity;
