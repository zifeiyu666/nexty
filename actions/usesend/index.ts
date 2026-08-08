'use server';

import { actionResponse } from '@/lib/action-response';
import {
  addUseSendContact,
  removeUseSendContact,
  sendUseSendEmail,
} from '@/lib/usesend';
import { getTransactionalEmailSender } from '@/lib/email-sender';
import { render } from '@react-email/render';
import * as React from 'react';


interface SendEmailProps {
  email: string;
  subject: string;
  react: React.ComponentType<any> | React.ReactElement;
  reactProps?: Record<string, any>;
  isAddContacts?: boolean;
  /** Retained for compatibility; all messages use the verified support sender. */
  fromName?: string;
  /** Retained for compatibility; all messages use the verified support sender. */
  fromEmail?: string;
  /** Whether to include unsubscribe link headers. Defaults to false. */
  hasUnsubscribeLink?: boolean;
  /** Optional UseSend idempotency key for a retried logical send. */
  idempotencyKey?: string;
}

async function renderEmail(
  react: SendEmailProps['react'],
  reactProps?: Record<string, any>,
): Promise<string> {
  const emailContent = reactProps
    ? React.createElement(react as React.ComponentType<any>, reactProps)
    : (react as React.ReactElement);

  return render(emailContent);
}

export async function sendEmail({
  email,
  subject,
  react,
  reactProps,
  isAddContacts = false,
  hasUnsubscribeLink = false,
  idempotencyKey,
}: SendEmailProps) {
  if (!email) {
    return actionResponse.error('Email is required.');
  }

  if (isAddContacts) {
    await addUseSendContact(email);
  }

  const headers = hasUnsubscribeLink
    ? {
        'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe/newsletter?token=${Buffer.from(email).toString('base64')}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      }
    : undefined;

  const result = await sendUseSendEmail({
    to: email,
    from: getTransactionalEmailSender().from,
    replyTo: getTransactionalEmailSender().email,
    subject,
    html: await renderEmail(react, reactProps),
    headers,
    idempotencyKey,
  });

  return actionResponse.success({ id: result.emailId });
}

export async function removeUserFromContacts(email: string): Promise<void> {
  if (!email) {
    return;
  }

  try {
    await removeUseSendContact(email);
  } catch (error) {
    console.error('Failed to remove UseSend contact:', error);
  }
}
