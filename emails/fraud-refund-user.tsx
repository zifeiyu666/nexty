import { siteConfig } from "@/config/site";
import * as React from "react";

interface FraudRefundUserEmailProps {
  userName?: string;
  chargeId: string;
  amount: number;
  currency: string;
  refundAmount: number;
  chargeDescription?: string;
  refundDate: string;
  supportLink: string;
  dashboardLink?: string;
}

const EnglishVersion: React.FC<FraudRefundUserEmailProps> = ({
  userName,
  chargeId,
  amount,
  currency,
  refundAmount,
  chargeDescription,
  refundDate,
  supportLink,
  dashboardLink,
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

    <h2 style={commonStyles.title}>Important: Transaction Refunded</h2>

    <p style={commonStyles.paragraph}>
      {userName ? `Dear ${userName},` : "Dear valued customer,"}
    </p>

    <p style={commonStyles.paragraph}>
      We're writing to inform you that a recent transaction on your account has
      been automatically refunded due to our fraud prevention system detecting
      suspicious activity.
    </p>

    <div style={commonStyles.infoBox}>
      <strong>Transaction Details:</strong>
      <br />
      <strong>Charge ID:</strong> {chargeId}
      <br />
      <strong>Original Amount:</strong>{" "}
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amount)}
      <br />
      <strong>Refunded Amount:</strong>{" "}
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(refundAmount)}
      <br />
      <strong>Refund Date:</strong> {refundDate}
      {chargeDescription && (
        <>
          <br />
          <strong>Description:</strong> {chargeDescription}
        </>
      )}
    </div>

    <p style={commonStyles.paragraph}>
      <strong>What this means:</strong>
    </p>
    <ul style={commonStyles.list}>
      <li>The full amount has been refunded to your original payment method</li>
      <li>
        You should see the refund in your account within 5-10 business days
      </li>
      <li>Any associated services or subscriptions have been cancelled</li>
      <li>No further action is required from you</li>
    </ul>

    <p style={commonStyles.paragraph}>
      <strong>If this was a legitimate transaction:</strong>
    </p>
    <p style={commonStyles.paragraph}>
      If you believe this refund was issued in error and the transaction was
      legitimate, please contact our support team immediately. We'll be happy to
      review the case and assist you with placing a new order if appropriate.
    </p>

    {dashboardLink && (
      <a href={dashboardLink} style={commonStyles.ctaButton}>
        View Account Dashboard
      </a>
    )}

    <p style={commonStyles.supportText}>
      We apologize for any inconvenience this may cause. Our fraud prevention
      measures are in place to protect both you and our platform from
      unauthorized transactions.
    </p>

    <p style={commonStyles.supportText}>
      If you have any questions or concerns, please don't hesitate to{" "}
      <a href={supportLink} style={commonStyles.link}>
        contact our support team
      </a>
      . We're here to help.
    </p>
  </div>
);

export const FraudRefundUserEmail: React.FC<FraudRefundUserEmailProps> = (
  props
) => {
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
    color: "#f59e0b", // Amber-500 for warning
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
    backgroundColor: "#fef3c7", // Amber-100
    padding: "15px",
    borderRadius: "6px",
    border: "1px solid #fcd34d", // Amber-300
    margin: "24px 0",
    fontSize: "14px",
  },
  list: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#4b5563",
    margin: "0 0 24px 0",
    paddingLeft: "20px",
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
