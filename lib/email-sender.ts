const DEFAULT_SENDER_NAME = "SendTheSong.io";
const DEFAULT_SENDER_EMAIL = "support@sendthesong.io";

export function getTransactionalEmailSender() {
  const email = process.env.EMAIL_FROM_ADDRESS?.trim() || DEFAULT_SENDER_EMAIL;
  const name = process.env.EMAIL_FROM_NAME?.trim() || DEFAULT_SENDER_NAME;

  return {
    email,
    from: `${name} <${email}>`,
  };
}
