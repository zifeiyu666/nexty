import { siteConfig } from "@/config/site";

interface FraudWarningAdminEmailProps {
  warningId: string;
  chargeId: string;
  customerId: string;
  amount: number;
  currency: string;
  fraudType: string;
  chargeDescription?: string;
  actionsTaken: string[];
  dashboardUrl: string;
}

const FraudWarningAdminEmail = ({
  warningId,
  chargeId,
  customerId,
  amount,
  currency,
  fraudType,
  chargeDescription,
  actionsTaken,
  dashboardUrl,
}: FraudWarningAdminEmailProps) => (
  <div style={main}>
    <div style={card}>
      <div style={logo}>
        <img
          src={`${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`}
          alt={siteConfig.name}
          width={80}
          height={80}
        />
      </div>

      <h1 style={heading}>🚨 Fraud Warning Alert</h1>
      <p style={paragraph}>
        Stripe Radar has detected a potential fraudulent charge that requires
        immediate attention. The system has automatically taken the configured
        actions.
      </p>

      <hr style={hr} />

      <h3 style={subHeading}>Warning Details:</h3>
      <p style={paragraph}>
        <strong>Warning ID:</strong> <code style={code}>{warningId}</code>
      </p>
      <p style={paragraph}>
        <strong>Charge ID:</strong> <code style={code}>{chargeId}</code>
      </p>
      <p style={paragraph}>
        <strong>Customer ID:</strong> <code style={code}>{customerId}</code>
      </p>
      <p style={paragraph}>
        <strong>Amount:</strong>{" "}
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency.toUpperCase(),
        }).format(amount)}
      </p>
      <p style={paragraph}>
        <strong>Fraud Type:</strong> <span style={fraudBadge}>{fraudType}</span>
      </p>
      {chargeDescription && (
        <p style={paragraph}>
          <strong>Charge Description:</strong> {chargeDescription}
        </p>
      )}

      <hr style={hr} />

      <h3 style={subHeading}>Actions Taken:</h3>
      <div style={actionsList}>
        {actionsTaken.map((action, index) => (
          <div key={index} style={actionItem}>
            ✅ {action}
          </div>
        ))}
      </div>

      <hr style={hr} />

      <h3 style={subHeading}>Next Steps:</h3>
      <p style={list}>
        1. <strong>Review Transaction:</strong> Check the transaction details in
        your{" "}
        <a href={dashboardUrl} style={link}>
          Stripe Dashboard
        </a>{" "}
        to verify the fraud detection.
      </p>
      <p style={list}>
        2. <strong>Customer Investigation:</strong> If needed, investigate the
        customer's account and transaction history for additional suspicious
        activity.
      </p>
      <p style={list}>
        3. <strong>Update Fraud Rules:</strong> Consider updating your Radar
        rules if this detection reveals new fraud patterns.
      </p>
      <p style={list}>
        4. <strong>Monitor Impact:</strong> Keep track of any customer
        complaints or disputes related to this automated action.
      </p>

      <div style={ctaContainer}>
        <a href={dashboardUrl} style={ctaButton}>
          View in Stripe Dashboard
        </a>
      </div>
    </div>

    <div style={footer}>
      <p style={footerText}>
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </div>
  </div>
);

export { FraudWarningAdminEmail };

const main = {
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#f8fafc",
  padding: "40px 20px",
};

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

const heading = {
  color: "#dc2626", // Red-600
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const subHeading = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1f2937",
  margin: "24px 0 16px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4b5563",
  margin: "0 0 16px 0",
};

const list = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4b5563",
  margin: "0 0 16px 0",
  paddingLeft: "10px",
};

const hr = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "24px 0",
};

const code = {
  fontFamily: "monospace",
  backgroundColor: "#f4f4f4",
  padding: "2px 6px",
  borderRadius: "4px",
  color: "#333",
};

const fraudBadge = {
  backgroundColor: "#fee2e2", // Red-100
  color: "#b91c1c", // Red-700
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: "500",
};

const actionsList = {
  backgroundColor: "#f0f9ff", // Blue-50
  border: "1px solid #e0f2fe", // Blue-100
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};

const actionItem = {
  fontSize: "16px",
  color: "#0f766e", // Teal-700
  margin: "8px 0",
  fontWeight: "500",
};

const ctaContainer = {
  textAlign: "center" as const,
  margin: "32px 0 16px 0",
};

const ctaButton = {
  display: "inline-block",
  padding: "12px 24px",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "500",
  fontSize: "16px",
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};

const footer = {
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid #e5e7eb",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0",
};

const logo = {
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
};
