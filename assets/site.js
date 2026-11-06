/* SAMA site: the animations and live preview from the original site.
   All text and links are already in the page, so everything still reads without this file. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const base = document.documentElement.dataset.base || "./";
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Opening the folder directly from disk: point links at index.html so they still work */
  if (location.protocol === "file:") {
    $$("a[href]").forEach((a) => { const h = a.getAttribute("href"); if (/^(https?:|mailto:|#)/.test(h)) return; const [p, q] = h.split("?"), [path, hash] = p.split("#"); if (path === "" || path.endsWith("/")) a.setAttribute("href", (path || "./") + "index.html" + (q ? "?" + q : "") + (hash ? "#" + hash : "")); });
  }

  requestAnimationFrame(() => document.body.classList.add("loaded"));

  /* Reveal */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
  $$(".reveal, .proj").forEach((el) => io.observe(el));

  /* Header + menu */
  const header = $("#header"), burger = $("#burger");
  const setMenu = (open) => { document.body.classList.toggle("nav-open", open); burger.setAttribute("aria-expanded", open); };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
  $("#nav").addEventListener("click", (e) => { if (e.target.tagName === "A") setMenu(false); });

  /* Work: filters + load more */
  const grid = $("#workGrid");
  if (grid) {
    const cards = $$(".proj", grid), more = $("#moreBtn");
    let filter = "All", shown = 9;
    const render = () => {
      let n = 0;
      cards.forEach((c) => { const match = filter === "All" || c.dataset.cat === filter, on = match && n < shown; if (match) n++; c.hidden = !on; if (on) requestAnimationFrame(() => c.classList.add("in")); c.classList.toggle("proj--wide", on && filter === "All" && cards.indexOf(c) % 9 === 0); });
      more.parentElement.hidden = n <= shown;
    };
    $("#filters").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; filter = b.dataset.c; shown = 9; $$("#filters button").forEach((x) => x.classList.toggle("on", x === b)); render(); });
    more.addEventListener("click", () => { shown += 9; render(); });
    render();
  }

  /* Live preview */
  const viewer = $("#viewer"), frame = $("#vFrame");
  let data, list = [], at = -1, last = null;
  const loadData = () => (data ? Promise.resolve(data) : new Promise((res, rej) => { const s = document.createElement("script"); s.src = base + "assets/projects.js"; s.onload = () => { data = window.SAMA_PROJECTS; res(data); }; s.onerror = rej; document.head.appendChild(s); }));
  function show(id) {
    at = list.findIndex((p) => p.id === id);
    if (at < 0) return;
    const p = list[at], demo = base + "demos/" + p.id + "/index.html";
    frame.src = demo;
    $("#vOpen").href = demo;
    $("#vMore").href = base + "work/" + p.id + "/" + (location.protocol === "file:" ? "index.html" : "");
    $("#vName").textContent = p.name;
    $("#vCat").textContent = p.category;
  }
  function openViewer(id, push) {
    return loadData().then(() => {
      const onPage = $$(".proj:not([hidden]) [data-preview]").map((a) => a.dataset.preview);
      list = onPage.includes(id) ? onPage.map((x) => data.find((p) => p.id === x)).filter(Boolean) : data;
      viewer.hidden = false;
      document.body.style.overflow = "hidden";
      show(id);
      $("#vClose").focus();
      if (push) history.pushState({ preview: id }, "", "#/preview/" + id);
    }).catch(() => { location.href = base + "demos/" + id + "/index.html"; });
  }
  function closeViewer(push = true) {
    if (viewer.hidden) return;
    viewer.hidden = true;
    frame.src = "about:blank";
    document.body.style.overflow = "";
    if (push) history.pushState(null, "", location.pathname + location.search);
    if (last) last.focus();
  }
  const step = (d) => { const next = list[(at + d + list.length) % list.length]; show(next.id); history.replaceState({ preview: next.id }, "", "#/preview/" + next.id); };
  const route = () => { const m = location.hash.match(/^#\/preview\/([\w-]+)$/); if (m) openViewer(m[1], false); else closeViewer(false); };
  $("#vClose").onclick = () => closeViewer();
  $("#vPrev").onclick = () => step(-1);
  $("#vNext").onclick = () => step(1);
  $("#devices").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $("#vDevice").dataset.d = b.dataset.d; $$("#devices button").forEach((x) => x.classList.toggle("on", x === b)); });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-preview]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    last = a;
    openViewer(a.dataset.preview, true);
  });
  addEventListener("keydown", (e) => {
    if (viewer.hidden) { if (e.key === "Escape") setMenu(false); return; }
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  addEventListener("popstate", route);
  if (/^#\/preview\//.test(location.hash)) route();

  /* Video: playhead + timecode, only while on screen */
  const playhead = $("#playhead");
  if (playhead && !reduced) {
    let ph = 38, timer;
    const tc = $("#timecode");
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = setInterval(() => { ph = ph >= 98 ? 0 : ph + 0.25; playhead.style.left = ph + "%"; const sec = (ph / 100) * 32, f = Math.floor((sec % 1) * 25); tc.textContent = "00:00:" + String(Math.floor(sec)).padStart(2, "0") + ":" + String(f).padStart(2, "0"); }, 40);
    }).observe(playhead.parentElement);
  } else if (playhead) playhead.style.left = "38%";

  /* Flight path + header on scroll */
  const fp = $("#flightPath"), FL = fp ? fp.getTotalLength() : 0;
  if (fp) { fp.style.strokeDasharray = FL; fp.style.strokeDashoffset = FL; }
  const sections = $$("main section[id]"), navLinks = $$(".nav a");
  let ticking = false;
  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    if (fp) {
      const fr = $("#flight").getBoundingClientRect(), p = clamp((vh * 0.85 - fr.top) / (fr.height + vh * 0.3), 0, 1);
      fp.style.strokeDashoffset = FL * (1 - p);
      const pt = fp.getPointAtLength(FL * p), svg = fp.ownerSVGElement.getBoundingClientRect();
      $("#comet").style.transform = "translate(" + (pt.x / 1200) * svg.width + "px," + (pt.y / 260) * svg.height + "px)";
      $$("#flight .step").forEach((s, i) => s.classList.toggle("on", p > (i + 0.2) / 4));
    }
    header.classList.toggle("sticky", scrollY > 30);
    if (sections.length) {
      let cur = "";
      sections.forEach((s) => { if (s.getBoundingClientRect().top < vh * 0.4) cur = s.id; });
      navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + cur));
    }
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* Tilt + magnet */
  if (!reduced && matchMedia("(pointer:fine)").matches) {
    $$("[data-tilt]").forEach((c) => {
      c.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = "perspective(900px) rotateY(" + x * 8 + "deg) rotateX(" + -y * 8 + "deg) translateY(-6px)"; c.style.setProperty("--gx", (x + 0.5) * 100 + "%"); c.style.setProperty("--gy", (y + 0.5) * 100 + "%"); });
      c.addEventListener("pointerleave", () => (c.style.transform = ""));
    });
    $$("[data-magnet]").forEach((b) => {
      b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.25 + "px," + (e.clientY - r.top - r.height / 2) * 0.35 + "px)"; });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });
  }

  /* Hero: the photo drifts with the cursor while the hero is on screen */
  const photo = $(".hero__bg");
  if (photo && !reduced && matchMedia("(pointer:fine)").matches) {
    let px = 0, py = 0, qx = 0, qy = 0, raf = 0;
    addEventListener("pointermove", (e) => { qx = e.clientX / innerWidth - 0.5; qy = e.clientY / innerHeight - 0.5; }, { passive: true });
    const drift = () => { px += (qx - px) * 0.04; py += (qy - py) * 0.04; photo.style.transform = "scale(1.08) translate(" + px * -18 + "px," + py * -12 + "px)"; raf = requestAnimationFrame(drift); };
    new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) drift(); }).observe(photo);
  }

  /* Hero showcase: cycles through real demos. The extra images load after the page has finished */
  const dots = $("#showDots");
  if (dots) {
    const items = [...dots.children].map((_, i) => ({ d: $("#showDesk").children[i], m: $("#showMob").children[i] }));
    const meta = items.map((it) => ({ url: it.d.dataset.src || it.d.getAttribute("src"), alt: it.d.alt }));
    let si = 0, timer;
    const fill = () => items.forEach((it) => [it.d, it.m].forEach((im) => { if (im.dataset.src) { im.src = im.dataset.src; im.removeAttribute("data-src"); } }));
    const showP = (i) => {
      si = (i + items.length) % items.length;
      items.forEach((it, k) => { it.d.classList.toggle("on", k === si); it.m.classList.toggle("on", k === si); });
      [...dots.children].forEach((b, k) => b.classList.toggle("on", k === si));
      const b = dots.children[si], label = b.getAttribute("aria-label").replace("Show ", ""), id = meta[si].url.match(/work\/(.+)-900/)[1];
      $("#showName").textContent = label;
      $("#showCat").textContent = items[si].d.dataset.cat;
      $("#showUrl").textContent = "samatechlb.com/work/" + id;
      clearTimeout(timer);
      if (!reduced) timer = setTimeout(() => showP(si + 1), 4200);
    };
    dots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { fill(); showP([...dots.children].indexOf(b)); } });
    const start = () => setTimeout(() => { fill(); if (!reduced) timer = setTimeout(() => showP(1), 3000); }, 1200);
    if (document.readyState === "complete") start(); else addEventListener("load", start);
  }

  /* Count up */
  const cio = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; cio.unobserve(e.target); if (reduced) return; const end = +e.target.dataset.count, t0 = performance.now(); (function k(n) { const p = clamp((n - t0) / 1500, 0, 1); e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(k); })(t0); }), { threshold: 0.5 });
  $$("[data-count]").forEach((el) => cio.observe(el));

  /* Contact forms: open the visitor's email app */
  $$("[data-form]").forEach((form) => {
    const needs = $("[data-needs]", form), msg = $("[data-msg]", form);
    needs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) b.classList.toggle("on"); });
    const qs = new URLSearchParams(location.search), project = qs.get("project"), service = qs.get("service");
    if (service) { const pick = { "Web design": "Web Development", "E-commerce websites": "E-commerce", "Mobile app development": "Mobile & App Development", "UI/UX design": "UI/UX Design", "Video editing": "Video Editing", "SEO services": "SEO" }[service]; $$("button", needs).forEach((b) => b.classList.toggle("on", b.textContent === pick)); }
    if (project) form.message.value = "I'm interested in a website like " + project + ".\n\n";
    const opened = Date.now(), btn = $("[type=submit]", form);
    const say = (text, error) => { msg.textContent = text; msg.classList.toggle("is-error", !!error); };
    const viaEmailApp = (picked) => {
      const body = "Name: " + form.name.value + "\nEmail: " + form.email.value + "\nServices: " + picked + "\n\n" + form.message.value;
      location.href = "mailto:" + form.dataset.email + "?subject=" + encodeURIComponent("New project: " + picked) + "&body=" + encodeURIComponent(body);
      say("Your email app is opening. Press send there and we'll reply within 24 hours.");
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (btn.disabled) return;
      const services = $$(".on", needs).map((b) => b.textContent), picked = services.join(", ") || "General enquiry";
      btn.disabled = true; say("Sending…");
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: form.name.value, email: form.email.value, message: form.message.value, services, company: form.company.value, elapsed: Date.now() - opened, page: location.pathname }),
        });
        const out = (res.headers.get("content-type") || "").includes("json") ? await res.json() : null;
        if (!out) return viaEmailApp(picked); /* no mail server on this host: fall back to the email app */
        if (!out.ok) return say(out.error || "Something went wrong. Please email us directly.", true);
        form.reset(); $$("button", needs).forEach((b, i) => b.classList.toggle("on", i === 0));
        say("Thank you! Your message has been sent. Check your inbox for our confirmation, and we'll reply within 24 hours.");
      } catch {
        viaEmailApp(picked);
      } finally {
        btn.disabled = false;
      }
    });
  });
})();
