'use server';

import { actionResponse } from '@/lib/action-response';
import resend from '@/lib/resend';
import * as React from 'react';

interface SendEmailProps {
  email: string;
  subject: string;
  react: React.ComponentType<any> | React.ReactElement;
  reactProps?: Record<string, any>;
  isAddContacts?: boolean;
  /** Sender name, defaults to process.env.ADMIN_NAME */
  fromName?: string;
  /** Sender email, defaults to process.env.ADMIN_EMAIL */
  fromEmail?: string;
  /** Whether to include unsubscribe link in headers, defaults to true */
  hasUnsubscribeLink?: boolean;
}

export async function sendEmail({
  email,
  subject,
  react,
  reactProps,
  isAddContacts = false,
  fromName,
  fromEmail,
  hasUnsubscribeLink = true,
}: SendEmailProps) {
  try {
    if (!email) {
      return actionResponse.error('Email is required.');
    }

    if (!resend) {
      return actionResponse.error('Resend env is not set');
    }

    // add user to contacts
    if (isAddContacts) {
      await resend.contacts.create({
        email,
      });
    }

    // send email
    const senderName = fromName ?? process.env.ADMIN_NAME ?? 'Admin';
    const senderEmail = fromEmail ?? process.env.ADMIN_EMAIL;
    
    if (!senderEmail) {
      return actionResponse.error('Sender email is not configured. Please set fromEmail or ADMIN_EMAIL environment variable.');
    }
    
    const from = `${senderName} <${senderEmail}>`;
    const to = email;

    const emailContent = reactProps
      ? React.createElement(react as React.ComponentType<any>, reactProps)
      : (react as React.ReactElement);

    const emailOptions: Parameters<typeof resend.emails.send>[0] = {
      from,
      to,
      subject,
      react: emailContent,
    };

    // Add unsubscribe headers only if hasUnsubscribeLink is true
    if (hasUnsubscribeLink) {
      const unsubscribeToken = Buffer.from(email).toString('base64');
      const unsubscribeLinkEN = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe/newsletter?token=${unsubscribeToken}`;
      emailOptions.headers = {
        "List-Unsubscribe": `<${unsubscribeLinkEN}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
      };
    }

    await resend.emails.send(emailOptions);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function removeUserFromContacts(email: string) {
  try {
    if (!email || !resend) {
      return;
    }

    await resend.contacts.remove({
      email,
    });

  } catch (error) {
    console.error('Failed to remove user from Resend contacts:', error);
    // Silently fail - we don't care about the result
  }
}