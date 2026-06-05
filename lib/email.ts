export type EmailValidationError =
  | 'invalid_email_format'
  | 'email_part_too_long'
  | 'disposable_email_not_allowed'
  | 'invalid_characters';

// Allows: letters, numbers, and special chars: .!#$%&'*+/=?^_`{|}~-
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateEmail(email: string): {
  isValid: boolean;
  error?: EmailValidationError;
} {
  if (!email || email.length < 3 || email.length > 254) {
    return {
      isValid: false,
      error: 'invalid_email_format'
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      error: 'invalid_email_format'
    };
  }

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain || localPart.length > 64 || domain.length > 255) {
    return {
      isValid: false,
      error: 'email_part_too_long'
    };
  }

  // Only block truly dangerous characters that should never be in emails
  if (/[<>()[\]\\\s]/.test(localPart)) {
    return {
      isValid: false,
      error: 'invalid_characters'
    };
  }

  return { isValid: true };
}

export function normalizeEmail(email: string): string {
  if (!email) return '';

  let normalizedEmail = email.toLowerCase();

  if (process.env.NEXT_PUBLIC_EMAIL_NORMALIZATION_ENABLED !== 'true') {
    return normalizedEmail;
  }

  const [localPart, domain] = normalizedEmail.split('@');

  switch (domain) {
    case 'gmail.com':
      // remove dot and + suffix
      const gmailBase = localPart
        .replace(/\./g, '')
        .split('+')[0];
      return `${gmailBase}@${domain}`;

    case 'outlook.com':
    case 'hotmail.com':
    case 'live.com':
      // remove + suffix
      const microsoftBase = localPart.split('+')[0];
      return `${microsoftBase}@${domain}`;

    case 'yahoo.com':
      // remove - suffix
      const yahooBase = localPart.split('-')[0];
      return `${yahooBase}@${domain}`;

    default:
      // for other emails, only remove + suffix
      const baseLocalPart = localPart.split('+')[0];
      return `${baseLocalPart}@${domain}`;
  }
}