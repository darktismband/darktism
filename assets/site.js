/* Darktism shared site script: header/footer, socials autofill, psychedelic scroll hue,
   floating shapes, sparkle cursor, depth gauge. No editing needed here. */
(function () {
  const CFG = window.DARKTISM_CONFIG || {};
  const ICONS = window.DARKTISM_ICONS || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- platforms: handle -> full URL ---------------- */
  const PLATFORMS = {
    tiktok:     { label: "TikTok",        url: "https://www.tiktok.com/@{h}",            hint: "@handle",             at: true },
    instagram:  { label: "Instagram",     url: "https://www.instagram.com/{h}",          hint: "handle",              at: true },
    youtube:    { label: "YouTube",       url: "https://www.youtube.com/@{h}",           hint: "@handle",             at: true },
    spotify:    { label: "Spotify",       url: "https://open.spotify.com/artist/{h}",    hint: "artist link or ID" },
    applemusic: { label: "Apple Music",   url: "https://music.apple.com/us/search?term={h}", hint: "artist link" },
    soundcloud: { label: "SoundCloud",    url: "https://soundcloud.com/{h}",             hint: "handle" },
    bandlab:    { label: "BandLab",       url: "https://www.bandlab.com/{h}",            hint: "handle" },
    x:          { label: "X",             url: "https://x.com/{h}",                      hint: "@handle",             at: true },
    threads:    { label: "Threads",       url: "https://www.threads.net/@{h}",           hint: "@handle",             at: true },
    facebook:   { label: "Facebook",      url: "https://www.facebook.com/{h}",           hint: "page name" },
    snapchat:   { label: "Snapchat",      url: "https://www.snapchat.com/add/{h}",       hint: "username" },
    twitch:     { label: "Twitch",        url: "https://www.twitch.tv/{h}",              hint: "channel" },
    kick:       { label: "Kick",          url: "https://kick.com/{h}",                   hint: "channel" },
    discord:    { label: "Discord",       url: "https://discord.gg/{h}",                 hint: "invite code" },
    bandcamp:   { label: "Bandcamp",      url: "https://{h}.bandcamp.com",               hint: "name" },
    itchio:     { label: "itch.io",       url: "https://{h}.itch.io",                    hint: "username" },
    patreon:    { label: "Patreon",       url: "https://www.patreon.com/{h}",            hint: "page name" },
    shop:       { label: "Merch Store",   url: "https://{h}",                            hint: "store link" }
  };

  function cleanHandle(raw) { return String(raw || "").trim().replace(/^@+/, ""); }
  function buildUrl(key, raw) {
    const v = String(raw || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    const p = PLATFORMS[key];
    if (!p) return "https://" + v;
    return p.url.replace("{h}", encodeURIComponent(cleanHandle(v)).replace(/%2F/g, "/"));
  }
  function displayHandle(key, raw) {
    const v = String(raw || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) { try { const u = new URL(v); return u.hostname.replace(/^www\./, "") + (u.pathname.length > 1 ? u.pathname : ""); } catch (e) { return v; } }
    const p = PLATFORMS[key];
    return (p && p.at ? "@" : "") + cleanHandle(v);
  }
  /* paste any link -> {key, handle} or null */
  function detect(link) {
    let u; try { u = new URL(/^https?:\/\//i.test(link) ? link : "https://" + link); } catch (e) { return null; }
    const host = u.hostname.replace(/^www\.|^m\./, "").toLowerCase();
    const seg = u.pathname.split("/").filter(Boolean);
    const first = (seg[0] || "").replace(/^@/, "");
    if (host.endsWith("tiktok.com") && first) return { key: "tiktok", handle: first };
    if (host === "instagram.com" && first) return { key: "instagram", handle: first };
    if (host === "youtube.com" && seg[0] && seg[0].startsWith("@")) return { key: "youtube", handle: first };
    if (host === "youtube.com" || host === "youtu.be") return { key: "youtube", handle: link };
    if (host === "open.spotify.com" && seg[0] === "artist" && seg[1]) return { key: "spotify", handle: seg[1] };
    if (host.endsWith("spotify.com")) return { key: "spotify", handle: link };
    if (host === "music.apple.com") return { key: "applemusic", handle: link };
    if (host === "soundcloud.com" && first) return { key: "soundcloud", handle: first };
    if (host === "bandlab.com" && first) return { key: "bandlab", handle: first };
    if ((host === "x.com" || host === "twitter.com") && first) return { key: "x", handle: first };
    if ((host === "threads.net" || host === "threads.com") && first) return { key: "threads", handle: first };
    if ((host === "facebook.com" || host === "fb.com") && first) return { key: "facebook", handle: first };
    if (host === "snapchat.com" && seg[1]) return { key: "snapchat", handle: seg[1] };
    if (host === "twitch.tv" && first) return { key: "twitch", handle: first };
    if (host === "kick.com" && first) return { key: "kick", handle: first };
    if ((host === "discord.gg" && first) ) return { key: "discord", handle: first };
    if (host === "discord.com" && seg[0] === "invite" && seg[1]) return { key: "discord", handle: seg[1] };
    if (host.endsWith(".bandcamp.com")) return { key: "bandcamp", handle: host.split(".")[0] };
    if (host.endsWith(".itch.io")) return { key: "itchio", handle: host.split(".")[0] };
    if (host === "patreon.com" && first) return { key: "patreon", handle: first };
    if (host.endsWith("myshopify.com") || host.includes("fourthwall") || host.includes("spring") ) return { key: "shop", handle: link };
    return null;
  }

  function iconSvg(key) {
    const i = ICONS[key];
    if (!i) return "";
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + i.path + '"/></svg>';
  }
  function brandHex(key) {
    const i = ICONS[key];
    if (!i) return "#b9c2ff";
    const hex = "#" + i.hex;
    // near-black brands (TikTok, X, Threads) get a visible accent instead
    const n = parseInt(i.hex, 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (r * 0.3 + g * 0.59 + b * 0.11) < 40 ? "#c7d0ff" : hex;
  }

  function el(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) { if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  }

  const DIAMOND_LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="hsl(280 95% 72%)"/><stop offset="1" stop-color="hsl(160 95% 65%)"/></linearGradient></defs><path d="M9 4h14l7 8-14 17L2 12z" fill="url(#lg)"/><path d="M2 12h28M9 4l3 8 4 17 4-17 3-8M12 12l4-8 4 8" fill="none" stroke="#08070d" stroke-width="1" opacity=".55"/></svg>';

  /* ---------------- header / footer ---------------- */
  function renderChrome() {
    const page = document.body.dataset.page || "home";
    const name = CFG.bandName || "Darktism";
    const header = document.getElementById("site-header");
    if (header) {
      header.className = "site-header";
      const onHome = page === "home";
      const h = onHome ? "" : "index.html";
      const links = [
        ["Members", h + "#members"], ["Music", h + "#music"], ["Links", h + "#links"],
        ["Community", h + "#community"], ["Reviews", "reviews.html", "reviews"], ["Contact", "contact.html", "contact"]
      ];
      header.innerHTML = '<nav class="nav wrap" aria-label="Main"><a class="logo" href="index.html">' + DIAMOND_LOGO + '<span class="prism"></span></a><div class="nav-links"></div></nav>';
      header.querySelector(".logo span").textContent = name;
      const box = header.querySelector(".nav-links");
      links.forEach(([t, href, key]) => {
        const a = el("a", { href: href, text: t });
        if (key && key === page) a.setAttribute("aria-current", "page");
        box.appendChild(a);
      });
    }
    const footer = document.getElementById("site-footer");
    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML = '<div class="wrap footer-inner"><div style="display:grid;gap:6px"><a class="logo" href="index.html">' + DIAMOND_LOGO + '<span class="prism"></span></a><span class="mono muted"></span></div><div class="footer-icons" aria-label="Social links"></div></div>';
      footer.querySelector(".logo span").textContent = name;
      footer.querySelector(".mono").textContent = "© " + new Date().getFullYear() + " " + name + " · formed under pressure";
      const icons = footer.querySelector(".footer-icons");
      Object.keys(PLATFORMS).forEach(k => {
        const url = buildUrl(k, (CFG.socials || {})[k]);
        if (!url) return;
        const a = el("a", { href: url, target: "_blank", rel: "noopener", "aria-label": PLATFORMS[k].label }, iconSvg(k) || PLATFORMS[k].label[0]);
        icons.appendChild(a);
      });
      if (!icons.children.length) icons.innerHTML = '<span class="mono muted">Socials dropping soon</span>';
    }
  }

  /* ---------------- link tiles ---------------- */
  function renderLinks(target) {
    if (!target) return;
    target.innerHTML = "";
    const socials = CFG.socials || {};
    let live = 0;
    const soon = [];
    Object.keys(PLATFORMS).forEach(k => {
      const url = buildUrl(k, socials[k]);
      const p = PLATFORMS[k];
      if (url) {
        live++;
        const a = el("a", { class: "link-tile", href: url, target: "_blank", rel: "noopener" });
        a.style.setProperty("--brand", brandHex(k));
        a.innerHTML = '<span class="ico">' + iconSvg(k) + '</span><span><span class="name"></span><span class="handle"></span></span><span class="arrow" aria-hidden="true">↗</span>';
        a.querySelector(".name").textContent = p.label;
        a.querySelector(".handle").textContent = displayHandle(k, socials[k]);
        target.appendChild(a);
      } else if (CFG.showComingSoon && ["tiktok", "instagram", "youtube", "spotify", "applemusic", "soundcloud"].includes(k)) {
        soon.push(k);
      }
    });
    (CFG.customLinks || []).forEach(c => {
      if (!c || !c.url) return;
      live++;
      let url = String(c.url).trim(); if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      let host = ""; try { host = new URL(url).hostname.replace(/^www\./, ""); } catch (e) {}
      const a = el("a", { class: "link-tile", href: url, target: "_blank", rel: "noopener" });
      a.style.setProperty("--brand", "hsl(" + ((hash(host) % 360)) + " 85% 65%)");
      const letter = (c.label || host || "?").trim()[0].toUpperCase();
      a.innerHTML = '<span class="ico"><img alt="" loading="lazy"></span><span><span class="name"></span><span class="handle"></span></span><span class="arrow" aria-hidden="true">↗</span>';
      const img = a.querySelector("img");
      img.src = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(host) + "&sz=64";
      img.onerror = () => { img.replaceWith(el("span", { class: "mono-letter", text: letter })); };
      a.querySelector(".name").textContent = c.label || host;
      a.querySelector(".handle").textContent = host;
      target.appendChild(a);
    });
    soon.forEach(k => {
      const d = el("div", { class: "link-tile soon" });
      d.style.setProperty("--brand", brandHex(k));
      d.innerHTML = '<span class="ico">' + iconSvg(k) + '</span><span><span class="name"></span><span class="handle">coming soon</span></span>';
      d.querySelector(".name").textContent = PLATFORMS[k].label;
      target.appendChild(d);
    });
    return live;
  }

  function hash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }

  /* ---------------- psychedelic hue + floating shapes ---------------- */
  const root = document.documentElement;
  let hue = 280, scrollFrac = 0;
  const fx = el("canvas", { id: "fx", "aria-hidden": "true" });
  const glow = el("div", { class: "bg-glow", "aria-hidden": "true" });
  document.body.prepend(fx); document.body.prepend(glow);
  const ctx = fx.getContext("2d");
  let W = 0, H = 0, DPR = 1;
  function resize() { DPR = Math.min(window.devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; fx.width = W * DPR; fx.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  resize(); addEventListener("resize", resize);

  const KINDS = ["diamond", "tri", "hex", "star", "ring", "spiral", "wave", "kite", "cross"];
  const shapes = [];
  const count = innerWidth < 700 ? 16 : 30;
  for (let i = 0; i < count; i++) {
    shapes.push({
      kind: KINDS[i % KINDS.length],
      x: Math.random(), y: Math.random() * 1.6 - 0.3,
      size: 18 + Math.random() * (innerWidth < 700 ? 46 : 80),
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - .5) * 0.01,
      vx: (Math.random() - .5) * 0.00012, vy: (Math.random() - .5) * 0.00012,
      depth: 0.15 + Math.random() * 0.85, hueOff: Math.random() * 360, fill: Math.random() < 0.55,
      phase: Math.random() * 10
    });
  }
  const sparks = [];

  function pathShape(s, r) {
    ctx.beginPath();
    switch (s.kind) {
      case "diamond": ctx.moveTo(-r * .6, -r * .35); ctx.lineTo(r * .6, -r * .35); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); break;
      case "tri": for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); break;
      case "hex": for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); break;
      case "star": for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * .42 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); break;
      case "ring": ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.moveTo(r * .55, 0); ctx.arc(0, 0, r * .55, 0, Math.PI * 2, true); break;
      case "spiral": for (let t = 0; t < 14; t += .15) { const rr = r * t / 14; ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); } break;
      case "wave": ctx.moveTo(-r * 1.4, 0); for (let x = -r * 1.4; x <= r * 1.4; x += 4) ctx.lineTo(x, Math.sin(x / r * 4 + s.phase) * r * .25); break;
      case "kite": ctx.moveTo(0, -r); ctx.lineTo(r * .55, -r * .2); ctx.lineTo(0, r); ctx.lineTo(-r * .55, -r * .2); ctx.closePath(); break;
      case "cross": const w = r * .3; ctx.moveTo(-w, -r); ctx.lineTo(w, -r); ctx.lineTo(w, -w); ctx.lineTo(r, -w); ctx.lineTo(r, w); ctx.lineTo(w, w); ctx.lineTo(w, r); ctx.lineTo(-w, r); ctx.lineTo(-w, w); ctx.lineTo(-r, w); ctx.lineTo(-r, -w); ctx.lineTo(-w, -w); ctx.closePath(); break;
    }
  }
  const openKinds = { spiral: 1, wave: 1 };

  function drawSparkle(x, y, r, a, h) {
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a;
    ctx.fillStyle = "hsl(" + h + " 100% 85%)";
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r); ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r); ctx.fill();
    ctx.restore();
  }

  let t0 = performance.now(), last = t0;
  function frame(now) {
    const dt = Math.min(50, now - last); last = now;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollFrac = Math.min(1, Math.max(0, scrollY / max));
    hue = (280 + scrollY * 0.16 + (reduce ? 0 : (now - t0) * 0.004)) % 360;
    root.style.setProperty("--hue", hue.toFixed(1));

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (const s of shapes) {
      if (!reduce) { s.rot += s.vr * dt * 0.06; s.x += s.vx * dt; s.y += s.vy * dt; }
      if (s.x < -0.15) s.x = 1.15; if (s.x > 1.15) s.x = -0.15;
      const py = ((s.y * H - scrollY * s.depth * 0.5) % (H * 1.6) + H * 1.6) % (H * 1.6) - H * 0.3;
      const px = s.x * W;
      const r = s.size * (0.6 + s.depth * 0.6);
      const h = (hue + s.hueOff) % 360;
      ctx.save(); ctx.translate(px, py); ctx.rotate(s.rot);
      pathShape(s, r);
      const alpha = 0.10 + s.depth * 0.16;
      if (s.fill && !openKinds[s.kind]) {
        const g = ctx.createLinearGradient(-r, -r, r, r);
        g.addColorStop(0, "hsla(" + h + ",95%,65%," + alpha + ")");
        g.addColorStop(1, "hsla(" + ((h + 90) % 360) + ",95%,55%," + (alpha * 0.4) + ")");
        ctx.fillStyle = g; ctx.fill("evenodd");
      }
      ctx.lineWidth = 1.5; ctx.strokeStyle = "hsla(" + h + ",95%,72%," + (alpha + 0.12) + ")"; ctx.stroke();
      ctx.restore();
    }
    // ambient twinkles
    if (!reduce && Math.random() < 0.18) sparks.push({ x: Math.random() * W, y: Math.random() * H, life: 1, r: 2 + Math.random() * 5, vx: 0, vy: 0, h: hue + Math.random() * 120 });
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i]; p.life -= dt / 900; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.00025 * dt;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      drawSparkle(p.x, p.y, p.r * (0.4 + Math.sin(p.life * Math.PI)), Math.min(1, p.life * 1.4), p.h % 360);
    }
    ctx.globalCompositeOperation = "source-over";
    updateGauge();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // cursor sparkle trail + click bursts (desktop pointers only)
  if (!reduce) {
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse" || sparks.length > 160) return;
      if (Math.random() < 0.45) sparks.push({ x: e.clientX + (Math.random() - .5) * 10, y: e.clientY + (Math.random() - .5) * 10, life: 0.8, r: 2 + Math.random() * 4, vx: (Math.random() - .5) * .05, vy: -Math.random() * .05, h: hue + Math.random() * 90 });
    }, { passive: true });
    addEventListener("pointerdown", e => {
      if (e.target.closest("input,textarea,select")) return;
      burst(e.clientX, e.clientY, 18);
    }, { passive: true });
  }
  function burst(x, y, n) {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 0.1 + Math.random() * 0.35; sparks.push({ x, y, life: 1, r: 3 + Math.random() * 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.1, h: hue + i * 20 }); }
  }

  /* ---------------- depth gauge ---------------- */
  let gauge, gFill, gVal, gPsi, gTag;
  const MAX_KM = 190, ZONE_KM = 140;
  function buildGauge() {
    if (document.body.dataset.gauge === "off") return;
    gauge = el("div", { class: "gauge", "aria-hidden": "true" });
    gauge.innerHTML = '<div>Depth<div class="val" data-v>0 km</div></div><div class="tube"><div class="zone"></div><div class="fill"></div></div><div><div class="val" data-p>0.0 GPa</div><div class="tag" data-t></div></div>';
    gauge.querySelector(".zone").style.top = (ZONE_KM / MAX_KM * 100) + "%";
    document.body.appendChild(gauge);
    gFill = gauge.querySelector(".fill"); gVal = gauge.querySelector("[data-v]"); gPsi = gauge.querySelector("[data-p]"); gTag = gauge.querySelector("[data-t]");
  }
  function updateGauge() {
    if (!gauge) return;
    const km = scrollFrac * MAX_KM;
    gFill.style.height = (scrollFrac * 100) + "%";
    gVal.textContent = Math.round(km) + " km";
    gPsi.textContent = (km * 0.0325).toFixed(1) + " GPa";       // ≈ lithostatic pressure
    gTag.textContent = km >= ZONE_KM ? "diamond zone" : "";
  }

  /* ---------------- panel light sweep ---------------- */
  function watchPanels() {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("lit"); io.unobserve(e.target); } }), { threshold: 0.25 });
    document.querySelectorAll(".panel").forEach(p => io.observe(p));
  }

  /* ---------------- toast + helpers shared by pages ---------------- */
  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) { toastEl = el("div", { class: "toast", role: "status" }); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }
  async function copyText(text, fallbackEl) {
    try { await navigator.clipboard.writeText(text); toast("Copied"); return true; }
    catch (e) {
      if (fallbackEl) { const r = document.createRange(); r.selectNodeContents(fallbackEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      toast("Press Ctrl/Cmd + C to copy"); return false;
    }
  }
  function timeAgo(iso) {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return "just now";
    const m = s / 60; if (m < 60) return Math.floor(m) + "m ago";
    const h = m / 60; if (h < 24) return Math.floor(h) + "h ago";
    const d = h / 24; if (d < 30) return Math.floor(d) + "d ago";
    return new Date(iso).toLocaleDateString();
  }

  window.Darktism = { CFG, PLATFORMS, buildUrl, displayHandle, detect, iconSvg, brandHex, renderLinks, el, hash, toast, copyText, timeAgo, burst };

  document.addEventListener("DOMContentLoaded", () => {
    renderChrome(); buildGauge();
    document.querySelectorAll("[data-bind]").forEach(n => { const v = CFG[n.dataset.bind]; if (v) n.textContent = v; });
    renderLinks(document.getElementById("links-grid"));
    watchPanels();
  });
})();
