// Copies the SAMA top 30 out of Forma Studio into this site.
// Run it again after changing the list in Forma: node tools/import.mjs
// Forma itself is only read, never changed.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const forma = process.argv[2] || join(root, "..", "studio-dashboard");

const ctx = {};
vm.createContext(ctx);
vm.runInContext(readFileSync(join(forma, "templates.js"), "utf8") + ";this.T=TEMPLATES", ctx);
vm.runInContext(readFileSync(join(forma, "portfolio.js"), "utf8") + ";this.P=SAMA_DEFAULT", ctx);

const projects = ctx.P.map((id, i) => {
  const t = ctx.T.find((x) => x.id === id && x.status === "live");
  if (!t) throw new Error(`${id} is on the list but is not a live template`);
  const { name, category, description, tags, palette, fonts, stack } = t;
  return { id, rank: i + 1, name, category, description, tags, palette, fonts, stack };
});

mkdirSync(join(root, "data"), { recursive: true });
writeFileSync(join(root, "data", "projects.json"), JSON.stringify(projects, null, 2) + "\n");

rmSync(join(root, "demos"), { recursive: true, force: true });
for (const p of projects) {
  const dest = join(root, "demos", p.id);
  cpSync(join(forma, "templates", p.id), dest, { recursive: true, filter: (s) => !/node_modules|\.git$|\.claude/.test(s) });
  const file = join(dest, "index.html");
  let html = readFileSync(file, "utf8");
  // Demos use fictional businesses: keep them out of Google, and label them when opened on their own.
  const robots = '<meta name="robots" content="noindex, follow" />';
  html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/i, "");
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => `${m}\n  ${robots}`) : robots + html;
  const pill = `<script>if(top===self&&location.search.indexOf("nointro")<0){var a=document.createElement("a");a.href="../../work/${p.id}/";a.textContent="Demo site by SAMA";a.style.cssText="position:fixed;left:14px;bottom:14px;z-index:2147483647;padding:8px 14px;border-radius:999px;background:#060a18;color:#9cc4ff;font:500 13px/1.2 system-ui,sans-serif;text-decoration:none;box-shadow:0 4px 18px rgba(0,0,0,.35)";document.body.appendChild(a)}</script>`;
  const at = html.toLowerCase().lastIndexOf("</body>");
  html = at === -1 ? html + pill : html.slice(0, at) + pill + "\n" + html.slice(at);
  writeFileSync(file, html);
}

const size = (d) => readdirSync(d).reduce((s, f) => { const q = statSync(join(d, f)); return s + (q.isDirectory() ? size(join(d, f)) : q.size); }, 0);
console.log(`${projects.length} projects imported, demos ${(size(join(root, "demos")) / 1e6).toFixed(1)} MB`);
