// Sends the project list from Forma to samatechlb.com. Double-click publish.bat to run it.
//   node tools/publish.mjs [--no-push] [--forma=<folder>]
// Forma's "Save to website" button writes portfolio.js. This reads that file, updates the demos,
// takes screenshots of new projects only, rebuilds the site, checks it, then pushes to GitHub.
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const noPush = args.includes("--no-push");
const forma = args.find((a) => a.startsWith("--forma="))?.slice(8);
const today = new Date().toISOString().slice(0, 10);
const env = { ...process.env };
const run = (cmd, a) => { const r = spawnSync(cmd, a, { cwd: root, stdio: "inherit", env }); if (r.status !== 0) { console.error(`\nStopped: "${cmd} ${a.join(" ")}" failed. Nothing was published.`); process.exit(1); } };
const git = (...a) => spawnSync("git", a, { cwd: root, encoding: "utf8", env });
const list = () => JSON.parse(readFileSync(join(root, "data", "projects.json"), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const before = list();
run("node", ["tools/import.mjs", ...(forma ? [forma] : [])]);
const after = list();
const work = join(root, "assets", "work");
const has = (p) => existsSync(join(work, `${p.id}-900.webp`)) && existsSync(join(work, `${p.id}-m.webp`));

/* Screenshots: only for projects that do not have them yet */
const missing = after.filter((p) => !has(p)).map((p) => p.id);
if (missing.length) {
  console.log(`\nTaking screenshots of ${missing.length} new project(s). This takes about ${missing.length * 15} seconds...`);
  const server = spawn("python", ["-m", "http.server", "8123", "--bind", "127.0.0.1"], { cwd: root, stdio: "ignore" });
  await sleep(1500);
  const r = spawnSync("node", ["tools/capture.mjs", ...missing], { cwd: root, stdio: "inherit" });
  server.kill();
  if (r.status !== 0) { console.error("\nStopped: screenshots failed. Nothing was published."); process.exit(1); }
  run("python", ["tools/images.py"]);
}

/* Remove images of projects that left the list */
const keep = new Set(after.map((p) => p.id));
for (const f of readdirSync(work)) { const id = f.replace(/-(480|900|og|m)\.(webp|jpg)$/, ""); if (!keep.has(id)) rmSync(join(work, f)); }

// The date in the sitemap only moves when the list really changed
if (before.map((p) => p.id).join() !== after.map((p) => p.id).join()) env.SAMA_UPDATED = today;
run("node", ["tools/build.mjs"]);
run("node", ["tools/check.mjs"]);

const was = new Set(before.map((p) => p.id));
const added = after.filter((p) => !was.has(p.id)).map((p) => p.name);
const removed = before.filter((p) => !keep.has(p.id)).map((p) => p.name);
const moved = !added.length && !removed.length && before.map((p) => p.id).join() !== after.map((p) => p.id).join();
console.log(`\nProjects on the site: ${after.length}`);
if (added.length) console.log("Added:   " + added.join(", "));
if (removed.length) console.log("Removed: " + removed.join(", "));
if (moved) console.log("The order changed.");

if (noPush) { console.log("\n--no-push: stopped before GitHub."); process.exit(0); }

const top = git("rev-parse", "--show-toplevel").stdout.trim().replace(/\\/g, "/").toLowerCase();
if (top !== root.replace(/\\/g, "/").toLowerCase()) { console.error("\nStopped: this folder is not its own git repository."); process.exit(1); }
if (!git("status", "--porcelain").stdout.trim()) { console.log("
Nothing has changed, so there is nothing to publish."); process.exit(0); }
git("add", "-A");
const note = [added.length && `add ${added.join(", ")}`, removed.length && `remove ${removed.join(", ")}`, moved && "reorder"].filter(Boolean).join("; ") || "wording";
run("git", ["commit", "-q", "-m", `Update site: ${note}`]);
run("git", ["push", "origin", "main"]);
console.log("\nPublished. samatechlb.com updates in about a minute.");
