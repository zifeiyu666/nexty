const SENDER_NAME = "One Custom Song";

export function getTransactionalEmailSender() {
  const email = "support@mail.onecustomsong.com";

  return {
    email,
    from: `${SENDER_NAME} <${email}>`,
  };
}
