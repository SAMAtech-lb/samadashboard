// Takes the real screenshots used on the cards. Needs Microsoft Edge and a local server for this folder:
//   python -m http.server 8123     then     node tools/capture.mjs [id ...]
// Writes to tools/.cache; tools/images.py turns them into the files the site uses.
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cache = join(root, "tools", ".cache");
mkdirSync(cache, { recursive: true });
const only = process.argv.slice(2);
const list = (only.length ? only : JSON.parse(readFileSync(join(root, "data", "library.json"), "utf8")).map((p) => p.id)).map((id) => ({ id }));
const edge = process.env.CHROME || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9300 + Math.floor(Math.random() * 500);
const prof = join(tmpdir(), "samacap" + port);
const chrome = spawn(edge, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--user-data-dir=${prof}`, `--remote-debugging-port=${port}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let tgt;
for (let i = 0; i < 80 && !tgt; i++) {
  await sleep(250);
  try { tgt = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {}
}
const ws = new WebSocket(tgt.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const pend = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result ?? d.error); pend.delete(d.id); } };
const cdp = (method, params = {}) => new Promise((r) => { const i = ++n; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await cdp("Page.enable");
await cdp("Runtime.enable");
// Sliders and fade-ins would otherwise be caught halfway: ask each site for its still version
const still = (on) => cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: on ? "reduce" : "no-preference" }] });
const NEEDS_MOTION = new Set(["arch-varo"]); // its still version lays out differently
const READY = `(async () => { const end = Date.now() + 15000; const inView = (i) => { const r = i.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; }; while (Date.now() < end) { const imgs = [...document.images].filter(inView); if (document.readyState === "complete" && document.fonts.status === "loaded" && imgs.every((i) => i.complete)) break; await new Promise((r) => setTimeout(r, 200)); } await document.fonts.ready; return true; })()`;

for (const [suffix, w, h, mobile] of [["", 1440, 900, false], ["-m", 390, 844, true]]) {
  await cdp("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  for (const p of list) {
    await still(!NEEDS_MOTION.has(p.id));
    await cdp("Page.navigate", { url: `http://127.0.0.1:8123/demos/${p.id}/index.html?nointro` });
    await sleep(1200);
    await cdp("Runtime.evaluate", { expression: READY, awaitPromise: true });
    await sleep(NEEDS_MOTION.has(p.id) ? 6000 : 2500); // let any opening animation finish
    const r = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 92 });
    writeFileSync(join(cache, p.id + suffix + ".jpg"), Buffer.from(r.data, "base64"));
    console.log(p.id + suffix);
  }
}
ws.close();
chrome.kill();
process.exit(0);
