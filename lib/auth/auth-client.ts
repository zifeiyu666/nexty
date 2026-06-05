import { emailOTPClient, lastLoginMethodClient, magicLinkClient, oneTapClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL,
  plugins: [
    ...(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? [oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      // Optional client configuration:
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
      additionalOptions: {
        use_fedcm_for_prompt: process.env.NODE_ENV === "production"
      },
      promptOptions: {
        fedCM: false, // Force better-auth to use the Google JS script (which respects additionalOptions)
      }
    })] : []),
    magicLinkClient(),
    emailOTPClient(),
    lastLoginMethodClient()
  ]
})