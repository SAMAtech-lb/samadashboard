/* SAMA Admin. There is no server: this page talks directly to GitHub with the admin's own token.
   Publishing makes one commit. A GitHub Action then builds the pages, and the site updates by itself.
   Text from data is always added with textContent, so nothing in it can run as code. */
(function () {
  const REPO = "SAMAtech-lb/samadashboard", BRANCH = "main", API = "https://api.github.com/repos/" + REPO, TARGET = 30;
  const MAX_TOTAL = 40 * 1024 * 1024, MAX_FILE = 20 * 1024 * 1024;
  const $ = (id) => document.getElementById(id);
  let token = "", library = [], saved = [], list = [], uploads = [], newMeta = [], watching = 0;

  const store = { get() { try { return sessionStorage.getItem("sama-token") || localStorage.getItem("sama-token") || ""; } catch (e) { return ""; } }, set(t, keep) { try { (keep ? localStorage : sessionStorage).setItem("sama-token", t); } catch (e) {} }, clear() { try { sessionStorage.removeItem("sama-token"); localStorage.removeItem("sama-token"); } catch (e) {} } };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  let toastT; const toast = (m) => { const t = $("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2800); };
  const byId = (id) => library.find((p) => p.id === id) || newMeta.find((p) => p.id === id);
  const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  /* ---------- GitHub ---------- */
  async function api(path, opts) {
    opts = opts || {};
    const r = await fetch(API + path, { method: opts.method || "GET", cache: "no-store", headers: { Authorization: "Bearer " + token, Accept: opts.raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(opts.body ? { "Content-Type": "application/json" } : {}) }, body: opts.body ? JSON.stringify(opts.body) : undefined });
    if (!r.ok) { const e = new Error("GitHub " + r.status); e.status = r.status; throw e; }
    return opts.raw ? r.text() : r.json();
  }
  const readJson = async (path) => JSON.parse(await api("/contents/" + path + "?ref=" + BRANCH, { raw: true }));
  const explain = (e) => e.status === 401 ? "GitHub rejected this token. It may be wrong or expired." : e.status === 403 || e.status === 404 ? "This token can't edit the samadashboard repository. Check its permissions." : e.status ? "GitHub returned an error (" + e.status + "). Please try again." : "Couldn't reach GitHub. Check your connection.";

  /* ---------- Sign in ---------- */
  async function signIn(t, keep) {
    token = t;
    const repo = await api("");
    if (repo.permissions && repo.permissions.push === false) { const e = new Error("no push"); e.status = 403; throw e; }
    [library, saved] = await Promise.all([readJson("data/library.json"), readJson("data/list.json")]);
    list = saved.slice();
    if (keep !== null) store.set(t, keep);
    $("login").hidden = true;
    $("app").hidden = false;
    const cats = [...new Set(library.map((p) => p.category))].sort();
    fillSelect($("cat"), [["", "All categories"], ...cats.map((c) => [c, c])]);
    fillSelect($("nCat"), cats.map((c) => [c, c]));
    render();
  }
  function fillSelect(s, items) { s.replaceChildren(...items.map(([v, t]) => { const o = el("option", "", t); o.value = v; return o; })); }
  $("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const b = $("loginBtn");
    b.disabled = true; b.textContent = "Signing in…"; $("loginErr").textContent = "";
    try { await signIn($("token").value.trim(), $("remember").checked); $("token").value = ""; }
    catch (err) { token = ""; $("loginErr").textContent = explain(err); }
    b.disabled = false; b.textContent = "Sign in";
  });
  $("signOut").addEventListener("click", () => { if (dirty() && !confirm("You have changes that aren't published. Sign out anyway?")) return; store.clear(); token = ""; list = saved = []; uploads = []; newMeta = []; location.reload(); });

  /* ---------- Rows ---------- */
  function thumb(p) {
    const box = el("div", "row__pal");
    (p.palette || []).slice(0, 4).forEach((c) => { const i = el("i"); i.style.background = c; box.appendChild(i); });
    if (!saved.includes(p.id) && !p.hasImage) return box;
    const img = el("img", "row__img"); img.loading = "lazy"; img.alt = ""; img.width = 84; img.height = 54;
    img.src = "../assets/work/" + p.id + "-480.webp";
    img.addEventListener("error", () => img.replaceWith(box), { once: true });
    return img;
  }
  function info(p, badge) {
    const d = el("div");
    d.append(el("div", "row__name", p.name));
    const sub = el("div", "row__sub", p.category + " · " + (p.tags || [])[0]);
    if (badge) { sub.append(" · "); sub.append(el("em", "", badge)); }
    d.append(sub);
    return d;
  }
  function icon(label, text, fn, off) { const b = el("button", "ico", text); b.type = "button"; b.setAttribute("aria-label", label); b.title = label; b.disabled = !!off; b.addEventListener("click", fn); return b; }
  function preview(p) {
    if (newMeta.includes(p)) return el("span");
    const a = el("a", "ico", "↗"); a.href = "../demos/" + p.id + "/index.html?nointro"; a.target = "_blank"; a.rel = "noopener"; a.title = "Preview " + p.name; a.setAttribute("aria-label", "Preview " + p.name);
    return a;
  }
  function render() {
    const site = $("siteList");
    site.replaceChildren(...list.map((id, i) => {
      const p = byId(id), li = el("li", "row" + (saved.includes(id) ? "" : " is-new")), btns = el("div", "row__btns");
      btns.append(icon("Move " + p.name + " up", "↑", () => move(i, -1), i === 0), icon("Move " + p.name + " down", "↓", () => move(i, 1), i === list.length - 1), preview(p));
      const rm = el("button", "act act--rm", "Remove"); rm.type = "button"; rm.addEventListener("click", () => remove(id)); btns.append(rm);
      li.append(el("span", "row__n", i + 1), thumb(p), info(p, saved.includes(id) ? "" : "New"), btns);
      return li;
    }));
    $("siteCount").textContent = list.length;
    const q = $("q").value.trim().toLowerCase(), cat = $("cat").value;
    const rest = [...library, ...newMeta].filter((p) => !list.includes(p.id));
    const shown = rest.filter((p) => (!cat || p.category === cat) && (!q || [p.name, p.category, ...(p.tags || [])].join(" ").toLowerCase().includes(q)));
    $("libList").replaceChildren(...shown.map((p) => {
      const li = el("li", "row"), btns = el("div", "row__btns"), add = el("button", "act", "Add");
      add.type = "button"; add.addEventListener("click", () => { list.push(p.id); render(); toast(p.name + " added at #" + list.length + ". Publish to make it live."); });
      btns.append(preview(p), add);
      li.append(el("span", "row__n", ""), thumb(p), info(p, saved.includes(p.id) ? "Removing" : ""), btns);
      return li;
    }));
    $("libCount").textContent = rest.length;
    $("libEmpty").hidden = shown.length > 0;
    renderBar();
  }
  function move(i, d) { const [x] = list.splice(i, 1); list.splice(i + d, 0, x); render(); }
  function remove(id) {
    if (list.length <= 1) return toast("The website needs at least one project.");
    list = list.filter((x) => x !== id);
    render();
  }
  $("q").addEventListener("input", render);
  $("cat").addEventListener("change", render);

  /* ---------- Changes ---------- */
  const added = () => list.filter((id) => !saved.includes(id));
  const gone = () => saved.filter((id) => !list.includes(id));
  const reordered = () => { const a = saved.filter((x) => list.includes(x)), b = list.filter((x) => saved.includes(x)); return a.join() !== b.join(); };
  const dirty = () => added().length > 0 || gone().length > 0 || reordered() || newMeta.length > 0;
  function summary() {
    const s = [], a = added().length, g = gone().length;
    if (a) s.push(a + " added");
    if (g) s.push(g + " removed");
    if (reordered()) s.push("order changed");
    const n = newMeta.length - newMeta.filter((p) => list.includes(p.id)).length;
    if (n) s.push(n + " new in library");
    return s.join(" · ");
  }
  function renderBar() {
    if (watching) return;
    $("bar").hidden = !dirty();
    if (!dirty()) return;
    const warn = list.length > TARGET ? " · over your top " + TARGET : "";
    $("barText").textContent = summary() + warn;
    $("discard").hidden = false; $("publish").hidden = false; $("publish").disabled = false; $("publish").textContent = "Publish to website";
  }
  $("discard").addEventListener("click", () => { list = saved.slice(); uploads = []; newMeta = []; render(); });
  addEventListener("beforeunload", (e) => { if (token && dirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- Publish: one commit with everything in it ---------- */
  const toB64 = (buf) => { const b = new Uint8Array(buf); let s = ""; for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode.apply(null, b.subarray(i, i + 32768)); return btoa(s); };
  async function commit(message) {
    const head = await api("/git/ref/heads/" + BRANCH), parent = head.object.sha, base = await api("/git/commits/" + parent);
    const tree = [{ path: "data/list.json", mode: "100644", type: "blob", content: JSON.stringify(list, null, 2) + "\n" }];
    if (newMeta.length) {
      /* Read the newest library so another admin's upload is never overwritten */
      const current = await readJson("data/library.json");
      tree.push({ path: "data/library.json", mode: "100644", type: "blob", content: JSON.stringify([...current, ...newMeta], null, 2) + "\n" });
    }
    for (const u of uploads) {
      const blob = await api("/git/blobs", { method: "POST", body: { content: toB64(await u.file.arrayBuffer()), encoding: "base64" } });
      tree.push({ path: "demos/" + u.id + "/" + u.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const t = await api("/git/trees", { method: "POST", body: { base_tree: base.tree.sha, tree } });
    const c = await api("/git/commits", { method: "POST", body: { message, tree: t.sha, parents: [parent] } });
    await api("/git/refs/heads/" + BRANCH, { method: "PATCH", body: { sha: c.sha } });
    return c.sha;
  }
  $("publish").addEventListener("click", async () => {
    const b = $("publish");
    b.disabled = true; b.textContent = "Publishing…"; $("discard").hidden = true;
    const names = (ids) => ids.map((id) => byId(id).name).join(", ");
    const parts = [added().length && "add " + names(added()), gone().length && "remove " + names(gone()), reordered() && "reorder"].filter(Boolean);
    const message = "Admin: " + (parts.join("; ") || "add to library").slice(0, 200);
    try {
      /* Stop if someone else changed the list since this page loaded */
      const remote = await readJson("data/list.json");
      if (remote.join() !== saved.join()) { $("barText").textContent = "The list was changed somewhere else. Reload this page, then make your changes again."; b.disabled = false; b.textContent = "Publish to website"; $("discard").hidden = false; return; }
      let sha;
      try { sha = await commit(message); }
      catch (e) { if (e.status !== 422) throw e; sha = await commit(message); } /* the build pushed at the same moment: try once more */
      library = [...library, ...newMeta];
      saved = list.slice(); uploads = []; newMeta = [];
      render();
      watch(sha);
    } catch (e) {
      $("barText").textContent = explain(e) + " Nothing was changed.";
      b.disabled = false; b.textContent = "Try again"; $("discard").hidden = false;
    }
  });

  /* ---------- Follow the build until the new version is really live ---------- */
  function watch(sha) {
    const id = ++watching, t0 = Date.now();
    $("bar").hidden = false; $("discard").hidden = true; $("publish").hidden = true;
    const say = (m, link) => { const p = $("barText"); p.textContent = m; if (link) { p.append(" "); const a = el("a", "", "See the build log"); a.href = "https://github.com/" + REPO + "/actions"; a.target = "_blank"; a.rel = "noopener"; p.append(a); } };
    const end = (m, link) => { watching = 0; say(m, link); $("bar").hidden = false; setTimeout(() => { if (!watching && !dirty()) $("bar").hidden = true; }, 15000); };
    say("Saved. Building the website, usually 1 to 4 minutes…");
    (async function poll() {
      if (id !== watching) return;
      const mins = (Date.now() - t0) / 60000;
      try {
        const built = await (await fetch("../data/built.json?t=" + Date.now(), { cache: "no-store" })).json();
        if (built.source === sha) { end("Done. The website is updated."); toast("The website is updated."); return; }
      } catch (e) {}
      try {
        const r = await (await fetch(API + "/actions/runs?head_sha=" + sha + "&per_page=1", { cache: "no-store" })).json();
        const run = (r.workflow_runs || [])[0];
        if (run && run.conclusion && run.conclusion !== "success") { end("The build failed, so the website didn't change. Your list is saved.", true); return; }
      } catch (e) {}
      if (mins > 12) { end("This is taking longer than usual. Your list is saved.", true); return; }
      setTimeout(poll, 8000);
    })();
  }

  /* ---------- New project ---------- */
  let picked = [];
  const dlg = $("newDlg");
  $("newBtn").addEventListener("click", () => { $("newForm").reset(); picked = []; $("nFilesInfo").textContent = ""; $("newErr").textContent = ""; dlg.showModal(); $("nName").focus(); });
  $("newCancel").addEventListener("click", () => dlg.close());
  $("nFiles").addEventListener("change", (e) => {
    picked = [...e.target.files].map((f) => ({ file: f, path: f.webkitRelativePath.split("/").slice(1).join("/") })).filter((f) => f.path && !/(^|\/)(node_modules|\.git|\.claude|\.env[^/]*|\.DS_Store|Thumbs\.db)(\/|$)/.test(f.path));
    const size = picked.reduce((s, f) => s + f.file.size, 0);
    $("nFilesInfo").textContent = picked.length + " file(s), " + (size / 1048576).toFixed(1) + " MB";
  });
  $("newSave").addEventListener("click", () => {
    const err = (m) => { $("newErr").textContent = m; };
    const name = $("nName").value.trim(), type = $("nType").value.trim(), desc = $("nDesc").value.trim(), id = slug(name);
    const tags = [type, ...$("nTags").value.split(",").map((t) => t.trim()).filter(Boolean)].slice(0, 5);
    const all = [...library, ...newMeta];
    if (!name || !id) return err("Enter a project name.");
    if (all.some((p) => p.id === id || p.name.toLowerCase() === name.toLowerCase())) return err("A project with this name already exists.");
    if (!type) return err("Enter the kind of business.");
    if (desc.length < 60) return err("Write at least 60 characters in the description.");
    if (!picked.length) return err("Choose the project's folder.");
    if (!picked.some((f) => f.path === "index.html")) return err("This folder has no index.html at its top level.");
    if (picked.some((f) => f.file.size > MAX_FILE)) return err("One of the files is larger than 20 MB.");
    if (picked.reduce((s, f) => s + f.file.size, 0) > MAX_TOTAL) return err("This folder is larger than 40 MB.");
    const meta = { id, name, category: $("nCat").value, description: desc, tags, palette: ["#0b1634", "#3d7bff", "#9cc4ff", "#ffffff"], fonts: "Custom", stack: "HTML · CSS · JavaScript" };
    newMeta.push(meta);
    uploads.push(...picked.map((f) => ({ id, path: f.path, file: f.file })));
    if ($("nOnSite").checked) list.push(id);
    dlg.close();
    render();
    toast(name + " is ready. Press Publish to upload it.");
  });

  /* ---------- Start ---------- */
  const t = store.get();
  if (t) signIn(t, null).catch((e) => { if (e.status === 401) store.clear(); token = ""; $("loginErr").textContent = explain(e); });
})();
