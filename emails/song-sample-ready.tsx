import { siteConfig } from "@/config/site";
import * as React from "react";

interface SongSampleReadyEmailProps {
  title: string;
  sampleUrl: string;
  recipientLabel: string;
}

const styles = {
  container: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#fbf7f4",
    padding: "32px 18px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "34px",
    border: "1px solid #eadfd8",
  },
  title: {
    fontSize: "26px",
    lineHeight: "1.15",
    fontWeight: "800",
    color: "#351043",
    margin: "0 0 16px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.65",
    color: "#67556e",
    margin: "0 0 22px",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#b94573",
    color: "#ffffff",
    padding: "13px 22px",
    borderRadius: "999px",
    textDecoration: "none",
    fontWeight: "800",
    fontSize: "15px",
  },
  footer: {
    marginTop: "24px",
    fontSize: "12px",
    color: "#8f8194",
  },
};

export const SongSampleReadyEmail: React.FC<SongSampleReadyEmailProps> = ({
  title,
  sampleUrl,
  recipientLabel,
}) => (
  <div style={styles.container}>
    <div style={styles.card}>
      <h1 style={styles.title}>Your song sample is ready</h1>
      <p style={styles.text}>
        Your custom song sample, <strong>{title}</strong>, has finished
        generating for {recipientLabel}. You can listen to the 60-second sample
        from the link below.
      </p>
      <p style={styles.text}>
        Samples stay playable for 3 days. After that, you can still recreate the
        song from the saved form details.
      </p>
      <a href={sampleUrl} style={styles.button}>
        Listen to your sample
      </a>
      <p style={styles.footer}>
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </div>
  </div>
);

export default SongSampleReadyEmail;
