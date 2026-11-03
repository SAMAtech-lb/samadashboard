/* SAMA site: search, sort, layout and the live preview viewer.
   Every page and link works without this file; it only adds to them. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const base = document.documentElement.dataset.base || "./";
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* Opening the folder directly from disk: point links at index.html so they still work */
  if (location.protocol === "file:") {
    $$("a[href]").forEach((a) => { const h = a.getAttribute("href"); if (!/^(https?:|mailto:|#)/.test(h)) { const [p, q] = h.split("?"); if (p.endsWith("/") || p === "") a.setAttribute("href", (p || "./") + "index.html" + (q ? "?" + q : "")); } });
    $$("form.search").forEach((f) => { f.action = base + "index.html"; });
  }

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600); }

  /* ---------- Mobile menu ---------- */
  const side = $("#side"), menu = $("#menuBtn");
  function setMenu(open) { side.classList.toggle("open", open); menu.setAttribute("aria-expanded", open); }
  menu.addEventListener("click", (e) => { e.stopPropagation(); setMenu(!side.classList.contains("open")); });
  document.addEventListener("click", (e) => { if (side.classList.contains("open") && !side.contains(e.target)) setMenu(false); });

  /* ---------- Search, sort, layout ---------- */
  const grid = $("#grid"), input = $("#search"), isHome = !!$("#work");
  function applySearch() {
    if (!grid) return;
    const q = input.value.trim().toLowerCase();
    let n = 0;
    $$(".card", grid).forEach((c) => { const on = !q || c.textContent.toLowerCase().includes(q); c.hidden = !on; if (on) n++; });
    const count = $("#resultsCount"), empty = $("#empty");
    if (count) count.textContent = n + " result" + (n === 1 ? "" : "s");
    if (empty) empty.hidden = n > 0;
    const label = $("#resultsLabel");
    if (label) { label.dataset.base = label.dataset.base || label.textContent; label.textContent = label.dataset.base + (q ? ' · "' + input.value.trim() + '"' : ""); }
  }
  if (isHome) {
    input.value = new URLSearchParams(location.search).get("q") || "";
    input.addEventListener("input", applySearch);
    input.form.addEventListener("submit", (e) => e.preventDefault());
    if (input.value) { applySearch(); grid.scrollIntoView({ block: "start" }); }
  }
  const sort = $("#sort");
  if (sort && grid) sort.addEventListener("change", () => {
    const by = { rank: (a, b) => a.dataset.rank - b.dataset.rank, az: (a, b) => a.dataset.name.localeCompare(b.dataset.name), cat: (a, b) => a.dataset.cat.localeCompare(b.dataset.cat) || a.dataset.name.localeCompare(b.dataset.name) }[sort.value];
    $$(".card", grid).sort(by).forEach((c) => grid.appendChild(c));
  });
  const toggle = $("#viewToggle");
  function setView(v) { if (!grid || !toggle) return; grid.classList.toggle("is-list", v === "list"); $$("button", toggle).forEach((b) => { const on = b.dataset.view === v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }); }
  if (toggle) { setView(store.get("sama-view") || "grid"); toggle.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { store.set("sama-view", b.dataset.view); setView(b.dataset.view); } }); }

  /* ---------- Viewer ---------- */
  let data, list = [], at = -1, built = false, last = null;
  function loadData() {
    return data ? Promise.resolve(data) : new Promise((res, rej) => { const s = document.createElement("script"); s.src = base + "assets/projects.js"; s.onload = () => { data = window.SAMA_PROJECTS; res(data); }; s.onerror = rej; document.head.appendChild(s); });
  }
  function buildViewer() {
    if (built) return;
    built = true;
    document.body.insertAdjacentHTML("beforeend", `<div class="viewer" id="viewer" role="dialog" aria-modal="true" aria-label="Live preview" hidden>
      <div class="viewer__bar">
        <div class="viewer__left"><button class="icon-btn" id="vClose" aria-label="Close preview">✕</button><div class="viewer__title"><strong id="vName"></strong><span class="mono" id="vCat"></span></div></div>
        <div class="seg" id="devices"><button class="on" data-device="desktop">Desktop</button><button data-device="tablet">Tablet</button><button data-device="mobile">Mobile</button></div>
        <div class="viewer__right"><span class="mono" id="vIndex"></span><button class="icon-btn" id="vPrev" aria-label="Previous website">←</button><button class="icon-btn" id="vNext" aria-label="Next website">→</button><button class="icon-btn" id="vInfo" aria-label="Website details">i</button><a class="btn btn--sm" id="vOpen" target="_blank" rel="noopener nofollow">Open ↗</a></div>
      </div>
      <div class="viewer__body">
        <div class="stage"><div class="device" id="device" data-device="desktop"><div class="loader" id="loader"><span></span></div><iframe id="frame" title="Website preview"></iframe></div></div>
        <aside class="info" id="info"><span class="mono">About this design</span><h2 id="iName"></h2><p id="iDesc"></p>
          <dl><dt class="mono">Category</dt><dd id="iCat"></dd><dt class="mono">Typography</dt><dd id="iFonts"></dd><dt class="mono">Built with</dt><dd id="iStack"></dd><dt class="mono">Palette</dt><dd class="swatches" id="iPal"></dd><dt class="mono">Highlights</dt><dd class="tags" id="iTags"></dd></dl>
          <a class="btn" id="iCta">I want one like this ↗</a><a class="link" id="iMore">Full project details</a><p class="mono keys">← → switch · Esc close</p></aside>
      </div></div>`);
    $("#vClose").onclick = () => closeViewer();
    $("#vPrev").onclick = () => step(-1);
    $("#vNext").onclick = () => step(1);
    $("#vInfo").onclick = () => { $("#info").classList.toggle("open"); $("#vInfo").classList.toggle("on"); };
    $("#devices").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; $("#device").dataset.device = b.dataset.device; $$("#devices button").forEach((x) => x.classList.toggle("on", x === b)); };
    $("#frame").addEventListener("load", () => $("#loader").classList.add("done"));
  }
  function show(id) {
    at = list.findIndex((p) => p.id === id);
    if (at < 0) return;
    const p = list[at], demo = base + "demos/" + p.id + "/index.html", more = base + "work/" + p.id + "/";
    $("#loader").classList.remove("done");
    $("#frame").src = demo;
    $("#vOpen").href = demo;
    $("#vName").textContent = p.name;
    $("#vCat").textContent = p.category;
    $("#vIndex").textContent = String(at + 1).padStart(2, "0") + " / " + String(list.length).padStart(2, "0");
    $("#iName").textContent = p.name;
    $("#iDesc").textContent = p.description;
    $("#iCat").textContent = p.category;
    $("#iFonts").textContent = p.fonts;
    $("#iStack").textContent = p.stack;
    $("#iPal").innerHTML = p.palette.map((c) => '<span style="background:' + c + '" title="' + c + '"></span>').join("");
    $("#iTags").innerHTML = "";
    p.tags.forEach((t) => { const s = document.createElement("span"); s.className = "tag"; s.textContent = t; $("#iTags").appendChild(s); });
    $("#iCta").href = base + "contact/?project=" + encodeURIComponent(p.name);
    $("#iMore").href = more;
    if (location.protocol === "file:") { $("#iCta").href = base + "contact/index.html?project=" + encodeURIComponent(p.name); $("#iMore").href = more + "index.html"; }
  }
  function openViewer(id, push) {
    return loadData().then(() => {
      buildViewer();
      /* Step through what is on the page, in the order shown */
      const shown = $$(".card:not([hidden]) [data-preview]").map((a) => a.dataset.preview);
      list = shown.length ? shown.map((x) => data.find((p) => p.id === x)).filter(Boolean) : data;
      if (!list.some((p) => p.id === id)) list = data;
      $("#viewer").hidden = false;
      document.body.classList.add("locked");
      show(id);
      $("#vClose").focus();
      if (push) history.pushState({ preview: id }, "", "#/preview/" + id);
    }).catch(() => { location.href = base + "demos/" + id + "/index.html"; });
  }
  function closeViewer(push = true) {
    const v = $("#viewer");
    if (!v || v.hidden) return;
    v.hidden = true;
    $("#frame").src = "about:blank";
    document.body.classList.remove("locked");
    if (push) history.pushState(null, "", location.pathname + location.search);
    if (last) last.focus();
  }
  function step(d) { const next = list[(at + d + list.length) % list.length]; show(next.id); history.replaceState({ preview: next.id }, "", "#/preview/" + next.id); }
  function route() { const m = location.hash.match(/^#\/preview\/([\w-]+)$/); if (m) openViewer(m[1], false); else closeViewer(false); }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-preview]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    last = a;
    openViewer(a.dataset.preview, true);
  });
  document.addEventListener("keydown", (e) => {
    const v = $("#viewer"), open = v && !v.hidden, typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
    if (e.key === "/" && !typing && !open) { e.preventDefault(); input.focus(); }
    else if (open && e.key === "Escape") closeViewer();
    else if (open && e.key === "ArrowRight") step(1);
    else if (open && e.key === "ArrowLeft") step(-1);
    else if (e.key === "Escape") setMenu(false);
  });
  addEventListener("popstate", route);
  if (location.hash) route();

  /* ---------- Contact form: opens the visitor's email app ---------- */
  const form = $("#contactForm");
  if (form) {
    const qs = new URLSearchParams(location.search), project = qs.get("project"), service = qs.get("service");
    if (service) [...form.service.options].forEach((o) => { if (o.text === service) o.selected = true; });
    if (project) form.message.value = "I'm interested in a website like " + project + ".\n\n";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const body = "Name: " + form.name.value + "\nEmail: " + form.email.value + "\nService: " + form.service.value + "\n\n" + form.message.value;
      location.href = "mailto:" + form.dataset.email + "?subject=" + encodeURIComponent("New project: " + form.service.value) + "&body=" + encodeURIComponent(body);
      toast("Your email app is opening. Press send there and we'll reply within 24 hours.");
    });
  }
})();
