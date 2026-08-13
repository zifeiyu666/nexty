import { siteConfig } from "@/config/site";
import * as React from "react";

export interface TransactionalNotificationEmailProps {
  title: string;
  message: string;
  details?: Array<{ label: string; value: string }>;
  actionLabel?: string;
  actionUrl?: string;
  audience?: "user" | "admin";
}

export const TransactionalNotificationEmail: React.FC<
  TransactionalNotificationEmailProps
> = ({ title, message, details = [], actionLabel, actionUrl, audience }) => (
  <div style={styles.container}>
    <div style={styles.card}>
      <div style={styles.brand}>{siteConfig.name}</div>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.message}>{message}</p>
      {details.length > 0 && (
        <div style={styles.details}>
          {details.map((detail) => (
            <p key={detail.label} style={styles.detail}>
              <strong>{detail.label}:</strong> {detail.value}
            </p>
          ))}
        </div>
      )}
      {actionUrl && actionLabel && (
        <a href={actionUrl} style={styles.button}>
          {actionLabel}
        </a>
      )}
      {audience === "admin" && (
        <p style={styles.note}>This is an automated administrator notification.</p>
      )}
    </div>
    <p style={styles.footer}>
      © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
    </p>
  </div>
);

const styles = {
  container: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: "600px", margin: "0 auto", backgroundColor: "#f8fafc", padding: "32px 18px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "34px", border: "1px solid #e5e7eb" },
  brand: { fontSize: "13px", fontWeight: "700", color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: "18px" },
  title: { fontSize: "25px", lineHeight: "1.2", color: "#111827", margin: "0 0 16px" },
  message: { fontSize: "16px", lineHeight: "1.65", color: "#4b5563", margin: "0 0 22px" },
  details: { backgroundColor: "#f9fafb", borderRadius: "8px", padding: "14px 16px", marginBottom: "22px" },
  detail: { fontSize: "14px", color: "#374151", margin: "6px 0" },
  button: { display: "inline-block", backgroundColor: "#111827", color: "#ffffff", padding: "12px 20px", borderRadius: "7px", textDecoration: "none", fontWeight: "700" },
  note: { fontSize: "12px", color: "#9ca3af", margin: "22px 0 0" },
  footer: { fontSize: "12px", color: "#9ca3af", textAlign: "center" as const, margin: "22px 0 0" },
};

export default TransactionalNotificationEmail;
