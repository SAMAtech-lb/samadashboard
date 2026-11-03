// Prepares the project data before a build: node tools/sync.mjs
// Every demo gets a noindex tag and a "Demo site by SAMA" label, images of projects no longer on the site are removed,
// and tools/.cache/missing.txt lists the projects that still need screenshots.
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const library = JSON.parse(readFileSync(join(root, "data", "library.json"), "utf8"));
const list = JSON.parse(readFileSync(join(root, "data", "list.json"), "utf8"));

const stop = (m) => { console.error("Stopped: " + m); process.exit(1); };
if (!Array.isArray(list) || !list.length) stop("data/list.json is empty.");
if (new Set(list).size !== list.length) stop("data/list.json lists a project twice.");
for (const id of list) {
  if (!library.some((p) => p.id === id)) stop(`${id} is on the list but not in data/library.json.`);
  if (!existsSync(join(root, "demos", id, "index.html"))) stop(`${id} has no demos/${id}/index.html.`);
}

const robots = '<meta name="robots" content="noindex, follow" />';
for (const id of readdirSync(join(root, "demos"))) {
  const file = join(root, "demos", id, "index.html");
  if (!existsSync(file)) continue;
  const old = readFileSync(file, "utf8");
  let html = old.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, "").replace(/<!--sama-pill-->[\s\S]*?<!--\/sama-pill-->\s*/g, "");
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => `${m}\n  ${robots}`) : robots + "\n" + html;
  const href = list.includes(id) ? `../../work/${id}/` : "../../";
  const pill = `<!--sama-pill--><script>if(top===self&&location.search.indexOf("nointro")<0){var a=document.createElement("a");a.href="${href}";a.textContent="Demo site by SAMA";a.style.cssText="position:fixed;left:14px;bottom:14px;z-index:2147483647;padding:8px 14px;border-radius:999px;background:#060a18;color:#9cc4ff;font:500 13px/1.2 system-ui,sans-serif;text-decoration:none;box-shadow:0 4px 18px rgba(0,0,0,.35)";document.body.appendChild(a)}</script><!--/sama-pill-->`;
  const at = html.toLowerCase().lastIndexOf("</body>");
  html = at === -1 ? html + pill : html.slice(0, at) + pill + "\n" + html.slice(at);
  if (html !== old) writeFileSync(file, html);
}

const work = join(root, "assets", "work");
mkdirSync(work, { recursive: true });
const keep = new Set(list);
for (const f of readdirSync(work)) { const id = f.replace(/-(480|900|og|m)\.(webp|jpg)$/, ""); if (!keep.has(id)) rmSync(join(work, f)); }
const missing = list.filter((id) => !existsSync(join(work, `${id}-900.webp`)) || !existsSync(join(work, `${id}-m.webp`)));
mkdirSync(join(root, "tools", ".cache"), { recursive: true });
writeFileSync(join(root, "tools", ".cache", "missing.txt"), missing.join(" "));
console.log(`${list.length} on the site, ${library.length} in the library, ${missing.length} need screenshots`);
