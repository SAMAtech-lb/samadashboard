// Builds every page of samatechlb.com as plain HTML: node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, CATEGORIES, SERVICES, PROMISE, PROCESS, HOME_FAQ, ABOUT } from "./content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const projects = JSON.parse(readFileSync(join(root, "data", "projects.json"), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => s.replace(/<[^>]+>/g, "");
const abs = (path) => `${SITE.url}/${path}`;
const cats = Object.keys(CATEGORIES).filter((c) => projects.some((p) => p.category === c));
const catPath = (c) => `work/${CATEGORIES[c].slug}/`;
const inCat = (c) => projects.filter((p) => p.category === c);
const waNum = SITE.whatsapp.replace(/\D/g, "");
const sitemap = [];

const MARK = `<svg class="brand__mark" viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><rect width="48" height="48" rx="13" fill="#3d5afe"/><path d="M9 35 19.5 18 26 28" fill="none" stroke="#9cc4ff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 35 29.5 13 39 35" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- Structured data ---------- */
const ORG = {
  "@type": "ProfessionalService",
  "@id": `${SITE.url}/#org`,
  name: SITE.name,
  alternateName: ["SAMA Tech", "SAMA Tech LB", "سماء"],
  url: `${SITE.url}/`,
  logo: { "@type": "ImageObject", url: abs("assets/icon-512.png"), width: 512, height: 512 },
  image: abs("assets/og-home.jpg"),
  description: "Web design and development studio in Beirut, Lebanon. Websites, online stores, mobile apps, UI/UX design and video editing.",
  email: SITE.email,
  ...(SITE.whatsapp ? { telephone: SITE.whatsapp } : {}),
  address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "LB" },
  areaServed: [{ "@type": "Country", name: "Lebanon" }, { "@type": "Place", name: "Worldwide" }],
  knowsAbout: ["Web design", "Web development", "E-commerce websites", "Mobile app development", "UI/UX design", "Video editing", "Technical SEO"],
  founder: { "@type": "Person", name: SITE.founder.name, sameAs: SITE.founder.sameAs, jobTitle: "Founder and Full Stack Developer" },
  sameAs: SITE.sameAs,
};
const WEBSITE = {
  "@type": "WebSite", "@id": `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.name,
  publisher: { "@id": `${SITE.url}/#org` }, inLanguage: "en",
  potentialAction: { "@type": "SearchAction", target: `${SITE.url}/?q={search_term_string}`, "query-input": "required name=search_term_string" },
};
const crumbsLd = (crumbs) => ({ "@type": "BreadcrumbList", itemListElement: crumbs.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })) });
const faqLd = (faq) => ({ "@type": "FAQPage", mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
const itemList = (list) => ({ "@type": "ItemList", itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`work/${p.id}/`), name: p.name })) });

/* ---------- Pieces ---------- */
function card(p, base, i, eager) {
  const img = `${base}assets/work/${p.id}`;
  const alt = `${p.name} ${p.tags[0].toLowerCase()} website on desktop`;
  return `<article class="card" data-name="${esc(p.name)}" data-cat="${esc(p.category)}" data-rank="${p.rank}"${i < 6 ? ` style="animation-delay:${i * 50}ms"` : ' data-late'}>
  <a class="card__link" href="${base}work/${p.id}/" data-preview="${p.id}">
    <div class="thumb">
      <span class="status"><i></i>Live</span>
      <img src="${img}-480.webp" srcset="${img}-480.webp 480w, ${img}-900.webp 900w" sizes="(max-width: 640px) 92vw, (max-width: 1500px) 34vw, 26vw" width="900" height="563" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
      <div class="thumb__overlay"><span>Preview →</span></div>
    </div>
    <div class="card__meta">
      <h3>${esc(p.name)}</h3>
      <div class="dots" aria-hidden="true">${p.palette.map((c) => `<i style="background:${esc(c)}"></i>`).join("")}</div>
      <span class="mono">${esc(p.category)}</span>
      <div class="card__tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    </div>
  </a>
</article>`;
}

const grid = (list, base, eagerCount = 3) => `<div class="grid" id="grid">${list.map((p, i) => card(p, base, i, i < eagerCount)).join("\n")}</div>
<div class="empty" id="empty" hidden><h3>Nothing here <em>yet</em>.</h3><p>Try another search, or <a class="link" href="${base}contact/">ask us</a> about what you have in mind.</p></div>`;

const faqBlock = (faq, title = "Common <em>questions</em>") => `<section class="block" aria-labelledby="faq-h"><h2 id="faq-h">${title}</h2>
<div class="faq">${faq.map(({ q, a }) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div></section>`;

const cta = (base, text = "Tell us what you need") => `<section class="cta-band"><div><span class="mono">Start a project</span><h2>${text}.</h2><p>We reply within 24 hours with ideas, a timeline and a fixed quote.</p></div><a class="btn" href="${base}contact/">Get a quote ↗</a></section>`;

const processBlock = () => `<section class="block" aria-labelledby="process-h"><span class="mono">How we work</span><h2 id="process-h">From idea to <em>launch</em></h2>
<ol class="steps">${PROCESS.map(([t, d], i) => `<li><span class="mono">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}</ol></section>`;

function sidebar(base, current) {
  const link = (path, text, count) => `<a class="cat${current === path ? " on" : ""}" href="${base}${path}"${current === path ? ' aria-current="page"' : ""}><span>${esc(text)}</span>${count != null ? `<span class="cat__count">${count}</span>` : ""}</a>`;
  return `<aside class="side" id="side">
  <a href="${base}" class="brand" aria-label="SAMA home">${MARK}<span>SAMA<small class="mono">Studio</small></span></a>
  <nav aria-label="Website library"><span class="mono side__label">Library</span><div class="cats">
    ${link("", "All work", projects.length)}
    ${cats.map((c) => link(catPath(c), CATEGORIES[c].label, inCat(c).length)).join("\n    ")}
  </div></nav>
  <nav aria-label="Services"><span class="mono side__label">Services</span><div class="cats">
    ${SERVICES.map((s) => link(`${s.slug}/`, s.tab)).join("\n    ")}
  </div></nav>
  <nav aria-label="Company"><span class="mono side__label">Company</span><div class="cats">
    ${link("about/", "About")}
    ${link("contact/", "Contact")}
  </div></nav>
  <div class="side__cta">
    <span class="mono">Need something custom?</span>
    <p>We design and build websites, apps and video.</p>
    <a href="${base}contact/" class="btn btn--sm">Start a project ↗</a>
  </div>
</aside>`;
}

function topbar(base, tools) {
  return `<header class="top">
  <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="side">☰</button>
  <form class="search" role="search" action="${base}">
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2"/></svg>
    <input id="search" name="q" type="search" placeholder="Search websites…" autocomplete="off" aria-label="Search websites" />
    <kbd>/</kbd>
  </form>
  <div class="top__right">${tools ? `
    <select id="sort" class="select" aria-label="Sort">
      <option value="rank">Featured</option>
      <option value="az">A to Z</option>
      <option value="cat">Category</option>
    </select>
    <div class="seg" id="viewToggle" role="group" aria-label="Layout">
      <button class="on" type="button" data-view="grid" aria-label="Grid view"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z" fill="currentColor"/></svg></button>
      <button type="button" data-view="list" aria-label="List view"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M1 2h14v2H1zM1 7h14v2H1zM1 12h14v2H1z" fill="currentColor"/></svg></button>
    </div>` : `
    <a class="btn btn--sm" href="${base}contact/">Get a quote ↗</a>`}
  </div>
</header>`;
}

function footer(base) {
  return `<footer class="foot">
  <div class="foot__grid">
    <div><a href="${base}" class="brand">${MARK}<span>SAMA<small class="mono">Studio</small></span></a>
      <p>Web design and development studio in ${SITE.city}, ${SITE.country}. Websites, online stores, mobile apps, UI/UX and video, for clients in Lebanon and worldwide.</p></div>
    <div><h2 class="mono">Services</h2>${SERVICES.map((s) => `<a href="${base}${s.slug}/">${esc(s.tab)}</a>`).join("")}</div>
    <div><h2 class="mono">Work</h2>${cats.map((c) => `<a href="${base}${catPath(c)}">${esc(CATEGORIES[c].tab)}</a>`).join("")}</div>
    <div><h2 class="mono">Contact</h2><a href="mailto:${SITE.email}">${SITE.email}</a>${SITE.whatsapp ? `<a href="https://wa.me/${waNum}" rel="noopener">WhatsApp ${esc(SITE.whatsapp)}</a>` : ""}<a href="${base}about/">About SAMA</a><a href="${SITE.sameAs[0]}" rel="noopener">GitHub</a><span>${SITE.city}, ${SITE.country}</span></div>
  </div>
  <p class="mono foot__end">© ${SITE.updated.slice(0, 4)} SAMA · سماء. The businesses in our demos are fictional.</p>
</footer>`;
}

const breadcrumb = (crumbs, base) => `<nav class="crumbs mono" aria-label="Breadcrumb"><ol>${crumbs.map(([name, path], i) => i === crumbs.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${base}${path}">${esc(name)}</a></li>`).join("")}</ol></nav>`;

/* ---------- Page shell ---------- */
function page({ path, title, description, body, ld = [], tools = false, image = "assets/og-home.jpg", priority, noindex = false, ogType = "website", baseOverride }) {
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
<meta name="theme-color" content="#0f0f0e" />
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
<link rel="preload" href="${base}assets/fonts/spacegrotesk.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="${base}assets/site.css" />
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<div class="app">
${sidebar(base, path)}
<div class="main">
${topbar(base, tools)}
<main id="content">
${body(base)}
</main>
${footer(base)}
</div>
</div>
<div class="toast" id="toast" role="status"></div>
<script src="${base}assets/site.js" defer></script>
</body>
</html>
`;
  const dest = path === "404.html" ? join(root, "404.html") : join(root, path, "index.html");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  if (!noindex) sitemap.push({ path, priority, image: image !== "assets/og-home.jpg" ? image : null });
}

const resultsBar = (label, n) => `<div class="results-bar"><span class="mono" id="resultsLabel">${esc(label)}</span><span class="mono" id="resultsCount">${n} result${n === 1 ? "" : "s"}</span></div>`;

/* ---------- Home ---------- */
page({
  path: "", priority: "1.0", tools: true,
  title: "Web Design Company in Lebanon | SAMA, Beirut",
  description: `SAMA is a web design company in Beirut, Lebanon. We build fast websites, online stores, mobile apps and video. Try ${projects.length} live demos and get a fixed quote.`,
  ld: [itemList(projects), faqLd(HOME_FAQ)],
  body: (base) => `<section class="intro" id="work">
  <div>
    <span class="mono">Web design studio in Beirut · ${projects.length} live demos</span>
    <h1>Web design in <em>Lebanon</em>.<br />Pick a site, make it <span class="hl">yours</span>.</h1>
  </div>
  <p>SAMA designs and builds websites, online stores and mobile apps for businesses in Lebanon and worldwide. Every design below is a working demo with a fictional brand. Open any of them on desktop, tablet or mobile.</p>
</section>
${resultsBar("All work", projects.length)}
${grid(projects, base)}
<section class="block" aria-labelledby="services-h"><span class="mono">What we do</span><h2 id="services-h">Five <em>services</em>, one team</h2>
<div class="tiles tiles--five">${SERVICES.map((s, i) => `<a class="tile" href="${base}${s.slug}/"><span class="mono">0${i + 1}</span><h3>${esc(s.tab)}</h3><p>${esc(s.short)}</p><span class="tile__go">Learn more →</span></a>`).join("")}</div></section>
<section class="block" aria-labelledby="promise-h"><span class="mono">Our promise</span><h2 id="promise-h">No guesswork. <em>No surprises.</em></h2>
<ul class="promise">${PROMISE.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}</ul></section>
${processBlock()}
${faqBlock(HOME_FAQ)}
${cta(base, "Need a website in Lebanon? Tell us about it")}`,
});

/* ---------- Work hub ---------- */
page({
  path: "work/", priority: "0.8",
  title: "Web Design Portfolio: Live Demos by SAMA, Lebanon",
  description: `Browse SAMA's web design portfolio by industry: ${cats.map((c) => CATEGORIES[c].label.toLowerCase()).join(", ")}. Open each live demo on any screen.`.slice(0, 160),
  ld: [crumbsLd([["Home", ""], ["Work", "work/"]])],
  body: (base) => `${breadcrumb([["Home", ""], ["Work", "work/"]], base)}
<section class="intro intro--page"><div><span class="mono">Our work</span><h1>Web design <em>portfolio</em></h1></div>
<p>${projects.length} working websites, grouped by the kind of business they were designed for. They use fictional brands, so you can try every feature freely.</p></section>
<div class="tiles tiles--work">${cats.map((c) => { const first = inCat(c)[0]; return `<a class="tile tile--img" href="${base}${catPath(c)}"><img src="${base}assets/work/${first.id}-480.webp" width="480" height="300" loading="lazy" decoding="async" alt="${esc(first.name)} website, an example of ${esc(CATEGORIES[c].label.toLowerCase())}" /><span class="mono">${inCat(c).length} demo${inCat(c).length === 1 ? "" : "s"}</span><h2>${esc(CATEGORIES[c].tab)}</h2><p>${esc(CATEGORIES[c].intro.split(". ")[0])}.</p></a>`; }).join("")}</div>
${cta(base, "Don't see your industry? Ask us")}`,
});

/* ---------- Category pages ---------- */
for (const c of cats) {
  const C = CATEGORIES[c], list = inCat(c);
  const crumbs = [["Home", ""], ["Work", "work/"], [C.label, catPath(c)]];
  const related = SERVICES.filter((s) => s.categories.includes(c)).slice(0, 2);
  page({
    path: catPath(c), priority: "0.8", tools: true, title: C.title, description: C.meta,
    image: `assets/work/${list[0].id}-og.jpg`,
    ld: [crumbsLd(crumbs), itemList(list)],
    body: (base) => `${breadcrumb(crumbs, base)}
<section class="intro intro--page"><div><span class="mono">${list.length} live demo${list.length === 1 ? "" : "s"}</span><h1>${C.h1}</h1></div>
<p>${esc(C.intro)}</p></section>
${resultsBar(C.label, list.length)}
${grid(list, base)}
${related.length ? `<p class="also">Looking for the service behind these? See ${related.map((s) => `<a class="link" href="${base}${s.slug}/">${esc(s.tab.toLowerCase())}</a>`).join(" and ")}.</p>` : ""}
${cta(base, `Want a site like these for your business? Tell us about it`)}`,
  });
}

/* ---------- Project pages ---------- */
for (const p of projects) {
  const C = CATEGORIES[p.category];
  const type = p.tags[0];
  const features = p.tags.slice(1, 4).map((t) => t.toLowerCase());
  const crumbs = [["Home", ""], ["Work", "work/"], [C.label, catPath(p.category)], [p.name, `work/${p.id}/`]];
  const same = inCat(p.category).filter((x) => x.id !== p.id);
  const related = [...same, ...projects.filter((x) => x.category !== p.category && x.id !== p.id)].slice(0, 3);
  let description = `${p.name} is a live ${type.toLowerCase()} website demo by SAMA, a web design studio in Beirut, Lebanon. Includes ${features.join(", ")}.`;
  if (description.length < 110) description += " Try it on any screen.";
  page({
    path: `work/${p.id}/`, priority: "0.6", ogType: "article",
    title: `${p.name}: ${type} Website Design | SAMA`, description, image: `assets/work/${p.id}-og.jpg`,
    ld: [crumbsLd(crumbs), { "@type": "CreativeWork", "@id": abs(`work/${p.id}/#work`), name: `${p.name} website demo`, description: p.description, image: abs(`assets/work/${p.id}-og.jpg`), creator: { "@id": `${SITE.url}/#org` }, genre: "Web design", keywords: p.tags.join(", "), inLanguage: "en" }],
    body: (base) => `${breadcrumb(crumbs, base)}
<section class="intro intro--page"><div><span class="mono">${esc(type)} · demo</span><h1>${esc(p.name)}: ${esc(type.toLowerCase())} <em>website</em></h1></div>
<div class="intro__actions"><a class="btn" href="${base}demos/${p.id}/index.html" data-preview="${p.id}" rel="nofollow">Live preview →</a><a class="btn btn--ghost" href="${base}contact/?project=${encodeURIComponent(p.name)}">I want one like this</a></div></section>
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
    <dt class="mono">Category</dt><dd><a class="link" href="${base}${catPath(p.category)}">${esc(C.label)}</a></dd>
    <dt class="mono">Typography</dt><dd>${esc(p.fonts)}</dd>
    <dt class="mono">Built with</dt><dd>${esc(p.stack)}</dd>
    <dt class="mono">Palette</dt><dd class="swatches">${p.palette.map((c) => `<span style="background:${esc(c)}" title="${esc(c)}"></span>`).join("")}</dd>
    <dt class="mono">Highlights</dt><dd class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</dd>
  </dl>
</div>
<section class="block" aria-labelledby="more-h"><span class="mono">Keep looking</span><h2 id="more-h">More <em>designs</em></h2>${`<div class="grid">${related.map((x, i) => card(x, base, 99, false)).join("")}</div>`}</section>
${cta(base, `Want a site like ${esc(p.name)}? Tell us about your business`)}`,
  });
}

/* ---------- Service pages ---------- */
for (const s of SERVICES) {
  const crumbs = [["Home", ""], [s.tab, `${s.slug}/`]];
  const list = s.examples.map((id) => projects.find((p) => p.id === id));
  page({
    path: `${s.slug}/`, priority: "0.9", title: s.title, description: s.meta,
    ld: [crumbsLd(crumbs), faqLd(s.faq), { "@type": "Service", "@id": abs(`${s.slug}/#service`), name: s.tab, serviceType: s.tab, description: s.meta, provider: { "@id": `${SITE.url}/#org` }, areaServed: [{ "@type": "Country", name: "Lebanon" }, { "@type": "Place", name: "Worldwide" }], url: abs(`${s.slug}/`) }],
    body: (base) => `${breadcrumb(crumbs, base)}
<section class="intro intro--page"><div><span class="mono">SAMA · ${SITE.city}, ${SITE.country}</span><h1>${s.h1}</h1></div><p>${esc(s.lead)}</p></section>
<div class="detail">
  <div class="prose">${s.sections.map((x) => `<h2>${esc(x.h)}</h2><p>${esc(x.p)}</p>`).join("\n")}</div>
  <aside class="facts"><h2 class="mono">What's included</h2><ul class="ticks">${s.includes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><a class="btn" href="${base}contact/?service=${encodeURIComponent(s.tab)}">Get a fixed quote ↗</a></aside>
</div>
<section class="block" aria-labelledby="ex-h"><span class="mono">Try before you ask</span><h2 id="ex-h">Examples you can <em>open</em></h2><div class="grid">${list.map((p) => card(p, base, 99, false)).join("")}</div></section>
${processBlock()}
${faqBlock(s.faq)}
<nav class="also" aria-label="Other services">Other services: ${SERVICES.filter((x) => x !== s).map((x) => `<a class="link" href="${base}${x.slug}/">${esc(x.tab)}</a>`).join(" · ")}</nav>
${cta(base)}`,
  });
}

/* ---------- About ---------- */
{
  const crumbs = [["Home", ""], ["About", "about/"]];
  page({
    path: "about/", priority: "0.7", title: ABOUT.title, description: ABOUT.meta, ld: [crumbsLd(crumbs)],
    body: (base) => `${breadcrumb(crumbs, base)}
<section class="intro intro--page"><div><span class="mono">About SAMA · سماء</span><h1>${ABOUT.h1}</h1></div><p>${esc(ABOUT.lead)}</p></section>
<div class="prose prose--wide">${ABOUT.sections.map((x) => `<h2>${esc(x.h)}</h2><p>${esc(x.p)}</p>`).join("\n")}
<p><a class="link" href="${SITE.founder.sameAs[1]}" rel="noopener">Ahmad on LinkedIn</a> · <a class="link" href="${SITE.founder.sameAs[0]}" rel="noopener">Ahmad on GitHub</a> · <a class="link" href="${SITE.sameAs[0]}" rel="noopener">SAMA on GitHub</a></p></div>
<section class="block" aria-labelledby="promise-h"><span class="mono">Our promise</span><h2 id="promise-h">No guesswork. <em>No surprises.</em></h2><ul class="promise">${PROMISE.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}</ul></section>
${cta(base)}`,
  });
}

/* ---------- Contact ---------- */
{
  const crumbs = [["Home", ""], ["Contact", "contact/"]];
  page({
    path: "contact/", priority: "0.8",
    title: "Contact SAMA: Web Design Quote in Beirut, Lebanon",
    description: "Contact SAMA, a web design studio in Beirut, Lebanon. Tell us about your website, app or video project and get a fixed quote within 24 hours.",
    ld: [crumbsLd(crumbs), { "@type": "ContactPage", url: abs("contact/"), mainEntity: { "@id": `${SITE.url}/#org` } }],
    body: (base) => `${breadcrumb(crumbs, base)}
<section class="intro intro--page"><div><span class="mono">Contact</span><h1>Let's build <em>something</em></h1></div><p>Tell us about your project and we'll get back to you within 24 hours with ideas, a timeline and a quote.</p></section>
<div class="detail detail--contact">
  <form class="form" id="contactForm" data-email="${SITE.email}">
    <label for="fName">Your name</label><input id="fName" name="name" autocomplete="name" required />
    <label for="fEmail">Email</label><input id="fEmail" name="email" type="email" autocomplete="email" required />
    <label for="fService">What do you need?</label>
    <select id="fService" name="service" class="select">${SERVICES.map((s) => `<option>${esc(s.tab)}</option>`).join("")}<option>Something else</option></select>
    <label for="fMsg">About your project</label><textarea id="fMsg" name="message" rows="6" required placeholder="Your business, your goals and your timeline"></textarea>
    <button class="btn" type="submit">Send message ↗</button>
    <p class="form__note">This opens your email app with your message ready to send.</p>
  </form>
  <aside class="facts">
    <dt class="mono">Email</dt><dd><a class="link" href="mailto:${SITE.email}">${SITE.email}</a></dd>
    ${SITE.whatsapp ? `<dt class="mono">WhatsApp</dt><dd><a class="link" href="https://wa.me/${waNum}" rel="noopener">${esc(SITE.whatsapp)}</a></dd>` : ""}
    <dt class="mono">Location</dt><dd>${SITE.city}, ${SITE.country}<br />Working worldwide</dd>
    <dt class="mono">Reply time</dt><dd>Within 24 hours</dd>
  </aside>
</div>`,
  });
}

/* ---------- 404: served from any address, so it uses paths from the site root ---------- */
page({
  path: "404.html", baseOverride: "/", noindex: true, title: "Page not found | SAMA",
  description: "This page does not exist. Browse SAMA's website demos and services, or contact our web design studio in Beirut, Lebanon.",
  body: (base) => `<section class="intro intro--page"><div><span class="mono">404</span><h1>Nothing here <em>yet</em>.</h1></div><p>This page has moved or never existed. <a class="link" href="${base}">See all our work</a> or <a class="link" href="${base}contact/">contact us</a>.</p></section>`,
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
writeFileSync(join(root, "site.webmanifest"), JSON.stringify({ name: "SAMA", short_name: "SAMA", start_url: "/", display: "standalone", background_color: "#0f0f0e", theme_color: "#0f0f0e", icons: [{ src: "/assets/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png" }] }, null, 2) + "\n");
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
writeFileSync(join(root, "assets", "projects.js"), `window.SAMA_PROJECTS=${JSON.stringify(projects.map(({ id, name, category, description, tags, palette, fonts, stack }) => ({ id, name, category, description, tags, palette, fonts, stack }))).replace(/</g, "\\u003c")};\n`);

console.log(`${sitemap.length} indexable pages + 404`);
if (!existsSync(join(root, "assets", "site.css"))) console.warn("assets/site.css is missing");
