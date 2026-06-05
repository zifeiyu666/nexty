import { siteConfig } from "@/config/site";
import * as React from "react";

interface OTPCodeEmailProps {
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}

const styles = {
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
    textAlign: "center" as const,
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#3b82f6",
    margin: "0 0 24px 0",
  },
  contentTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 24px 0",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#4b5563",
    margin: "0 0 24px 0",
  },
  otpContainer: {
    margin: "24px 0",
  },
  otpCode: {
    display: "inline-block",
    backgroundColor: "#f3f4f6",
    color: "#1f2937",
    padding: "16px 32px",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "32px",
    fontFamily: "monospace",
  },
  ignoreText: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: "24px 0 0",
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

const getTypeMessage = (type: OTPCodeEmailProps["type"]) => {
  switch (type) {
    case "sign-in":
      return "Use this code to sign in to your account.";
    case "email-verification":
      return "Use this code to verify your email address";
    case "forget-password":
      return "Use this code to reset your password";
    default:
      return "Your verification code is";
  }
};

export const OTPCodeEmail: React.FC<Readonly<OTPCodeEmailProps>> = ({
  otp,
  type,
}) => (
  <div style={styles.container}>
    <div style={styles.card}>
      <div style={styles.logo}>
        <img
          src={`${siteConfig.url}/logo.png`}
          alt={siteConfig.name}
          width={80}
          height={80}
        />
      </div>

      <h1 style={styles.headerTitle}>
        <a
          href={siteConfig.url}
          style={{ textDecoration: "none", color: "#3b82f6" }}
        >
          {siteConfig.name}
        </a>
      </h1>

      <h2 style={styles.contentTitle}>Hi there!</h2>

      <p style={styles.paragraph}>
        {getTypeMessage(type)} It will expire in 10 minutes.
      </p>

      <div style={styles.otpContainer}>
        <span style={styles.otpCode}>{otp}</span>
      </div>

      <p style={styles.ignoreText}>
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>

    <div style={styles.footer}>
      <p style={styles.footerText}>
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </div>
  </div>
);

export default OTPCodeEmail;
