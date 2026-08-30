/**
 * Porta de envio de email. Implementação real (Postmark/Resend/SES) entra
 * quando houver domínio verificado; até lá, `consoleMailer` escreve a mensagem
 * no log — suficiente para validar o fluxo de verificação em dev/CI.
 */
export interface MailerPort {
  send(message: { to: string; subject: string; text: string }): Promise<void>;
}

export const consoleMailer: MailerPort = {
  async send(message) {
    console.warn(`[mail] to=${message.to} subject="${message.subject}"\n${message.text}`);
  },
};
