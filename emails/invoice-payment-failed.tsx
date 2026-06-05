import { siteConfig } from "@/config/site";
import * as React from "react";

interface InvoicePaymentFailedEmailProps {
  invoiceId: string;
  subscriptionId: string;
  planName: string;
  amountDue: number;
  currency: string;
  nextPaymentAttemptDate?: string;
  updatePaymentMethodLink: string;
  supportLink: string;
}

const commonStyles = {
  container: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f8fafc",
    padding: "40px 20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#ef4444",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 24px 0",
    textAlign: "center" as const,
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#4b5563",
    margin: "0 0 24px 0",
  },
  highlight: {
    fontWeight: "bold" as const,
  },
  ctaButton: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "500",
    fontSize: "16px",
    margin: "24px 0",
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    padding: "15px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    margin: "24px 0",
    fontSize: "14px",
  },
  supportText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "24px 0 0",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "underline",
  },
  footer: {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
    textAlign: "center" as const,
  },
  footerText: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "0",
  },
  logo: {
    width: "80px",
    height: "80px",
    backgroundColor: "#000000",
    borderRadius: "50%",
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "bold",
    color: "#ffffff",
  },
};

const EnglishVersion: React.FC<InvoicePaymentFailedEmailProps> = ({
  planName,
  amountDue,
  currency,
  nextPaymentAttemptDate,
  updatePaymentMethodLink,
  supportLink,
  invoiceId,
}) => (
  <div style={commonStyles.card}>
    <div style={commonStyles.logo}>
      <img
        src={`${siteConfig.url}/logo.png`}
        alt={siteConfig.name}
        width={80}
        height={80}
      />
    </div>

    <h1
      style={{
        ...commonStyles.title,
        fontSize: "24px",
        fontWeight: "bold",
        color: "#3b82f6",
      }}
    >
      <a
        href={siteConfig.url}
        style={{ textDecoration: "none", color: "#3b82f6" }}
      >
        {siteConfig.name}
      </a>
    </h1>
    <h2 style={commonStyles.title}>Action Required: Payment Failed</h2>
    <p style={commonStyles.paragraph}>
      We were unable to process the payment for your{" "}
      <span style={commonStyles.highlight}>{planName}</span> subscription.
    </p>
    <div style={commonStyles.infoBox}>
      <strong>Invoice ID:</strong> {invoiceId}
      <br />
      <strong>Amount Due:</strong>{" "}
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amountDue)}
    </div>
    <p style={commonStyles.paragraph}>
      To avoid any disruption to your service, please update your payment method
      as soon as possible.
    </p>
    <a href={updatePaymentMethodLink} style={commonStyles.ctaButton}>
      Update Payment Method
    </a>
    {nextPaymentAttemptDate && (
      <p style={commonStyles.paragraph}>
        We will attempt to charge your payment method again on approximately{" "}
        {nextPaymentAttemptDate}. Updating your details before then will ensure
        your subscription remains active.
      </p>
    )}
    {supportLink && (
      <p style={commonStyles.supportText}>
        If you have already updated your payment details or believe this is an
        error, please disregard this message. If you need assistance, please{" "}
        <a href={supportLink} style={commonStyles.link}>
          contact our support team
        </a>
        .
      </p>
    )}
  </div>
);

export const InvoicePaymentFailedEmail: React.FC<
  InvoicePaymentFailedEmailProps
> = (props) => {
  return (
    <div style={commonStyles.container}>
      <EnglishVersion {...props} />

      <div style={commonStyles.footer}>
        <p style={commonStyles.footerText}>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
};
