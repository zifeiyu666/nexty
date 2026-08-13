const SENDER_NAME = "SendTheSong.io";

export function getTransactionalEmailSender() {
  const email = "support@sendthesong.io";

  return {
    email,
    from: `${SENDER_NAME} <${email}>`,
  };
}
