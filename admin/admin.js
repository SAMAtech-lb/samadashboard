/* SAMA Admin. There is no server: this page talks directly to GitHub.
   Email and password unlock a GitHub token kept encrypted in vault.json; neither is saved or sent anywhere.
   Publishing makes one commit. A GitHub Action then builds the pages, and the site updates by itself.
   Text from data is always added with textContent, so nothing in it can run as code. */
(function () {
  /* The browser only allows the encryption below on a secure connection */
  if (location.protocol === "http:" && !/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) { location.replace("https://" + location.host + location.pathname); return; }

  const REPO = "SAMAtech-lb/samadashboard", BRANCH = "main", API = "https://api.github.com/repos/" + REPO, TARGET = 30, ITERATIONS = 600000;
  const MAX_TOTAL = 40 * 1024 * 1024, MAX_FILE = 20 * 1024 * 1024, MIN_PASSWORD = 14;
  const $ = (id) => document.getElementById(id);
  let token = "", vault = null, library = [], saved = [], list = [], uploads = [], newMeta = [], watching = 0, filter = "all", shown = [], viewing = null;

  /* The token is only ever held in this variable's memory, never in browser storage, so reloading signs out.
     Also clear anything an earlier version of this page may have saved. */
  try { sessionStorage.removeItem("sama-token"); localStorage.removeItem("sama-token"); } catch (e) {}
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  let toastT; const toast = (m) => { const t = $("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2800); };
  const everything = () => [...library, ...newMeta];
  const byId = (id) => everything().find((p) => p.id === id);
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

  /* ---------- Encryption ---------- */
  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function deriveKey(email, password, salt, iterations) {
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(email.trim().toLowerCase() + "\n" + password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function seal(email, password, secret) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(email, password, salt, ITERATIONS);
    const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(secret));
    return { v: 1, kdf: "PBKDF2-SHA256", iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(data) };
  }
  async function unseal(v, email, password) {
    const key = await deriveKey(email, password, unb64(v.salt), v.iterations);
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(v.iv) }, key, unb64(v.data)));
  }

  /* ---------- Sign in ---------- */
  async function signIn(t) {
    token = t;
    const repo = await api("");
    if (repo.permissions && repo.permissions.push === false) { const e = new Error("no push"); e.status = 403; throw e; }
    [library, saved] = await Promise.all([readJson("data/library.json"), readJson("data/list.json")]);
    list = saved.slice();
    $("login").hidden = true;
    $("app").hidden = false;
    const cats = [...new Set(library.map((p) => p.category))].sort();
    fillSelect($("cat"), [["", "All categories"], ...cats.map((c) => [c, c])]);
    fillSelect($("nCat"), cats.map((c) => [c, c]));
    render();
    if (!vault) toast("Set an email and password in Login settings.");
  }
  function fillSelect(s, items) { s.replaceChildren(...items.map(([v, t]) => { const o = el("option", "", t); o.value = v; return o; })); }
  const showForm = (pass) => { $("passForm").hidden = !pass; $("tokenForm").hidden = pass; $("usePass").hidden = !vault; $("loginErr").textContent = ""; (pass ? $("email") : $("token")).focus(); };
  $("useToken").addEventListener("click", () => showForm(false));
  $("usePass").addEventListener("click", () => showForm(true));
  $("passForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const b = $("passBtn"); b.disabled = true; b.textContent = "Signing in…"; $("loginErr").textContent = "";
    let t = "";
    try { t = await unseal(vault, $("email").value, $("password").value); }
    catch (err) { $("loginErr").textContent = "Wrong email or password."; b.disabled = false; b.textContent = "Sign in"; return; }
    try { await signIn(t); $("password").value = ""; }
    catch (err) { token = ""; $("loginErr").textContent = err.status === 401 ? "Your password is right, but the saved GitHub token has expired. Sign in with a new token, then set your login again." : explain(err); }
    b.disabled = false; b.textContent = "Sign in";
  });
  $("tokenForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const b = $("tokenBtn"); b.disabled = true; b.textContent = "Signing in…"; $("loginErr").textContent = "";
    try { await signIn($("token").value.trim()); $("token").value = ""; }
    catch (err) { token = ""; $("loginErr").textContent = explain(err); }
    b.disabled = false; b.textContent = "Sign in";
  });
  $("signOut").addEventListener("click", () => { if (dirty() && !confirm("You have changes that aren't published. Sign out anyway?")) return; token = ""; list = saved = []; uploads = []; newMeta = []; location.reload(); });

  /* ---------- Login settings ---------- */
  const setDlg = $("setDlg");
  $("settingsBtn").addEventListener("click", () => { $("setForm").reset(); $("setErr").textContent = ""; setDlg.showModal(); $("sEmail").focus(); });
  $("setCancel").addEventListener("click", () => setDlg.close());
  $("setForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = (m) => { $("setErr").textContent = m; };
    const email = $("sEmail").value.trim(), p1 = $("sPass").value, p2 = $("sPass2").value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err("Enter a valid email address.");
    if (p1.length < MIN_PASSWORD) return err("Use at least " + MIN_PASSWORD + " characters.");
    if (p1 !== p2) return err("The two passwords don't match.");
    const b = $("setSave"); b.disabled = true; b.textContent = "Saving…"; err("");
    try {
      const sealed = await seal(email, p1, token);
      if ((await unseal(sealed, email, p1)) !== token) throw new Error("check failed");
      let sha;
      try { sha = (await api("/contents/admin/vault.json?ref=" + BRANCH)).sha; } catch (x) { if (x.status !== 404) throw x; }
      await api("/contents/admin/vault.json", { method: "PUT", body: { message: "Update admin login", branch: BRANCH, content: btoa(JSON.stringify(sealed, null, 2) + "\n"), ...(sha ? { sha } : {}) } });
      vault = sealed;
      setDlg.close();
      toast("Login saved. It works in about a minute.");
    } catch (x) { err(x.status ? explain(x) : "Couldn't save the login. Nothing was changed."); }
    b.disabled = false; b.textContent = "Save login";
  });

  /* ---------- Grid ---------- */
  function statusOf(id) {
    const on = list.includes(id), was = saved.includes(id);
    if (on && !was) return { cls: "add", text: "Will be added" };
    if (!on && was) return { cls: "rm", text: "Will be removed" };
    return on ? { cls: "on", text: "Published #" + (list.indexOf(id) + 1) } : { cls: "", text: "Not published" };
  }
  function thumbInner(p) {
    const pal = el("div", "site__pal");
    (p.palette || []).slice(0, 4).forEach((c) => { const i = el("i"); i.style.background = c; pal.appendChild(i); });
    if (newMeta.includes(p)) return pal;
    const img = el("img"); img.loading = "lazy"; img.decoding = "async"; img.alt = p.name + " website"; img.width = 480; img.height = 300;
    img.src = "../assets/work/" + p.id + "-480.webp";
    img.addEventListener("error", () => img.replaceWith(pal), { once: true }); /* its screenshot is still being made */
    return img;
  }
  function toggle(id) {
    if (list.includes(id)) {
      if (list.length <= 1) { toast("The website needs at least one project."); return; }
      list = list.filter((x) => x !== id);
    } else list.push(id);
    render();
  }
  function move(id, d) { const i = list.indexOf(id), j = i + d; if (j < 0 || j >= list.length) return; list.splice(i, 1); list.splice(j, 0, id); render(); }
  function visible() {
    const q = $("q").value.trim().toLowerCase(), cat = $("cat").value;
    const on = list.map(byId), off = everything().filter((p) => !list.includes(p.id));
    const pool = filter === "published" ? on : filter === "unpublished" ? off : [...on, ...off];
    return pool.filter((p) => (!cat || p.category === cat) && (!q || [p.name, p.category, ...(p.tags || [])].join(" ").toLowerCase().includes(q)));
  }
  function card(p) {
    const s = statusOf(p.id), on = list.includes(p.id), a = el("article", "site" + (s.cls === "add" ? " is-add" : s.cls === "rm" ? " is-rm" : ""));
    const th = el("button", "site__thumb"); th.type = "button"; th.setAttribute("aria-label", "View " + p.name);
    th.append(thumbInner(p), el("span", "badge" + (s.cls ? " badge--" + s.cls : ""), s.text));
    if (!newMeta.includes(p)) th.append(el("span", "site__view", "View website"));
    th.addEventListener("click", () => openViewer(p.id));
    const body = el("div", "site__body"), meta = el("div"), btns = el("div", "site__btns");
    meta.append(el("div", "site__name", p.name), el("div", "site__sub", p.category + " · " + (p.tags || [])[0]));
    if (on) {
      const up = el("button", "ico", "←"), down = el("button", "ico", "→"), i = list.indexOf(p.id);
      up.type = down.type = "button"; up.setAttribute("aria-label", "Move " + p.name + " earlier"); down.setAttribute("aria-label", "Move " + p.name + " later");
      up.title = "Move earlier"; down.title = "Move later"; up.disabled = i === 0; down.disabled = i === list.length - 1;
      up.addEventListener("click", () => move(p.id, -1)); down.addEventListener("click", () => move(p.id, 1));
      btns.append(up, down);
    }
    const act = el("button", "act " + (on ? "act--rm" : "act--add"), on ? "Remove" : "Add to website"); act.type = "button";
    act.addEventListener("click", () => toggle(p.id));
    btns.append(act);
    body.append(meta, btns);
    a.append(th, body);
    return a;
  }
  function render() {
    const total = everything().length;
    $("nAll").textContent = total; $("nPub").textContent = list.length; $("nUn").textContent = total - list.length;
    shown = visible();
    $("grid").replaceChildren(...shown.map(card));
    $("empty").hidden = shown.length > 0;
    renderBar();
    if (viewing) syncViewer();
  }
  $("filters").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; filter = b.dataset.f; [...$("filters").children].forEach((x) => x.classList.toggle("on", x === b)); render(); });
  $("q").addEventListener("input", render);
  $("cat").addEventListener("change", render);

  /* ---------- Viewer ---------- */
  function syncViewer() {
    const p = byId(viewing), on = list.includes(viewing), t = $("vToggle");
    $("vName").textContent = p.name;
    $("vSub").textContent = p.category + " · " + statusOf(viewing).text;
    t.textContent = on ? "Remove" : "Add to website";
    t.className = "act " + (on ? "act--rm" : "act--add");
    $("vOpen").href = "../demos/" + p.id + "/index.html";
  }
  function openViewer(id) {
    if (newMeta.some((p) => p.id === id)) { toast("Publish this project first, then you can view it."); return; }
    viewing = id;
    $("viewer").hidden = false;
    document.body.classList.add("locked");
    $("frame").src = "../demos/" + id + "/index.html";
    syncViewer();
    $("vClose").focus();
  }
  function closeViewer() { viewing = null; $("viewer").hidden = true; $("frame").removeAttribute("src"); document.body.classList.remove("locked"); }
  function stepViewer(d) {
    const pool = shown.filter((p) => !newMeta.includes(p));
    if (!pool.length) return;
    const i = pool.findIndex((p) => p.id === viewing);
    openViewer(pool[(i + d + pool.length) % pool.length].id);
  }
  $("vClose").addEventListener("click", closeViewer);
  $("vPrev").addEventListener("click", () => stepViewer(-1));
  $("vNext").addEventListener("click", () => stepViewer(1));
  $("vToggle").addEventListener("click", () => toggle(viewing));
  $("devices").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $("device").dataset.d = b.dataset.d; [...$("devices").children].forEach((x) => x.classList.toggle("on", x === b)); });
  addEventListener("keydown", (e) => { if (!viewing) return; if (e.key === "Escape") closeViewer(); if (e.key === "ArrowRight") stepViewer(1); if (e.key === "ArrowLeft") stepViewer(-1); });

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
    const n = newMeta.filter((p) => !list.includes(p.id)).length;
    if (n) s.push(n + " new in library");
    return s.join(" · ");
  }
  function renderBar() {
    if (watching) return;
    $("bar").hidden = !dirty();
    if (!dirty()) return;
    $("barText").textContent = summary() + (list.length > TARGET ? " · over your top " + TARGET : "");
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
      library = everything();
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
      if (mins > 15) { end("This is taking longer than usual. Your list is saved.", true); return; }
      setTimeout(poll, 8000);
    })();
  }

  /* ---------- New project ---------- */
  let picked = [];
  const dlg = $("newDlg");
  $("newBtn").addEventListener("click", () => { $("newForm").reset(); picked = []; $("nFilesInfo").textContent = ""; $("newErr").textContent = ""; dlg.showModal(); $("nName").focus(); });
  $("newCancel").addEventListener("click", () => dlg.close());
  $("newForm").addEventListener("submit", (e) => e.preventDefault());
  $("nFiles").addEventListener("change", (e) => {
    picked = [...e.target.files].map((f) => ({ file: f, path: f.webkitRelativePath.split("/").slice(1).join("/") })).filter((f) => f.path && !/(^|\/)(node_modules|\.git|\.claude|\.env[^/]*|\.DS_Store|Thumbs\.db)(\/|$)/.test(f.path));
    const size = picked.reduce((s, f) => s + f.file.size, 0);
    $("nFilesInfo").textContent = picked.length + " file(s), " + (size / 1048576).toFixed(1) + " MB";
  });
  $("newSave").addEventListener("click", () => {
    const err = (m) => { $("newErr").textContent = m; };
    const name = $("nName").value.trim(), type = $("nType").value.trim(), desc = $("nDesc").value.trim(), id = slug(name);
    const tags = [type, ...$("nTags").value.split(",").map((t) => t.trim()).filter(Boolean)].slice(0, 5);
    if (!name || !id) return err("Enter a project name.");
    if (everything().some((p) => p.id === id || p.name.toLowerCase() === name.toLowerCase())) return err("A project with this name already exists.");
    if (!type) return err("Enter the kind of business.");
    if (desc.length < 60) return err("Write at least 60 characters in the description.");
    if (!picked.length) return err("Choose the project's folder.");
    if (!picked.some((f) => f.path === "index.html")) return err("This folder has no index.html at its top level.");
    if (picked.some((f) => f.file.size > MAX_FILE)) return err("One of the files is larger than 20 MB.");
    if (picked.reduce((s, f) => s + f.file.size, 0) > MAX_TOTAL) return err("This folder is larger than 40 MB.");
    newMeta.push({ id, name, category: $("nCat").value, description: desc, tags, palette: ["#0b1634", "#3d7bff", "#9cc4ff", "#ffffff"], fonts: "Custom", stack: "HTML · CSS · JavaScript" });
    uploads.push(...picked.map((f) => ({ id, path: f.path, file: f.file })));
    if ($("nOnSite").checked) list.push(id);
    dlg.close();
    render();
    toast(name + " is ready. Press Publish to upload it.");
  });

  /* ---------- Start ---------- */
  (async function () {
    try { const r = await fetch("vault.json?t=" + Date.now(), { cache: "no-store" }); if (r.ok) vault = await r.json(); } catch (e) {}
    showForm(!!vault);
  })();
})();
