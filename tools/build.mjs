// Builds every page of samatechlb.com as plain HTML: node tools/build.mjs
// The design is the SAMA site (studio-dashboard/sama), with its sections written into the page instead of drawn by JavaScript.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, CATEGORIES, SERVICES, HOME_SERVICES, PROMISE, PROCESS, WHY, FORMATS, HOME_FAQ, ABOUT, SHOW } from "./content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const library = JSON.parse(readFileSync(join(root, "data", "library.json"), "utf8"));
const projects = JSON.parse(readFileSync(join(root, "data", "list.json"), "utf8")).map((id, i) => ({ ...library.find((p) => p.id === id), rank: i + 1 }));
const { icons, tech } = JSON.parse(readFileSync(join(root, "tools", "icons.json"), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (path) => `${SITE.url}/${path}`;
if (process.env.SAMA_UPDATED) SITE.updated = process.env.SAMA_UPDATED;
for (const c of new Set(projects.map((p) => p.category))) {
  if (CATEGORIES[c]) continue;
  // A category with no wording yet still gets a working page; add proper wording in content.mjs
  console.warn(`New category "${c}": using general wording. Add it to CATEGORIES in tools/content.mjs.`);
  const label = c + " websites";
  CATEGORIES[c] = { slug: c.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-websites", label, tab: c + " website designs", title: `${c} Website Design in Lebanon | SAMA`, meta: `${c} website designs by SAMA, a web design studio in Beirut, Lebanon. Open the live demos on any screen and get a fixed quote for your own site.`, h1: `${c} website <em>design</em> in Lebanon`, intro: `These ${c.toLowerCase()} website demos are working builds you can open and try on any screen. We adapt each one to your brand, your content and the way your business works.`, suits: `This design suits a ${c.toLowerCase()} business that wants customers to find what they need quickly and get in touch easily.` };
}
const cats = Object.keys(CATEGORIES).filter((c) => projects.some((p) => p.category === c));
const catPath = (c) => `work/${CATEGORIES[c].slug}/`;
const inCat = (c) => projects.filter((p) => p.category === c);
const waNum = SITE.whatsapp.replace(/\D/g, "");
const sitemap = [];
rmSync(join(root, "work"), { recursive: true, force: true }); // fully generated: removed projects must not leave old pages behind
const grad = (h) => h.replace(/<em>/g, '<span class="grad">').replace(/<\/em>/g, "</span>");

/* Icons are written directly into the page, so no icon font has to download */
const svg = (name) => { const i = icons[name]; if (!i) throw new Error("missing icon " + name); return `<svg class="ic" viewBox="${i.box}" fill="currentColor" aria-hidden="true">${i.body}</svg>`; };
const ic = (name) => `<i>${svg(name)}</i>`;
const logoMark = (id) => `<svg class="logo__mark" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2a5fe0"/><stop offset="1" stop-color="#5b93ff"/></linearGradient></defs><rect width="48" height="48" rx="14" fill="url(#${id})"/><path d="M9 35 19.5 18 26 28" fill="none" stroke="#9cc4ff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 35 29.5 13 39 35" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- Structured data ---------- */
const ORG = {
  "@type": "ProfessionalService", "@id": `${SITE.url}/#org`, name: SITE.name,
  alternateName: ["SAMA Tech", "SAMA Tech LB", "سماء"], url: `${SITE.url}/`,
  logo: { "@type": "ImageObject", url: abs("assets/icon-512.png"), width: 512, height: 512 },
  image: abs("assets/og-home.jpg"),
  description: "Web design and development studio in Beirut, Lebanon. Websites, online stores, mobile apps, UI/UX design and video editing.",
  email: SITE.email, ...(SITE.whatsapp ? { telephone: SITE.whatsapp } : {}),
  address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "LB" },
  areaServed: [{ "@type": "Country", name: "Lebanon" }, { "@type": "Place", name: "Worldwide" }],
  knowsAbout: ["Web design", "Web development", "E-commerce websites", "Mobile app development", "UI/UX design", "Video editing", "Technical SEO"],
  founder: { "@type": "Person", name: SITE.founder.name, sameAs: SITE.founder.sameAs, jobTitle: "Founder and Full Stack Developer" },
  sameAs: SITE.sameAs,
};
const WEBSITE = { "@type": "WebSite", "@id": `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.name, publisher: { "@id": `${SITE.url}/#org` }, inLanguage: "en" };
const crumbsLd = (crumbs) => ({ "@type": "BreadcrumbList", itemListElement: crumbs.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })) });
const faqLd = (faq) => ({ "@type": "FAQPage", mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
const itemList = (list) => ({ "@type": "ItemList", itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`work/${p.id}/`), name: p.name })) });

/* ---------- Pieces ---------- */
function proj(p, base, i = 1, wide = false) {
  const img = `${base}assets/work/${p.id}`;
  return `<article class="proj${wide ? " proj--wide" : ""}" data-cat="${esc(p.category)}" style="--d:${((i % 9) * 0.05).toFixed(2)}s">
  <a href="${base}work/${p.id}/" data-preview="${p.id}">
    <div class="proj__thumb"><img src="${img}-${wide ? 900 : 480}.webp" srcset="${img}-480.webp 480w, ${img}-900.webp 900w" sizes="(max-width: 640px) 92vw, ${wide ? "62vw" : "32vw"}" width="900" height="563" alt="${esc(`${p.name} ${p.tags[0].toLowerCase()} website on desktop`)}" loading="lazy" decoding="async" /><span class="proj__view">${ic("eye-line")} Live preview</span></div>
    <div class="proj__meta">
      <div><h3>${esc(p.name)}</h3><small>${esc(p.category)} · ${p.tags.slice(0, 2).map(esc).join(" · ")}</small></div>
      <div class="proj__pal" aria-hidden="true">${p.palette.slice(0, 4).map((c) => `<i style="background:${esc(c)}"></i>`).join("")}</div>
    </div>
  </a>
</article>`;
}
const workGrid = (list, base) => `<div class="work">${list.map((p, i) => proj(p, base, i)).join("\n")}</div>`;

const needs = ["Web Development", "E-commerce", "UI/UX Design", "Mobile & App Development", "Video Editing"];
const contactForm = () => `<form class="form" data-form data-email="${SITE.email}">
  <span class="form__l" id="needL">What do you need?</span>
  <div class="chips" data-needs role="group" aria-labelledby="needL">${needs.map((t, i) => `<button type="button" class="${i ? "" : "on"}">${esc(t)}</button>`).join("")}</div>
  <div class="row">
    <input name="name" type="text" required placeholder="Your name" aria-label="Your name" autocomplete="name" />
    <input name="email" type="email" required placeholder="Email address" aria-label="Email address" autocomplete="email" />
  </div>
  <span class="form__l" id="budL">Estimated budget</span>
  <div class="chips" data-budget role="group" aria-labelledby="budL"><button type="button">&lt; $500</button><button type="button" class="on">$500 – $1,500</button><button type="button">$1,500 – $5,000</button><button type="button">$5,000+</button></div>
  <textarea name="message" rows="5" required placeholder="Tell us about your project, goals and timeline…" aria-label="Project details"></textarea>
  <button class="btn btn--full" type="submit" data-magnet>Send message ${ic("send-plane-2-line")}</button>
  <p class="form-msg" data-msg role="status"></p>
</form>`;

const contactInfo = () => `<a class="cline" href="mailto:${SITE.email}">${ic("mail-line")}<span><small>Email</small><b>${SITE.email}</b></span></a>
${SITE.whatsapp ? `<a class="cline" href="https://wa.me/${waNum}" rel="noopener">${ic("whatsapp-line")}<span><small>WhatsApp</small><b>${esc(SITE.whatsapp)}</b></span></a>` : ""}
<div class="cline">${ic("map-pin-line")}<span><small>Location</small><b>${SITE.city}, ${SITE.country} · Working worldwide</b></span></div>
<div class="cline">${ic("time-line")}<span><small>Reply time</small><b>Within 24 hours</b></span></div>
<div class="socials"><a href="${SITE.sameAs[0]}" aria-label="SAMA on GitHub" rel="noopener">${svg("github-fill")}</a></div>`;

const faqBlock = (faq, title = "Common <em>questions</em>") => `<section class="section section--tight" aria-labelledby="faq-h"><div class="container"><div class="head"><p class="label reveal">FAQ</p><h2 id="faq-h" class="h2 reveal">${grad(title)}</h2></div>
<div class="faq reveal">${faq.map(({ q, a }) => `<details><summary>${esc(q)}${svg("add-line")}</summary><p>${esc(a)}</p></details>`).join("")}</div></div></section>`;

const ctaBand = (base, text = "Tell us what you need") => `<section class="section section--tight"><div class="container"><div class="cta-band reveal"><div><p class="label">Start a project</p><h2>${text}.</h2><p>We reply within 24 hours with ideas, a timeline and a fixed quote.</p></div><a class="btn" href="${base}contact/" data-magnet>Get a quote ${ic("arrow-right-up-line")}</a></div></div></section>`;

const stepsHtml = () => PROCESS.map(([t, d, i], n) => `<div class="step"><span class="step__n">0${n + 1}</span>${ic(i)}<h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("");

const promiseList = () => `<ul class="promise">${PROMISE.map(([t, d, i], n) => `<li class="reveal"${n ? ` style="--d:${(n * 0.08).toFixed(2)}s"` : ""}>${ic(i)}<div><strong>${esc(t)}</strong><span>${esc(d)}</span></div></li>`).join("")}</ul>`;

const breadcrumb = (crumbs, base) => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([name, path], i) => i === crumbs.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${base}${path}">${esc(name)}</a></li>`).join("")}</ol></nav>`;

const pageHero = (crumbs, base, label, h1, side) => `<section class="pagehead"><div class="container">
  ${crumbs ? breadcrumb(crumbs, base) : ""}
  <div class="pagehead__row"><div><p class="label">${label}</p><h1 class="h2">${grad(h1)}</h1></div>${side ? `<div class="pagehead__side">${side}</div>` : ""}</div>
</div></section>`;

function header(base, isHome) {
  const h = (a) => (isHome ? `#${a}` : `${base}#${a}`);
  return `<header class="header" id="header"><div class="header__in">
  <a href="${isHome ? "#home" : base}" class="logo" aria-label="SAMA home">${logoMark("samaG")}<span class="logo__word" aria-hidden="true">SΛMΛ</span></a>
  <nav class="nav" id="nav" aria-label="Main">
    <a href="${h("services")}">Services</a><a href="${h("work")}">Work</a><a href="${h("video")}">Video</a><a href="${h("process")}">Process</a><a href="${isHome ? "#contact" : `${base}contact/`}">Contact</a>
  </nav>
  <a href="${isHome ? "#contact" : `${base}contact/`}" class="btn btn--sm" data-magnet>Start a project ${ic("arrow-right-up-line")}</a>
  <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav">${svg("menu-4-line")}</button>
</div></header>`;
}

function footer(base) {
  return `<footer class="footer">
  <p class="footer__word" aria-hidden="true">SΛMΛ</p>
  <div class="footer__grid">
    <div><a href="${base}" class="logo" aria-label="SAMA home">${logoMark("samaF")}<span class="logo__word" aria-hidden="true">SΛMΛ</span></a>
      <p>Web design and development studio in ${SITE.city}, ${SITE.country}. Websites, online stores, mobile apps, UI/UX and video for clients in Lebanon and worldwide.</p></div>
    <div><h2 class="footer__h">Services</h2>${SERVICES.map((s) => `<a href="${base}${s.slug}/">${esc(s.tab)}</a>`).join("")}</div>
    <div><h2 class="footer__h">Work</h2><a href="${base}work/">All work</a>${cats.map((c) => `<a href="${base}${catPath(c)}">${esc(CATEGORIES[c].tab)}</a>`).join("")}</div>
    <div><h2 class="footer__h">Company</h2><a href="${base}about/">About SAMA</a><a href="${base}contact/">Contact</a><a href="mailto:${SITE.email}">${SITE.email}</a>${SITE.whatsapp ? `<a href="https://wa.me/${waNum}" rel="noopener">WhatsApp ${esc(SITE.whatsapp)}</a>` : ""}
      <div class="socials"><a href="${SITE.sameAs[0]}" aria-label="SAMA on GitHub" rel="noopener">${svg("github-fill")}</a></div></div>
  </div>
  <div class="footer__bottom"><p>© ${SITE.updated.slice(0, 4)} SAMA · سماء. All rights reserved.</p><p>The businesses in our demos are fictional.</p></div>
</footer>`;
}

const viewer = `<div class="viewer" id="viewer" role="dialog" aria-modal="true" aria-label="Live preview" hidden>
  <div class="viewer__bar">
    <div class="viewer__info"><strong id="vName"></strong><small id="vCat"></small></div>
    <div class="devices" id="devices"><button class="on" type="button" data-d="desktop" aria-label="Desktop">${svg("computer-line")}</button><button type="button" data-d="tablet" aria-label="Tablet">${svg("tablet-line")}</button><button type="button" data-d="mobile" aria-label="Mobile">${svg("smartphone-line")}</button></div>
    <div class="viewer__actions">
      <button id="vPrev" type="button" aria-label="Previous project">${svg("arrow-left-s-line")}</button><button id="vNext" type="button" aria-label="Next project">${svg("arrow-right-s-line")}</button>
      <a id="vMore" href="#" aria-label="Project details">${svg("information-line")}</a><a id="vOpen" href="#" target="_blank" rel="noopener nofollow" aria-label="Open in new tab">${svg("external-link-line")}</a>
      <button id="vClose" type="button" aria-label="Close preview">${svg("close-line")}</button>
    </div>
  </div>
  <div class="viewer__stage"><div class="viewer__device" id="vDevice"><iframe id="vFrame" title="Project preview"></iframe></div></div>
</div>`;

/* ---------- Page shell ---------- */
function page({ path, title, description, body, ld = [], image = "assets/og-home.jpg", noindex = false, ogType = "website", baseOverride, head = "" }) {
  const depth = path.split("/").filter(Boolean).length;
  const base = baseOverride ?? ("../".repeat(depth) || "./");
  const canonical = abs(path);
  if (title.length > 62) console.warn(`LONG TITLE (${title.length}): ${title}`);
  if (description.length > 160 || description.length < 80) console.warn(`DESCRIPTION ${description.length}: ${path}`);
  const graph = { "@context": "https://schema.org", "@graph": [ORG, WEBSITE, { "@type": "WebPage", "@id": `${canonical}#page`, url: canonical, name: title, description, isPartOf: { "@id": `${SITE.url}/#website` }, about: { "@id": `${SITE.url}/#org` }, inLanguage: "en", dateModified: SITE.updated }, ...ld] };
  const html = `<!DOCTYPE html>
<html lang="en" data-base="${base}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
${noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${canonical}" />\n<meta name="robots" content="index, follow, max-image-preview:large" />`}
<meta name="theme-color" content="#060a18" />
<meta property="og:type" content="${ogType}" />
<meta property="og:site_name" content="SAMA" />
<meta property="og:locale" content="en_US" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${abs(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="${base}favicon.ico" sizes="48x48" />
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="${base}assets/icon-180.png" />
<link rel="manifest" href="${base}site.webmanifest" />
<link rel="preload" href="${base}assets/fonts/outfit.woff2" as="font" type="font/woff2" crossorigin />
${head}<link rel="stylesheet" href="${base}assets/site.css" />
<noscript><style>.reveal,.proj,.step{opacity:1!important;transform:none!important;filter:none!important}.hero__title .line>span{transform:none!important}</style></noscript>
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>
</head>
<body class="is-night">
<a class="skip" href="#content">Skip to content</a>
${header(base, path === "")}
<main id="content">
${body(base)}
</main>
${footer(base)}
${viewer}
<script src="${base}assets/site.js" defer></script>
</body>
</html>
`;
  const dest = path === "404.html" ? join(root, "404.html") : join(root, path, "index.html");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  if (!noindex) sitemap.push({ path, image: image !== "assets/og-home.jpg" ? image : null });
}

/* ---------- Home: same sections, same order as the SAMA site, plus FAQ ---------- */
const show = SHOW.filter(([id]) => projects.some((p) => p.id === id)).map(([id, name, cat]) => ({ id, name, cat }));
for (const p of projects) { if (show.length >= 5) break; if (!show.some((s) => s.id === p.id)) show.push({ id: p.id, name: p.name, cat: p.tags[0] }); }
const techChips = (hidden) => tech.map((t) => `<span${hidden ? ' aria-hidden="true"' : ""}><svg class="ic" viewBox="${t.box}" fill="currentColor" aria-hidden="true">${t.body}</svg>${esc(t.label)}</span>`).join("");
page({
  path: "",
  title: "Web Design Company in Lebanon | SAMA, Beirut",
  description: `SAMA is a web design company in Beirut, Lebanon. We build fast websites, online stores, mobile apps and video. Try ${projects.length} live demos and get a fixed quote.`,
  ld: [itemList(projects), faqLd(HOME_FAQ)],
  head: `<link rel="preload" as="image" href="./assets/img/sky-900.webp" imagesrcset="./assets/img/sky-900.webp 900w, ./assets/img/sky-1800.webp 1800w" imagesizes="100vw" fetchpriority="high" />\n`,
  body: (base) => `<section class="hero" id="home">
  <img class="hero__bg" src="${base}assets/img/sky-900.webp" srcset="${base}assets/img/sky-900.webp 900w, ${base}assets/img/sky-1800.webp 1800w" sizes="100vw" width="1800" height="1200" alt="" fetchpriority="high" />
  <div class="hero__in">
    <div class="hero__copy">
      <h1 class="hero__tag reveal"><span>سماء</span>Web design company in Beirut, Lebanon</h1>
      <p class="hero__title">
        <span class="line"><span>We build digital</span></span>
        <span class="line"><span>products that</span></span>
        <span class="line"><span class="grad">rise above.</span></span>
      </p>
      <p class="hero__lead reveal" style="--d:.2s">A creative tech studio from Beirut. Websites, mobile apps, UI/UX and video for brands that refuse to blend in.</p>
      <div class="hero__cta reveal" style="--d:.28s">
        <a href="#contact" class="btn" data-magnet>Start your project ${ic("arrow-right-line")}</a>
        <a href="#work" class="btn btn--glass">${ic("eye-line")} See the work</a>
      </div>
      <ul class="hero__proof reveal" style="--d:.36s">
        <li><b data-count="${projects.length}">${projects.length}</b><span>live demos</span></li>
        <li><b data-count="${cats.length}">${cats.length}</b><span>website categories</span></li>
        <li><b>24h</b><span>reply time</span></li>
      </ul>
    </div>
    <div class="show reveal" style="--d:.35s" role="group" aria-label="Demo websites by SAMA">
      <div class="show__browser">
        <div class="show__bar"><i></i><i></i><i></i><span id="showUrl">samatechlb.com/work/${show[0].id}</span></div>
        <div class="show__screen" id="showDesk">${show.map((s, i) => `<img class="${i ? "" : "on"}" data-cat="${esc(s.cat)}" ${i ? "data-src" : "src"}="${base}assets/work/${s.id}-900.webp" width="900" height="563" alt="${esc(s.name)} ${esc(s.cat.toLowerCase())} website" />`).join("")}</div>
      </div>
      <div class="show__phone"><div class="show__notch"></div><div class="show__pscreen" id="showMob">${show.map((s, i) => `<img class="${i ? "" : "on"}" ${i ? "data-src" : "src"}="${base}assets/work/${s.id}-m.webp" width="360" height="779" alt="${esc(s.name)} website on a phone" />`).join("")}</div></div>
      <div class="show__caption"><span id="showCat">${esc(show[0].cat)}</span><b id="showName">${esc(show[0].name)}</b><div class="show__dots" id="showDots">${show.map((s, i) => `<button type="button" class="${i ? "" : "on"}" aria-label="Show ${esc(s.name)}"></button>`).join("")}</div></div>
    </div>
  </div>
</section>
<section class="tech" aria-label="Tools we use"><div class="tech__track">${techChips(false)}${techChips(true)}</div></section>
<section class="section name" id="promise"><div class="container name__in">
  <div class="name__copy">
    <p class="label reveal">Our promise</p>
    <h2 class="h2 reveal">No guesswork. <span class="grad">No surprises.</span></h2>
    <p class="reveal">Agencies love vague timelines and growing invoices. We work the other way: you know the price, the plan and the person in charge before anything starts.</p>
    <div class="nums reveal">
      <div><strong>${projects.length}</strong><span>live demos</span></div>
      <div><strong>${cats.length}</strong><span>website categories</span></div>
      <div><strong>4</strong><span>disciplines, one team</span></div>
      <div><strong>24h</strong><span>reply, every time</span></div>
    </div>
  </div>
  ${promiseList()}
</div></section>
<section class="section" id="services"><div class="container">
  <div class="head"><p class="label reveal">What we do</p><h2 class="h2 reveal">Four crafts. <span class="grad">One horizon.</span></h2></div>
  <div class="services">${HOME_SERVICES.map((s, i) => `<article class="service reveal" style="--d:${(i * 0.08).toFixed(2)}s" data-tilt>
    <div class="service__top"><span class="service__icon">${svg(s.i)}</span><span class="service__n">0${i + 1}</span></div>
    <h3>${esc(s.t)}</h3><p>${esc(s.d)}</p>
    <ul>${s.pts.map(([p, href]) => `<li>${ic("check-line")}${href && (!href.startsWith("work/") || cats.some((c) => catPath(c) === href + "/")) ? `<a class="link" href="${base}${href}/">${esc(p)}</a>` : `<span>${esc(p)}</span>`}</li>`).join("")}</ul>
    <a href="${base}${s.slug}/" class="service__link">${esc(s.more)} ${ic("arrow-right-up-line")}</a>
  </article>`).join("")}</div>
</div></section>
<section class="section" id="work"><div class="container">
  <div class="head head--row"><div><p class="label reveal">Our work</p><h2 class="h2 reveal">Projects under <span class="grad">our sky.</span></h2>
    <p class="head__p reveal">Live, fully working demo websites with fictional brands. Open any of them to try it on desktop, tablet or mobile.</p></div>
    <a href="${base}work/" class="btn btn--glass reveal">Browse by industry ${ic("arrow-right-up-line")}</a></div>
  <div class="filters reveal" id="filters">${["All", ...cats].map((c) => `<button type="button" class="${c === "All" ? "on" : ""}" data-c="${esc(c)}">${esc(c)}<em>${c === "All" ? projects.length : inCat(c).length}</em></button>`).join("")}</div>
  <div class="work" id="workGrid">${projects.map((p, i) => proj(p, base, i, i % 9 === 0)).join("\n")}</div>
  <div class="work__more"><button type="button" class="btn btn--glass" id="moreBtn">Load more projects ${ic("arrow-down-line")}</button></div>
</div></section>
<section class="section" id="video"><div class="container video">
  <div class="video__text">
    <p class="label reveal">Video editing</p>
    <h2 class="h2 reveal">Stories that <span class="grad">move people.</span></h2>
    <p class="reveal">From short-form reels to brand films, we cut, colour-grade, add motion graphics, captions and sound so your story lands in the first three seconds.</p>
    <div class="formats">${FORMATS.map(([i, t, s], k) => `<div class="reveal" style="--d:${(k * 0.06).toFixed(2)}s">${ic(i)}<strong>${esc(t)}</strong><small>${esc(s)}</small></div>`).join("")}</div>
    <a href="${base}video-editing-lebanon/" class="btn reveal" data-magnet>Video editing services ${ic("arrow-right-line")}</a>
  </div>
  <div class="editor reveal" aria-hidden="true">
    <div class="editor__top"><i></i><i></i><i></i><span>SAMA_brand-reel_v3.prproj</span></div>
    <div class="editor__view"><img src="${base}assets/img/edit-800.webp" width="800" height="533" alt="" loading="lazy" decoding="async" /><div class="editor__play">${svg("play-fill")}</div><div class="editor__caption">Your brand, in motion.</div><span class="editor__tc" id="timecode">00:00:12:08</span></div>
    <div class="timeline"><div class="timeline__ruler"><span>00:00</span><span>00:10</span><span>00:20</span><span>00:30</span></div>
      <div class="track track--v"><b style="width:22%"></b><b style="width:30%"></b><b style="width:18%"></b><b style="width:26%"></b></div>
      <div class="track track--t"><b style="width:12%;margin-left:6%"></b><b style="width:20%;margin-left:18%"></b><b style="width:14%;margin-left:10%"></b></div>
      <div class="track track--a"><span class="audio"></span></div><div class="playhead" id="playhead"></div></div>
  </div>
</div></section>
<section class="section" id="process"><div class="container">
  <div class="head head--c"><p class="label reveal">How we work</p><h2 class="h2 reveal">From idea to <span class="grad">liftoff.</span></h2></div>
  <div class="flight" id="flight">
    <svg viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true"><path id="flightPath" d="M20 230 C 220 230, 260 120, 420 120 S 640 200, 780 110 S 1040 20, 1180 30" /></svg>
    <span class="flight__comet" id="comet"></span>
    <div class="steps">${stepsHtml()}</div>
  </div>
</div></section>
<section class="section" id="about"><div class="container why">
  <div class="why__head"><p class="label reveal">Why SAMA</p><h2 class="h2 reveal">A small team with a <span class="grad">big sky.</span></h2>
    <p class="reveal">One team for design, code and content means faster decisions and a brand that looks the same on your site, your app and your reels. <a class="link" href="${base}about/">More about SAMA</a></p></div>
  <div class="why__grid">${WHY.map(([i, t, d], k) => `<div class="why__item reveal"${k ? ` style="--d:${(k * 0.08).toFixed(2)}s"` : ""}>${ic(i)}<strong>${esc(t)}</strong><span>${esc(d)}</span></div>`).join("")}</div>
  <div class="industries reveal">${[...new Set(projects.map((p) => p.tags[0]))].slice(0, 18).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
</div></section>
${faqBlock(HOME_FAQ)}
<section class="section contact-sec" id="contact">
  <img class="contact-sec__bg" src="${base}assets/img/dusk-1400.webp" width="1400" height="933" alt="" loading="lazy" decoding="async" />
  <div class="container contact">
    <div class="contact__info"><p class="label reveal">Contact</p><h2 class="h2 reveal">Let's build something <span class="grad">under the stars.</span></h2>
      <p class="reveal">Tell us about your project and we'll get back to you within 24 hours with ideas, a timeline and a quote.</p>
      <div class="reveal">${contactInfo()}</div></div>
    <div class="reveal">${contactForm()}</div>
  </div>
</section>`,
});

/* ---------- Work hub ---------- */
page({
  path: "work/",
  title: "Web Design Portfolio: Live Demos by SAMA, Lebanon",
  description: `Browse SAMA's web design portfolio by industry: ${cats.map((c) => CATEGORIES[c].label.toLowerCase()).join(", ")}. Open each live demo on any screen.`.slice(0, 160),
  ld: [crumbsLd([["Home", ""], ["Work", "work/"]])],
  body: (base) => `${pageHero([["Home", ""], ["Work", "work/"]], base, "Our work", "Web design <em>portfolio</em>", `<p>${projects.length} working websites, grouped by the kind of business they were designed for. They use fictional brands, so you can try every feature freely.</p>`)}
<section class="section section--first"><div class="container"><div class="tiles">${cats.map((c) => { const f = inCat(c)[0], n = inCat(c).length; return `<a class="tile" href="${base}${catPath(c)}"><img src="${base}assets/work/${f.id}-480.webp" width="480" height="300" loading="lazy" decoding="async" alt="${esc(f.name)} website, an example of ${esc(CATEGORIES[c].label.toLowerCase())}" /><small>${n} demo${n === 1 ? "" : "s"}</small><h2>${esc(CATEGORIES[c].tab)}</h2><p>${esc(CATEGORIES[c].intro.split(". ")[0])}.</p></a>`; }).join("")}</div></div></section>
${ctaBand(base, "Don't see your industry? Ask us")}`,
});

/* ---------- Category pages ---------- */
for (const c of cats) {
  const C = CATEGORIES[c], list = inCat(c);
  const crumbs = [["Home", ""], ["Work", "work/"], [C.label, catPath(c)]];
  const related = SERVICES.filter((s) => s.categories.includes(c)).slice(0, 2);
  page({
    path: catPath(c), title: C.title, description: C.meta, image: `assets/work/${list[0].id}-og.jpg`,
    ld: [crumbsLd(crumbs), itemList(list)],
    body: (base) => `${pageHero(crumbs, base, `${list.length} live demo${list.length === 1 ? "" : "s"}`, C.h1, `<p>${esc(C.intro)}</p>`)}
<section class="section section--first"><div class="container">${workGrid(list, base)}
${related.length ? `<p class="also">Looking for the service behind these? See ${related.map((s) => `<a class="link" href="${base}${s.slug}/">${esc(s.tab.toLowerCase())}</a>`).join(" and ")}.</p>` : ""}</div></section>
${ctaBand(base, "Want a site like these for your business? Tell us about it")}`,
  });
}

/* ---------- Project pages ---------- */
for (const p of projects) {
  const C = CATEGORIES[p.category];
  const type = p.tags[0];
  const features = p.tags.slice(1, 4).map((t) => t.toLowerCase());
  const crumbs = [["Home", ""], ["Work", "work/"], [C.label, catPath(p.category)], [p.name, `work/${p.id}/`]];
  const related = [...inCat(p.category).filter((x) => x.id !== p.id), ...projects.filter((x) => x.category !== p.category)].slice(0, 3);
  let description = `${p.name} is a live ${type.toLowerCase()} website demo by SAMA, a web design studio in Beirut, Lebanon. Includes ${features.join(", ")}.`;
  for (let n = features.length; esc(description).length > 158 && n > 0; n--) description = `${p.name} is a live ${type.toLowerCase()} website demo by SAMA, a web design studio in Beirut, Lebanon. Includes ${features.slice(0, n - 1).join(", ")}.`.replace(" Includes .", "");
  if (esc(description).length > 158) description = `${p.name}: a live website demo by SAMA, a web design studio in Beirut, Lebanon.`.slice(0, 158);
  if (description.length < 110) description += " Try it on any screen.";
  let title = `${p.name}: ${type} Website Design | SAMA`;
  if (esc(title).length > 60) title = `${p.name} Website Design | SAMA`;
  if (esc(title).length > 60) title = `${p.name.slice(0, 30)} | SAMA`;
  page({
    path: `work/${p.id}/`, ogType: "article",
    title, description, image: `assets/work/${p.id}-og.jpg`,
    ld: [crumbsLd(crumbs), { "@type": "CreativeWork", "@id": abs(`work/${p.id}/#work`), name: `${p.name} website demo`, description: p.description, image: abs(`assets/work/${p.id}-og.jpg`), creator: { "@id": `${SITE.url}/#org` }, genre: "Web design", keywords: p.tags.join(", "), inLanguage: "en" }],
    body: (base) => `${pageHero(crumbs, base, `${esc(type)} · demo`, `${esc(p.name)}: ${esc(type.toLowerCase())} <em>website</em>`, `<div class="hero__cta"><a class="btn" href="${base}demos/${p.id}/index.html" data-preview="${p.id}" rel="nofollow" data-magnet>Live preview ${ic("eye-line")}</a><a class="btn btn--glass" href="${base}contact/?project=${encodeURIComponent(p.name)}">I want one like this</a></div>`)}
<section class="section section--first"><div class="container">
  <div class="shots">
    <img class="shots__desk" src="${base}assets/work/${p.id}-900.webp" width="900" height="563" fetchpriority="high" decoding="async" alt="${esc(p.name)} ${esc(type.toLowerCase())} website on desktop" />
    <img class="shots__phone" src="${base}assets/work/${p.id}-m.webp" width="360" height="779" loading="lazy" decoding="async" alt="${esc(p.name)} ${esc(type.toLowerCase())} website on a phone" />
  </div>
  <div class="detail">
    <div class="prose">
      <h2>About this design</h2><p>${esc(p.description)}</p>
      <h2>Who it suits</h2><p>${esc(C.suits)}</p>
      <h2>Making it yours</h2><p>${esc(p.name)} is a fictional business that we created to show this design working. For a real project, we replace the name, photos, wording and colours with your own and adjust the features to fit how you work. The price is agreed in a fixed quote before we start.</p>
    </div>
    <dl class="facts">
      <dt>Category</dt><dd><a class="link" href="${base}${catPath(p.category)}">${esc(C.label)}</a></dd>
      <dt>Typography</dt><dd>${esc(p.fonts)}</dd>
      <dt>Built with</dt><dd>${esc(p.stack)}</dd>
      <dt>Palette</dt><dd class="swatches">${p.palette.map((c) => `<span style="background:${esc(c)}" title="${esc(c)}"></span>`).join("")}</dd>
      <dt>Highlights</dt><dd class="industries">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</dd>
    </dl>
  </div>
</div></section>
<section class="section section--tight" aria-labelledby="more-h"><div class="container"><div class="head"><p class="label reveal">Keep looking</p><h2 id="more-h" class="h2 reveal">More <span class="grad">designs</span></h2></div>${workGrid(related, base)}</div></section>
${ctaBand(base, `Want a site like ${esc(p.name)}? Tell us about your business`)}`,
  });
}

/* ---------- Service pages ---------- */
for (const s of SERVICES) {
  const crumbs = [["Home", ""], [s.tab, `${s.slug}/`]];
  let list = s.examples.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
  if (!list.length) list = s.categories.flatMap(inCat).slice(0, 3);
  if (!list.length) list = projects.slice(0, 3);
  page({
    path: `${s.slug}/`, title: s.title, description: s.meta,
    ld: [crumbsLd(crumbs), faqLd(s.faq), { "@type": "Service", "@id": abs(`${s.slug}/#service`), name: s.tab, serviceType: s.tab, description: s.meta, provider: { "@id": `${SITE.url}/#org` }, areaServed: [{ "@type": "Country", name: "Lebanon" }, { "@type": "Place", name: "Worldwide" }], url: abs(`${s.slug}/`) }],
    body: (base) => `${pageHero(crumbs, base, `SAMA · ${SITE.city}, ${SITE.country}`, s.h1, `<p>${esc(s.lead)}</p>`)}
<section class="section section--first"><div class="container"><div class="detail">
  <div class="prose">${s.sections.map((x) => `<h2>${esc(x.h)}</h2><p>${esc(x.p)}</p>`).join("\n")}</div>
  <aside class="facts"><h2>What's included</h2><ul class="ticks">${s.includes.map((x) => `<li>${ic("check-line")}<span>${esc(x)}</span></li>`).join("")}</ul><a class="btn" href="${base}contact/?service=${encodeURIComponent(s.tab)}" data-magnet>Get a fixed quote ${ic("arrow-right-up-line")}</a></aside>
</div></div></section>
<section class="section section--tight" aria-labelledby="ex-h"><div class="container"><div class="head"><p class="label reveal">Try before you ask</p><h2 id="ex-h" class="h2 reveal">Examples you can <span class="grad">open</span></h2></div>${workGrid(list, base)}</div></section>
<section class="section section--tight" aria-labelledby="process-h"><div class="container"><div class="head"><p class="label reveal">How we work</p><h2 id="process-h" class="h2 reveal">From idea to <span class="grad">liftoff.</span></h2></div><div class="steps steps--static">${stepsHtml()}</div></div></section>
${faqBlock(s.faq)}
<div class="container"><nav class="also" aria-label="Other services">Other services: ${SERVICES.filter((x) => x !== s).map((x) => `<a class="link" href="${base}${x.slug}/">${esc(x.tab)}</a>`).join(" · ")}</nav></div>
${ctaBand(base)}`,
  });
}

/* ---------- About ---------- */
{
  const crumbs = [["Home", ""], ["About", "about/"]];
  page({
    path: "about/", title: ABOUT.title, description: ABOUT.meta, ld: [crumbsLd(crumbs)],
    body: (base) => `${pageHero(crumbs, base, "About SAMA", ABOUT.h1, `<p>${esc(ABOUT.lead)}</p>`)}
<section class="section section--first"><div class="container"><div class="name__in about">
  <div class="prose">${ABOUT.sections.map((x) => `<h2>${esc(x.h)}</h2><p>${esc(x.p)}</p>`).join("\n")}
    <p><a class="link" href="${SITE.founder.sameAs[1]}" rel="noopener">Ahmad on LinkedIn</a> · <a class="link" href="${SITE.founder.sameAs[0]}" rel="noopener">Ahmad on GitHub</a> · <a class="link" href="${SITE.sameAs[0]}" rel="noopener">SAMA on GitHub</a></p></div>
  ${promiseList()}
</div></div></section>
${ctaBand(base)}`,
  });
}

/* ---------- Contact ---------- */
{
  const crumbs = [["Home", ""], ["Contact", "contact/"]];
  page({
    path: "contact/",
    title: "Contact SAMA: Web Design Quote in Beirut, Lebanon",
    description: "Contact SAMA, a web design studio in Beirut, Lebanon. Tell us about your website, app or video project and get a fixed quote within 24 hours.",
    ld: [crumbsLd(crumbs), { "@type": "ContactPage", url: abs("contact/"), mainEntity: { "@id": `${SITE.url}/#org` } }],
    body: (base) => `<section class="section contact-sec contact-sec--page">
  <img class="contact-sec__bg" src="${base}assets/img/dusk-1400.webp" width="1400" height="933" alt="" decoding="async" />
  <div class="container">${breadcrumb(crumbs, base)}<div class="contact">
    <div class="contact__info"><p class="label">Contact</p><h1 class="h2">Let's build something <span class="grad">under the stars.</span></h1>
      <p>Tell us about your project and we'll get back to you within 24 hours with ideas, a timeline and a quote.</p>${contactInfo()}</div>
    ${contactForm()}
  </div></div>
</section>`,
  });
}

/* ---------- 404: served from any address, so it uses paths from the site root ---------- */
page({
  path: "404.html", baseOverride: "/", noindex: true, title: "Page not found | SAMA",
  description: "This page does not exist. Browse SAMA's website demos and services, or contact our web design studio in Beirut, Lebanon.",
  body: (base) => `${pageHero(null, base, "404", "Nothing here <em>yet</em>.", `<p>This page has moved or never existed. <a class="link" href="${base}">Go to the home page</a> or <a class="link" href="${base}contact/">contact us</a>.</p>`)}`,
});

/* ---------- Files for crawlers and browsers ---------- */
writeFileSync(join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemap.map((u) => `  <url><loc>${abs(u.path)}</loc><lastmod>${SITE.updated}</lastmod>${u.image ? `<image:image><image:loc>${abs(u.image)}</image:loc></image:image>` : ""}</url>`).join("\n")}
</urlset>
`);
writeFileSync(join(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
writeFileSync(join(root, "CNAME"), "samatechlb.com\n");
writeFileSync(join(root, ".nojekyll"), "");
writeFileSync(join(root, "site.webmanifest"), JSON.stringify({ name: "SAMA", short_name: "SAMA", start_url: "/", display: "standalone", background_color: "#060a18", theme_color: "#060a18", icons: [{ src: "/assets/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png" }] }, null, 2) + "\n");
writeFileSync(join(root, "llms.txt"), `# SAMA

> SAMA (سماء) is a web design and development studio in ${SITE.city}, ${SITE.country}. It builds websites, online stores, mobile apps and interfaces, and edits video, for clients in Lebanon and worldwide.

Contact: ${SITE.email}

## Services
${SERVICES.map((s) => `- [${s.tab}](${abs(s.slug + "/")}): ${s.short}`).join("\n")}

## Work
Working demo websites with fictional businesses, grouped by industry.
${cats.map((c) => `- [${CATEGORIES[c].tab}](${abs(catPath(c))})`).join("\n")}

## Company
- [About](${abs("about/")})
- [Contact](${abs("contact/")})
`);
writeFileSync(join(root, "assets", "projects.js"), `window.SAMA_PROJECTS=${JSON.stringify(projects.map(({ id, name, category }) => ({ id, name, category }))).replace(/</g, "\\u003c")};\n`);

console.log(`${sitemap.length} indexable pages + 404`);
