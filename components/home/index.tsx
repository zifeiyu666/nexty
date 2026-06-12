import CTA from "@/components/home/CTA";
import CustomerReactions from "@/components/home/CustomerReactions";
import FAQ from "@/components/home/FAQ";
import Hero from "@/components/home/Hero";
import Testimonials from "@/components/home/Testimonials";
import UseCases from "@/components/home/UseCases";
import { BG1 } from "@/components/shared/BGs";
import { getMessages } from "next-intl/server";

export default async function HomeComponent() {
  const messages = await getMessages();

  return (
    <div className="w-full">
      <BG1 />

      {messages.Landing.Hero && <Hero />}

      {messages.Landing.CustomerReactions && <CustomerReactions />}

      {/* {messages.Landing.Features && <Features />} */}

      {messages.Landing.UseCases && <UseCases />}

      {/* {messages.Pricing && <PricingByGroup />}
      {messages.Pricing && <PricingAll />}
      {messages.Pricing && <PricingByPaymentType />} */}

      {messages.Landing.Testimonials && <Testimonials />}

      {messages.Landing.FAQ && <FAQ />}

      {messages.Landing.CTA && <CTA />}
    </div>
  );
}
