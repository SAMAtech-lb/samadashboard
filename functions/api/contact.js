// POST /api/contact: the website's contact form.
// Runs as a Cloudflare Pages Function. It sends two emails over SMTP:
//   1. the enquiry, to MAIL_TO (reply goes straight to the visitor);
//   2. a "thank you for contacting SAMA" reply, to the visitor.
//
// Settings (Cloudflare → Workers & Pages → this project → Settings → Variables and Secrets):
//   SMTP_HOST    mail server, e.g. smtp.hostinger.com
//   SMTP_PORT    465 (SSL) or 587 (STARTTLS)
//   SMTP_USER    info@samatechlb.com
//   SMTP_PASS    the mailbox password (add it as type "Secret")
//   MAIL_TO      where enquiries go (optional, defaults to SMTP_USER)
//   MAIL_FROM    sender address (optional, defaults to SMTP_USER)
import { WorkerMailer } from "worker-mailer";

const SITE = "https://samatechlb.com";
const BRAND = "SAMA";
const COMPANY = "SAMA Tech"; // how the thank-you email names us
const SERVICES = ["Web Development", "E-commerce", "UI/UX Design", "Mobile & App Development", "SEO", "Video Editing", "General enquiry"];
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const oneLine = (s, max) => String(s ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const paras = (s) => esc(s).replace(/\n/g, "<br>");

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { ok: false, error: "Please send the form again." });
  }

  // Bots fill the hidden "company" field and submit instantly. Pretend it worked so they move on.
  if (data.company || (Number(data.elapsed) > 0 && Number(data.elapsed) < 2500)) return json(200, { ok: true });

  const name = oneLine(data.name, 80);
  const email = oneLine(data.email, 120);
  const message = String(data.message ?? "").replace(/\r\n/g, "\n").trim().slice(0, 5000);
  const services = (Array.isArray(data.services) ? data.services : []).filter((s) => SERVICES.includes(s));
  const page = oneLine(data.page, 200);

  if (!name) return json(422, { ok: false, error: "Please enter your name." });
  if (!EMAIL_RE.test(email)) return json(422, { ok: false, error: "Please enter a valid email address." });
  if (message.length < 5) return json(422, { ok: false, error: "Please tell us a little about your project." });

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.error("contact: SMTP_HOST, SMTP_USER or SMTP_PASS is not set");
    return json(500, { ok: false, error: "We couldn't send your message. Please email us directly." });
  }

  const port = Number(env.SMTP_PORT || 465);
  const ownEmail = env.MAIL_FROM || env.SMTP_USER;
  const inbox = env.MAIL_TO || env.SMTP_USER;
  const topic = services.length ? services.join(", ") : "General enquiry";

  let mailer;
  try {
    mailer = await WorkerMailer.connect({
      host: env.SMTP_HOST,
      port,
      secure: port === 465,
      startTls: port !== 465,
      credentials: { username: env.SMTP_USER, password: env.SMTP_PASS },
      authType: ["plain", "login"],
      socketTimeoutMs: 15000,
      responseTimeoutMs: 15000,
    });

    // 1. The enquiry, to us.
    await mailer.send({
      from: { name: `${BRAND} website`, email: ownEmail },
      to: inbox,
      reply: { name, email },
      subject: `New enquiry from ${name}: ${topic}`,
      text: `Name: ${name}\nEmail: ${email}\nServices: ${topic}${page ? `\nSent from: ${page}` : ""}\n\n${message}\n\nReply to this email to answer ${name} directly.`,
      html: layout(`
        <h1 style="margin:0 0 18px;font-size:22px;color:#0b1430">New enquiry from ${esc(name)}</h1>
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.6;margin-bottom:18px">
          <tr><td style="color:#5b6785;padding-right:16px">Name</td><td><b>${esc(name)}</b></td></tr>
          <tr><td style="color:#5b6785;padding-right:16px">Email</td><td><a href="mailto:${esc(email)}" style="color:#2f6bff">${esc(email)}</a></td></tr>
          <tr><td style="color:#5b6785;padding-right:16px">Services</td><td>${esc(topic)}</td></tr>
          ${page ? `<tr><td style="color:#5b6785;padding-right:16px">Sent from</td><td>${esc(page)}</td></tr>` : ""}
        </table>
        <div style="padding:16px 18px;border-radius:12px;background:#f2f5fc;font-size:15px;line-height:1.6;color:#1b2440">${paras(message)}</div>
        <p style="margin:18px 0 0;font-size:13px;color:#5b6785">Press reply to answer ${esc(name)} directly.</p>`),
    });
  } catch (err) {
    console.error("contact: enquiry not sent", err);
    try { await mailer?.close(); } catch {}
    return json(502, { ok: false, error: "We couldn't send your message right now. Please try again or email us directly." });
  }

  // 2. The thank-you reply, to the visitor. The enquiry already reached us, so a failure here is only logged.
  try {
    const first = name.split(" ")[0];
    await mailer.send({
      from: { name: COMPANY, email: ownEmail },
      to: { name, email },
      reply: { name: COMPANY, email: inbox },
      subject: `Thank you for contacting ${COMPANY}`,
      text: `Hi ${first},\n\nThank you for reaching out to ${COMPANY}. Your message is now with our team, and we'll get back to you within 24 hours with the next steps for your project.\n\nIn the meantime, feel free to reply to this email with anything that helps us understand what you need: websites you like, your logo or brand files, or a deadline you're working towards.\n\nHere's a copy of your message:\n\nServices: ${topic}\n${message}\n\nBest regards,\nThe ${COMPANY} team\n${SITE}`,
      html: layout(`
        <h1 style="margin:0 0 14px;font-size:24px;color:#0b1430">Thank you for reaching out</h1>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#1b2440">Hi ${esc(first)},</p>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#1b2440">Thank you for reaching out to ${COMPANY}. Your message is now with our team, and we'll get back to you <b>within 24 hours</b> with the next steps for your project.</p>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:#1b2440">In the meantime, feel free to reply to this email with anything that helps us understand what you need: websites you like, your logo or brand files, or a deadline you're working towards.</p>
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#5b6785">Your message</p>
        <div style="padding:16px 18px;border-radius:12px;background:#f2f5fc;font-size:15px;line-height:1.6;color:#1b2440"><b>${esc(topic)}</b><br>${paras(message)}</div>
        <p style="margin:24px 0 0;font-size:16px;line-height:1.65;color:#1b2440">Best regards,<br><b>The ${COMPANY} team</b></p>`),
    });
  } catch (err) {
    console.error("contact: thank-you email not sent", err);
  }

  try { await mailer.close(); } catch {}
  return json(200, { ok: true });
}

export const onRequest = () => json(405, { ok: false, error: "Use POST." });

// A simple, email-client-safe wrapper with the SAMA name and colours.
function layout(body) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#eef2fa">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2fa;padding:32px 12px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
      <tr><td style="padding:0 6px 16px;font-size:20px;font-weight:800;letter-spacing:.04em;color:#0b1430">${BRAND}</td></tr>
      <tr><td style="height:4px;background:#3d7bff;background-image:linear-gradient(95deg,#3d7bff,#9cc4ff);border-radius:4px 4px 0 0"></td></tr>
      <tr><td style="background:#ffffff;padding:30px 28px;border-radius:0 0 14px 14px">${body}</td></tr>
      <tr><td style="padding:16px 6px;font-size:12px;color:#5b6785"><a href="${SITE}" style="color:#5b6785">samatechlb.com</a></td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}
