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
      html: layout({
        preheader: `${name} wrote about ${topic}.`,
        kicker: "New website enquiry",
        title: esc(name),
        sub: esc(topic),
        body: `
          ${detail("Email", `<a href="mailto:${esc(email)}" style="color:${C.blue};text-decoration:none;font-weight:600">${esc(email)}</a>`)}
          ${detail("Services", esc(topic))}
          ${page ? detail("Sent from", `<a href="${SITE}${esc(page)}" style="color:${C.ink};text-decoration:none">samatechlb.com${esc(page)}</a>`) : ""}
          ${label("Message", 30)}
          ${quote(paras(message))}
          ${button(`mailto:${esc(email)}?subject=${encodeURIComponent("Re: your enquiry to " + COMPANY)}`, `Reply to ${esc(name.split(" ")[0])}`)}
          <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:${C.muted}">Or just press reply: it goes straight to ${esc(email)}.</p>`,
      }),
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
      html: layout({
        preheader: `Your message is with our team. We'll get back to you within 24 hours.`,
        kicker: "Message received",
        title: `Thank you, ${esc(first)}.`,
        sub: "Your message is with our team.",
        body: `
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:${C.ink}">Thank you for reaching out to ${COMPANY}. We'll get back to you <b>within 24 hours</b> with the next steps for your project.</p>
          <p style="margin:0;font-size:16px;line-height:1.7;color:${C.ink}">In the meantime, feel free to reply to this email with anything that helps us understand what you need: websites you like, your logo or brand files, or a deadline you're working towards.</p>
          ${label("What happens next", 34)}
          ${step("We read your message", "Our team looks at what you need and the style you're after.", true)}
          ${step("We reply within 24 hours", "With our questions, ideas and a time for a free call.", true)}
          ${step("You get a clear plan", "A fixed quote that doesn't grow halfway through.", false)}
          ${label("Your message", 30)}
          ${quote(`<b style="color:${C.navy}">${esc(topic)}</b><br>${paras(message)}`)}
          ${button(`${SITE}/work/`, "See our work")}
          <p style="margin:34px 0 0;font-size:16px;line-height:1.6;color:${C.ink}">Best regards,<br><b style="color:${C.navy}">The ${COMPANY} team</b></p>`,
      }),
    });
  } catch (err) {
    console.error("contact: thank-you email not sent", err);
  }

  try { await mailer.close(); } catch {}
  return json(200, { ok: true });
}

export const onRequest = () => json(405, { ok: false, error: "Use POST." });

// ---- Email design -------------------------------------------------------------------------
// Table layout with inline styles so it looks the same in Gmail, Outlook and Apple Mail.
// Dark navy header in the site's colours, white card, light footer.
const C = { navy: "#0b1430", deep: "#060a18", blue: "#2f6bff", sky: "#9cc4ff", ink: "#26304d", muted: "#6b7591", line: "#e6eaf3", soft: "#f4f6fb", page: "#eef1f7" };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const label = (text, top) =>
  `<p style="margin:${top}px 0 14px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.muted}">${text}</p>`;

const detail = (k, v) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid ${C.line}"><tr>
    <td width="110" style="padding:13px 0;font-size:14px;color:${C.muted};vertical-align:top">${k}</td>
    <td style="padding:13px 0;font-size:15px;color:${C.ink};vertical-align:top">${v}</td>
  </tr></table>`;

const quote = (html) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="3" bgcolor="${C.blue}" style="background:${C.blue};border-radius:3px"></td>
    <td bgcolor="${C.soft}" style="background:${C.soft};padding:18px 20px;border-radius:0 12px 12px 0;font-size:15px;line-height:1.7;color:${C.ink}">${html}</td>
  </tr></table>`;

const step = (title, text, more) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="44" valign="top" style="padding-top:2px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="28" height="28" align="center" bgcolor="#e8efff" style="width:28px;height:28px;border-radius:50%;background:#e8efff;font-size:14px;line-height:28px;color:${C.blue};font-weight:700">&#10003;</td></tr></table>
    </td>
    <td valign="top" style="padding-bottom:${more ? 18 : 0}px">
      <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:${C.navy}">${title}</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:${C.muted}">${text}</p>
    </td>
  </tr></table>`;

const button = (href, text) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:32px"><tr>
    <td bgcolor="${C.blue}" style="border-radius:999px;background:${C.blue};background-image:linear-gradient(95deg,#2f6bff,#5b93ff)">
      <a href="${href}" style="display:inline-block;padding:15px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${text} &rarr;</a>
    </td>
  </tr></table>`;

function layout({ preheader, kicker, title, sub, body }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><style>@media (max-width:620px){.px{padding-left:24px!important;padding-right:24px!important}.hd{padding-top:28px!important;padding-bottom:34px!important}.h1{font-size:27px!important}.wrap{padding:16px 8px!important}}</style><title>${COMPANY}</title></head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.page}" style="background:${C.page};font-family:${FONT}">
  <tr><td class="wrap" align="center" style="padding:36px 14px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">

      <tr><td class="px hd" bgcolor="${C.deep}" style="background:${C.deep};background-image:linear-gradient(140deg,#060a18 0%,#0d1c4a 55%,#2a5fe0 130%);border-radius:22px 22px 0 0;padding:34px 40px 44px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:12px"><img src="${SITE}/assets/icon-192.png" width="38" height="38" alt="" style="display:block;border:0;border-radius:11px"></td>
          <td style="font-family:'Arial Black',${FONT};font-size:17px;font-weight:900;letter-spacing:.28em;color:#ffffff">${BRAND}</td>
        </tr></table>
        <p style="margin:46px 0 12px;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${C.sky}">${kicker}</p>
        <h1 class="h1" style="margin:0;font-size:32px;line-height:1.2;font-weight:800;letter-spacing:-.01em;color:#ffffff">${title}</h1>
        <p style="margin:12px 0 0;font-size:17px;line-height:1.5;color:#c9d6f5">${sub}</p>
      </td></tr>

      <tr><td class="px" bgcolor="#ffffff" style="background:#ffffff;padding:38px 40px 42px;border-radius:0 0 22px 22px">${body}</td></tr>

      <tr><td align="center" style="padding:28px 20px 6px;font-size:13px;line-height:1.7;color:${C.muted}">
        <b style="color:${C.navy}">${COMPANY}</b> &middot; Websites, apps and SEO &middot; Beirut, Lebanon<br>
        <a href="${SITE}" style="color:${C.muted};text-decoration:underline">samatechlb.com</a> &nbsp;&middot;&nbsp; <a href="mailto:info@samatechlb.com" style="color:${C.muted};text-decoration:underline">info@samatechlb.com</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}
