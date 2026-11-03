// Checks every built page for SEO mistakes and broken links: node tools/check.mjs
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); if (statSync(p).isDirectory()) return /^(demos|tools|data|\.git)$/.test(f) ? [] : walk(p); return f === "index.html" ? [p] : []; });
const pages = walk(root);
const problems = [];
const bad = (page, msg) => problems.push(`${page.replace(root, "") || "/"}: ${msg}`);
const titles = new Map(), descs = new Map();
const words = [];
const inlinks = new Map();
const url = (p) => "/" + p.replace(root, "").replace(/\\/g, "/").replace(/^\//, "").replace(/index\.html$/, "");

for (const p of pages) {
  const h = readFileSync(p, "utf8");
  const title = h.match(/<title>(.*?)<\/title>/s)?.[1] || "";
  const desc = h.match(/<meta name="description" content="(.*?)"/)?.[1] || "";
  if (!title || title.length > 62) bad(p, `title length ${title.length}`);
  if (desc.length < 80 || desc.length > 160) bad(p, `description length ${desc.length}`);
  if (titles.has(title)) bad(p, `duplicate title with ${titles.get(title)}`); titles.set(title, p);
  if (descs.has(desc)) bad(p, `duplicate description`); descs.set(desc, p);
  if ((h.match(/<h1[\s>]/g) || []).length !== 1) bad(p, "must have exactly one h1");
  const canonical = h.match(/rel="canonical" href="(.*?)"/)?.[1];
  const expected = "https://samatechlb.com" + url(p);
  if (canonical !== expected) bad(p, `canonical ${canonical} should be ${expected}`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) { try { JSON.parse(m[1]); } catch { bad(p, "invalid JSON-LD"); } }
  for (const m of h.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]+"/.test(m[0])) bad(p, `image without alt: ${m[0].slice(0, 80)}`);
    if (!/\bwidth="\d+"/.test(m[0]) || !/\bheight="\d+"/.test(m[0])) bad(p, "image without size");
  }
  for (const m of h.matchAll(/(?:href|src)="([^"#]*)"/g)) {
    const v = m[1];
    if (!v || /^(https?:|mailto:|data:)/.test(v)) continue;
    const clean = v.split("?")[0];
    let t = resolve(dirname(p), clean || ".");
    const isDir = !existsSync(t) || statSync(t).isDirectory();
    if (isDir) t = join(t, "index.html");
    if (!existsSync(t)) bad(p, `broken link ${v}`);
    else if (t.endsWith("index.html") && t !== p) inlinks.set(t, (inlinks.get(t) || 0) + 1);
  }
  const text = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<head[\s\S]*?<\/head>|<aside class="side"[\s\S]*?<\/aside>|<footer[\s\S]*?<\/footer>/g, " ").replace(/<[^>]+>/g, " ");
  words.push([text.trim().split(/\s+/).length, url(p)]);
}
for (const p of pages) if (!p.includes("\\demos\\") && !inlinks.get(p) && url(p) !== "/") bad(p, "no page links here");

const sm = readFileSync(join(root, "sitemap.xml"), "utf8");
const locs = [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].replace("https://samatechlb.com", ""));
for (const l of locs) if (!existsSync(join(root, l, "index.html"))) problems.push(`sitemap: ${l} has no page`);
for (const p of pages) if (!locs.includes(url(p))) bad(p, "missing from sitemap");

const demos = readdirSync(join(root, "demos"));
for (const d of demos) if (!/name="robots" content="noindex/.test(readFileSync(join(root, "demos", d, "index.html"), "utf8"))) problems.push(`demo ${d} is missing noindex`);

words.sort((a, b) => a[0] - b[0]);
console.log(`${pages.length} pages, ${locs.length} in sitemap, ${demos.length} demos (all noindex checked)`);
console.log("Fewest words:", words.slice(0, 4).map(([n, u]) => `${u} ${n}`).join(" | "));
console.log("Most words:", words.slice(-4).map(([n, u]) => `${u} ${n}`).join(" | "));
console.log(problems.length ? `PROBLEMS (${problems.length}):\n` + problems.slice(0, 40).join("\n") : "No problems found");
process.exit(problems.length ? 1 : 0);
