// Downloads the icons, fonts and photos the site hosts itself: node tools/fetch_assets.mjs
// Only needed again when an icon is added. Icons end up in tools/icons.json and are written inline into pages.
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const RI = ["arrow-right-up-line", "menu-4-line", "arrow-right-line", "eye-line", "price-tag-3-line", "calendar-check-line", "user-smile-line", "layout-masonry-line", "pen-nib-line", "smartphone-line", "film-line", "check-line", "arrow-down-line", "youtube-line", "advertisement-line", "magic-line", "play-fill", "chat-smile-2-line", "pencil-ruler-2-line", "code-s-slash-line", "rocket-2-line", "palette-line", "flashlight-line", "customer-service-2-line", "mail-line", "whatsapp-line", "map-pin-line", "github-fill", "linkedin-fill", "send-plane-2-line", "checkbox-circle-fill", "computer-line", "tablet-line", "arrow-left-s-line", "arrow-right-s-line", "close-line", "add-line", "information-line", "external-link-line", "time-line", "shopping-bag-3-line"];
const DEV = [["figma", "Figma"], ["html5", "HTML"], ["css3", "CSS"], ["javascript", "JavaScript"], ["react", "React"], ["nextjs", "Next.js"], ["flutter", "Flutter"], ["swift", "Swift"], ["kotlin", "Kotlin"], ["firebase", "Firebase"], ["premierepro", "Premiere Pro"], ["aftereffects", "After Effects"]];

const get = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(`${r.status} ${u}`); return r; };
const files = (await (await get("https://data.jsdelivr.com/v1/packages/npm/remixicon@4.5.0?structure=flat")).json()).files.map((f) => f.name);
const inner = (svg) => svg.replace(/<\?xml.*?\?>/s, "").match(/<svg[^>]*>(.*)<\/svg>/s)[1].trim();

const icons = {};
for (const n of RI) {
  const path = files.find((f) => f.endsWith(`/${n}.svg`) && f.startsWith("/icons/"));
  if (!path) throw new Error("no icon " + n);
  icons[n] = { box: "0 0 24 24", body: inner(await (await get(`https://cdn.jsdelivr.net/npm/remixicon@4.5.0${path}`)).text()) };
}
const tech = [];
for (const [n, label] of DEV) {
  let text;
  for (const v of ["plain", "original", "plain-wordmark"]) {
    const r = await fetch(`https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/${n}/${n}-${v}.svg`);
    if (r.ok) { text = await r.text(); console.log(n, v); break; }
  }
  if (!text) throw new Error("no devicon " + n);
  const box = text.match(/viewBox="([^"]+)"/)?.[1] || "0 0 128 128";
  tech.push({ label, box, body: inner(text).replace(/\s(fill|style)="[^"]*"/g, "").replace(/<defs>.*?<\/defs>/gs, "") });
}
writeFileSync(join(root, "tools", "icons.json"), JSON.stringify({ icons, tech }));

rmSync(join(root, "assets", "fonts"), { recursive: true, force: true });
mkdirSync(join(root, "assets", "fonts"), { recursive: true });
const UA = { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" } };
const css = await (await fetch("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syncopate:wght@700&display=swap", UA)).text();
const seen = new Set();
for (const m of css.matchAll(/\/\* latin \*\/\s*@font-face \{[^}]*font-family: '([^']+)'[^}]*url\((https:[^)]+\.woff2)\)/g)) {
  if (seen.has(m[1])) continue;
  seen.add(m[1]);
  const buf = Buffer.from(await (await fetch(m[2])).arrayBuffer());
  writeFileSync(join(root, "assets", "fonts", m[1].toLowerCase() + ".woff2"), buf);
  console.log(m[1], Math.round(buf.length / 1024), "KB");
}

mkdirSync(join(root, "tools", ".cache", "photos"), { recursive: true });
for (const [name, id] of [["sky", "1513002749550-c59d786b8e6c"], ["dusk", "1489549132488-d00b7eee80f1"], ["edit", "1574717024653-61fd2cf4d44d"]]) {
  const buf = Buffer.from(await (await get(`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`)).arrayBuffer());
  writeFileSync(join(root, "tools", ".cache", "photos", name + ".jpg"), buf);
}
console.log(Object.keys(icons).length, "icons,", tech.length, "tech logos");
