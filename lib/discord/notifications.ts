/**
 * Discord notification utilities
 */

import { getErrorMessage } from "@/lib/error-utils";

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
  footer?: {
    text: string;
  };
  thumbnail?: {
    url: string;
  };
}

export interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
}

/**
 * Sends a generic Discord notification using a webhook
 * @param webhookUrl The Discord webhook URL
 * @param payload The payload to send to the webhook
 * @returns A promise that resolves to an object indicating success or failure
 */
export async function sendDiscordNotification({
  webhookUrl,
  payload,
}: {
  webhookUrl: string;
  payload: DiscordWebhookPayload;
}): Promise<{ success: boolean; error?: string }> {
  webhookUrl = webhookUrl || process.env.DISCORD_WEBHOOK_URL || '';

  if (!webhookUrl) {
    const message = "Discord webhook URL not provided";
    console.warn(message);
    return { success: false, error: message };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook failed:', response.status, errorText);
      return {
        success: false,
        error: `Discord webhook failed: ${response.status} ${errorText}`,
      };
    }

    console.log('Discord notification sent successfully.');
    return { success: true };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Error sending Discord notification:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/*
Example usage:

// This is an example, please do not call it directly.
// You should call it in your own business logic.
async function example() {
  // 1. Simple text message
  const simplePayload: DiscordWebhookPayload = {
    content: 'Hello, Discord! This is a simple message.'
  };

  await sendDiscordNotification({
    webhookUrl: process.env.DISCORD_WEBHOOK_URL!, // Make sure to set this in your .env
    payload: simplePayload
  });


  // 2. Message with an embed
  const embedPayload: DiscordWebhookPayload = {
    embeds: [
      {
        title: "New User Registered",
        description: "A new user has signed up on our platform.",
        color: 0x00ff00, // Green
        fields: [
          {
            name: "Email",
            value: "test@example.com",
            inline: true
          },
          {
            name: "Username",
            value: "testuser",
            inline: true
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "User Registration Service"
        }
      }
    ]
  };

  await sendDiscordNotification({
    webhookUrl: process.env.DISCORD_WEBHOOK_URL!,
    payload: embedPayload
  });
}
*/
