"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleWarning } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

declare global { interface Window { $crisp?: unknown[]; } }

export function ReportIssueButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID) return null;

  async function submit() {
    if (message.trim().length < 3) return;
    setIsSubmitting(true);
    const requestId = crypto.randomUUID();
    try {
      const response = await fetch("/api/activity/report-issue", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: pathname, message, requestId }) });
      if (!response.ok) throw new Error("Unable to send feedback");
      window.$crisp = window.$crisp || [];
      window.$crisp.push(["do", "chat:open"]);
      window.$crisp.push(["do", "message:send", ["text", `Issue report ${requestId}\nPage: ${pathname}\n\n${message.trim()}`]]);
      toast.success("Your report was sent to support.");
      setMessage("");
      setOpen(false);
    } catch {
      toast.error("Unable to send your report. Please try again.");
    } finally { setIsSubmitting(false); }
  }

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="fixed bottom-5 left-5 z-40 shadow-lg" size="sm" variant="outline"><MessageCircleWarning className="mr-2 h-4 w-4" />Report a problem</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Something not working?</DialogTitle><DialogDescription>Tell us what happened. Your report includes the current page and a support request ID, but not your private song content.</DialogDescription></DialogHeader><Textarea autoFocus value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What were you trying to do, and what happened?" rows={5} /><Button disabled={isSubmitting || message.trim().length < 3} onClick={submit}>{isSubmitting ? "Sending…" : "Send report"}</Button></DialogContent></Dialog>;
}
