---
name: nexty-email
description: Send transactional emails in NEXTY.DEV using Resend. Use when creating email templates, sending notifications, or implementing welcome/magic-link emails. Covers React email templates and sending patterns.
---

# Email Sending in NEXTY.DEV

## Overview

- **Provider**: Resend
- **Client**: `lib/resend/index.ts`
- **Server Actions**: `actions/resend/index.ts`
- **Templates**: `emails/` directory

## Existing Email Templates

Located in `emails/`:

- `magic-link-email.tsx` - Magic link authentication
- `user-welcome.tsx` - New user welcome email
- `newsletter-welcome.tsx` - Newsletter subscription
- `otp-code-email.tsx` - OTP verification
- `credit-upgrade-failed.tsx` - Credit upgrade failure notification
- `invoice-payment-failed.tsx` - Payment failure notification
- `fraud-warning-admin.tsx` - Admin fraud alert
- `fraud-refund-user.tsx` - User refund notification

## Creating Email Templates

Use pure React components with inline styles.

### Basic Template Structure

```tsx
// emails/my-notification.tsx
import { siteConfig } from "@/config/site";
import * as React from "react";

interface MyNotificationEmailProps {
  userName: string;
  actionUrl: string;
  message: string;
}

// Define reusable styles
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a1a",
    margin: "0 0 24px 0",
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#4b5563",
    margin: "0 0 24px 0",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "16px",
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
};

export const MyNotificationEmail: React.FC<MyNotificationEmailProps> = ({
  userName,
  actionUrl,
  message,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Hello, {userName}!</h1>
        <p style={styles.text}>{message}</p>
        <a href={actionUrl} style={styles.button}>
          Take Action
        </a>
      </div>
      <div style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MyNotificationEmail;
```

### Template with Dynamic Content

```tsx
// emails/order-confirmation.tsx
import { siteConfig } from "@/config/site";
import * as React from "react";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  items: OrderItem[];
  total: string;
  orderDate: string;
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f8fafc",
    padding: "40px 20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "40px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a1a",
    margin: "0 0 16px 0",
  },
  text: {
    fontSize: "16px",
    color: "#4b5563",
    lineHeight: "1.6",
    margin: "0 0 24px 0",
  },
  orderInfo: {
    fontSize: "14px",
    color: "#666",
    margin: "4px 0",
  },
  hr: {
    border: "none",
    borderTop: "1px solid #e6e6e6",
    margin: "24px 0",
  },
  itemRow: {
    marginBottom: "12px",
  },
  itemName: {
    fontSize: "16px",
    fontWeight: "bold" as const,
    color: "#1a1a1a",
    margin: "0",
  },
  itemDetails: {
    fontSize: "14px",
    color: "#666",
    margin: "4px 0 0",
  },
  totalText: {
    fontSize: "18px",
    fontWeight: "bold" as const,
    color: "#1a1a1a",
    margin: "16px 0 0",
  },
};

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  orderId,
  items,
  total,
  orderDate,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Order Confirmed!</h1>
        <p style={styles.text}>Hi {customerName},</p>
        <p style={styles.text}>
          Thank you for your order. Here are your order details:
        </p>

        <div>
          <p style={styles.orderInfo}>Order ID: #{orderId}</p>
          <p style={styles.orderInfo}>Date: {orderDate}</p>
        </div>

        <hr style={styles.hr} />

        {items.map((item, index) => (
          <div key={index} style={styles.itemRow}>
            <p style={styles.itemName}>{item.name}</p>
            <p style={styles.itemDetails}>
              Qty: {item.quantity} × {item.price}
            </p>
          </div>
        ))}

        <hr style={styles.hr} />

        <p style={styles.totalText}>Total: {total}</p>
      </div>
    </div>
  );
};

export default OrderConfirmationEmail;
```

## Sending Emails

### Using Server Actions

```typescript
// actions/resend/index.ts
'use server';

import { resend } from '@/lib/resend';
import { actionResponse } from '@/lib/action-response';
import { MyNotificationEmail } from '@/emails/my-notification';

const FROM_EMAIL = `NEXTY <noreply@${process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '').replace('http://', '')}>`

export async function sendMyNotificationEmail({
  to,
  userName,
  actionUrl,
  message,
}: {
  to: string;
  userName: string;
  actionUrl: string;
  message: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'You have a notification',
      react: MyNotificationEmail({ userName, actionUrl, message }),
    });

    if (error) {
      console.error('Email send error:', error);
      return actionResponse.error(error.message);
    }

    return actionResponse.success({ id: data?.id });
  } catch (error: any) {
    console.error('Email error:', error);
    return actionResponse.error(error.message || 'Failed to send email');
  }
}
```

### Direct Resend Client Usage

```typescript
import { resend } from '@/lib/resend';
import { MyEmail } from '@/emails/my-email';

await resend.emails.send({
  from: 'NEXTY <noreply@yourdomain.com>',
  to: 'user@example.com',
  subject: 'Subject Line',
  react: MyEmail({ prop1: 'value1' }),
});
```

### Sending to Multiple Recipients

```typescript
await resend.emails.send({
  from: 'NEXTY <noreply@yourdomain.com>',
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Announcement',
  react: MyEmail({ ... }),
});
```

### With Reply-To

```typescript
await resend.emails.send({
  from: 'NEXTY <noreply@yourdomain.com>',
  to: 'user@example.com',
  replyTo: 'support@yourdomain.com',
  subject: 'Subject',
  react: MyEmail({ ... }),
});
```

## Using Emails in Webhooks/Actions

```typescript
// Example: Send email after payment
import { sendMyNotificationEmail } from '@/actions/resend';

async function handlePaymentSuccess(userId: string, email: string) {
  await sendMyNotificationEmail({
    to: email,
    userName: 'Customer',
    actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    message: 'Your payment was successful!',
  });
}
```

## Important Guidelines

1. **Use absolute URLs**: Always use `process.env.NEXT_PUBLIC_SITE_URL` for links
2. **No Lucide icons**: Email clients don't support SVG icons from lucide-react
3. **Inline styles**: Use inline style objects, not Tailwind classes
4. **Use standard HTML elements**: `<div>`, `<p>`, `<a>`, `<h1>`, `<img>`, etc.
5. **Keep props serializable**: Only pass primitive types and simple objects
6. **Test in email clients**: Send test emails and preview in Gmail, Outlook, etc. before production

## Environment Variables

```
RESEND_API_KEY
ADMIN_EMAIL      # For admin notifications
```

## Checklist

1. Create email template in `emails/` directory
2. Use pure React components with inline styles
3. Create server action for sending
4. Use absolute URLs with `NEXT_PUBLIC_SITE_URL`
5. Send test emails to verify rendering
6. Handle send errors gracefully
