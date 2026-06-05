"use client";

import { Button } from "@/components/ui/button";
import { PaymentProvider } from "@/lib/db/schema";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

interface PortalButtonProps {
  provider: PaymentProvider;
}

function SubmitButton({ provider }: PortalButtonProps) {
  const { pending } = useFormStatus();

  const buttonText =
    provider === "stripe"
      ? "Manage Subscription (Stripe)"
      : "Manage Subscription (Creem)";

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}

export function PortalButton({
  provider,
  action,
}: PortalButtonProps & {
  action: () => Promise<void>;
}) {
  return (
    <form action={action}>
      <SubmitButton provider={provider} />
    </form>
  );
}
