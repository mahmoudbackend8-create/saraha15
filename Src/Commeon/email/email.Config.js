import { createTransport } from "nodemailer";
import { MAIL_PASS, MAIL_USER } from "../../../Config/Config.service.js";

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  tls: { rejectUnauthorized: false }, //because of we don.t buy security certificate
});
async function sendMail({ to, subject, text, html, attachments }) {
  const info = await transporter.sendMail({
    from: `Maddison Foo Koch <${MAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });

  console.log("Message sent:", info.messageId);
}
export default sendMail;
