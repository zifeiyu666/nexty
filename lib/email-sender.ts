const SENDER_NAME = "Send the Song";

export function getTransactionalEmailSender() {
  const email = "support@mail.onecustomsong.com";

  return {
    email,
    from: `${SENDER_NAME} <${email}>`,
  };
}
