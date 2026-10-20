/* Control Room: builds config.js from simple form fields. Changes nothing live by itself. */
document.addEventListener("DOMContentLoaded", () => {
  const D = window.Darktism, CFG = D.CFG;
  CFG.socials = CFG.socials || {}; CFG.customLinks = CFG.customLinks || []; CFG.releases = CFG.releases || [];
  CFG.backend = CFG.backend || {}; CFG.contact = CFG.contact || {};
  const $ = id => document.getElementById(id);

  // ---- social handle inputs
  const box = $("social-inputs");
  Object.keys(D.PLATFORMS).forEach(k => {
    const p = D.PLATFORMS[k];
    const f = D.el("div", { class: "field" });
    f.innerHTML = '<label for="s-' + k + '"></label>' + (D.iconSvg(k) || "") + '<input id="s-' + k + '" autocomplete="off" spellcheck="false"><span class="preview" id="p-' + k + '"></span>';
    f.querySelector("label").textContent = p.label;
    const inp = f.querySelector("input");
    inp.placeholder = p.hint; inp.value = CFG.socials[k] || "";
    inp.addEventListener("input", () => { CFG.socials[k] = inp.value.trim(); update(); });
    box.appendChild(f);
  });
  $("show-soon").checked = !!CFG.showComingSoon;
  $("show-soon").addEventListener("change", e => { CFG.showComingSoon = e.target.checked; update(); });

  // ---- paste-any-link autofill
  $("detect-btn").addEventListener("click", () => {
    const v = $("detect-in").value.trim(); const st = $("detect-status");
    if (!v) { st.className = "status err"; st.textContent = "Paste a link first."; return; }
    const hit = D.detect(v);
    if (hit) {
      CFG.socials[hit.key] = hit.handle; $("s-" + hit.key).value = hit.handle;
      st.className = "status ok"; st.textContent = "Filled " + D.PLATFORMS[hit.key].label + " → " + D.displayHandle(hit.key, hit.handle);
    } else {
      let label = "Link"; try { label = new URL(/^https?:/i.test(v) ? v : "https://" + v).hostname.replace(/^www\./, "").split(".")[0]; label = label[0].toUpperCase() + label.slice(1); } catch (e) {}
      CFG.customLinks.push({ label, url: v }); renderCustom();
      st.className = "status ok"; st.textContent = "Added as a custom link: " + label;
    }
    $("detect-in").value = ""; update();
  });
  $("detect-in").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("detect-btn").click(); } });

  // ---- custom links
  function renderCustom() {
    const wrap = $("custom-rows"); wrap.innerHTML = "";
    CFG.customLinks.forEach((c, i) => {
      const row = D.el("div", { class: "custom-row" });
      row.innerHTML = '<div class="field"><label for="cl-l' + i + '">Label</label><input id="cl-l' + i + '"></div><div class="field"><label for="cl-u' + i + '">URL</label><input id="cl-u' + i + '" placeholder="https://"></div><button class="btn ghost" type="button" style="padding:12px 16px">Remove</button>';
      const [l, u] = row.querySelectorAll("input");
      l.value = c.label || ""; u.value = c.url || "";
      l.addEventListener("input", () => { c.label = l.value; update(); });
      u.addEventListener("input", () => { c.url = u.value.trim(); update(); });
      row.querySelector("button").addEventListener("click", () => { CFG.customLinks.splice(i, 1); renderCustom(); update(); });
      wrap.appendChild(row);
    });
    if (!CFG.customLinks.length) wrap.innerHTML = '<p class="muted mono">No custom links yet.</p>';
  }
  $("add-custom").addEventListener("click", () => { CFG.customLinks.push({ label: "", url: "" }); renderCustom(); update(); });

  // ---- releases
  const REL_LINKS = ["spotify", "applemusic", "youtube", "soundcloud", "bandcamp"];
  function renderReleases() {
    const wrap = $("release-rows"); wrap.innerHTML = "";
    CFG.releases.forEach((r, i) => {
      r.links = r.links || {};
      const card = D.el("div", { style: "display:grid;gap:12px;padding:14px;border:1px solid var(--line)" });
      card.innerHTML =
        '<div class="row-2"><div class="field"><label for="r-t' + i + '">Title</label><input id="r-t' + i + '" data-k="title"></div>' +
        '<div class="field"><label for="r-y' + i + '">Type</label><select id="r-y' + i + '" data-k="type"><option>Single</option><option>EP</option><option>Album</option><option>Mixtape</option><option>Music video</option></select></div></div>' +
        '<div class="row-2"><div class="field"><label for="r-d' + i + '">Release date</label><input id="r-d' + i + '" type="date" data-k="date"></div>' +
        '<div class="field"><label for="r-c' + i + '">Cover image path</label><input id="r-c' + i + '" data-k="cover" placeholder="assets/covers/song.jpg"></div></div>' +
        REL_LINKS.map(k => '<div class="field"><label for="r-' + k + i + '">' + D.PLATFORMS[k].label + ' link</label><input id="r-' + k + i + '" data-l="' + k + '" placeholder="https://"></div>').join("") +
        '<div><button class="btn ghost" type="button" style="padding:12px 16px">Remove release</button></div>';
      card.querySelectorAll("[data-k]").forEach(inp => { inp.value = r[inp.dataset.k] || (inp.tagName === "SELECT" ? "Single" : ""); inp.addEventListener("input", () => { r[inp.dataset.k] = inp.value; update(); }); });
      card.querySelectorAll("[data-l]").forEach(inp => { inp.value = r.links[inp.dataset.l] || ""; inp.addEventListener("input", () => { r.links[inp.dataset.l] = inp.value.trim(); update(); }); });
      card.querySelector("button").addEventListener("click", () => { CFG.releases.splice(i, 1); renderReleases(); update(); });
      wrap.appendChild(card);
    });
    if (!CFG.releases.length) wrap.innerHTML = '<p class="muted mono">No releases yet. The Music section shows "under pressure" until you add one.</p>';
  }
  $("add-release").addEventListener("click", () => { CFG.releases.push({ title: "", type: "Single", date: "", cover: "", links: {} }); renderReleases(); update(); });

  // ---- basics + keys
  const bind = (id, get, set) => { const n = $(id); n.value = get() || ""; n.addEventListener("input", () => { set(n.value); update(); }); };
  bind("b-name", () => CFG.bandName, v => CFG.bandName = v);
  bind("b-tag", () => CFG.tagline, v => CFG.tagline = v);
  bind("b-blurb", () => CFG.blurb, v => CFG.blurb = v);
  bind("b-email", () => CFG.email, v => CFG.email = v.trim());
  bind("b-tracks", () => (CFG.tracks || []).join("\n"), v => CFG.tracks = v.split("\n").map(s => s.trim()).filter(Boolean));
  bind("k-supa-url", () => CFG.backend.supabaseUrl, v => CFG.backend.supabaseUrl = v.trim());
  bind("k-supa-key", () => CFG.backend.supabaseAnonKey, v => CFG.backend.supabaseAnonKey = v.trim());
  bind("k-w3f", () => CFG.contact.web3formsKey, v => CFG.contact.web3formsKey = v.trim());

  // ---- output
  const HEADER = "/* =====================================================================\n   DARKTISM SITE CONFIG — the only file you need to edit.\n   Made in the Control Room (admin.html). Paste over config.js and commit.\n   ===================================================================== */\n";
  function configText() {
    const clean = JSON.parse(JSON.stringify(CFG));
    clean.customLinks = (clean.customLinks || []).filter(c => c.url);
    clean.releases = (clean.releases || []).filter(r => r.title).map(r => { const links = {}; Object.entries(r.links || {}).forEach(([k, v]) => { if (v) links[k] = v; }); return Object.assign({}, r, { links }); });
    return HEADER + "window.DARKTISM_CONFIG = " + JSON.stringify(clean, null, 2) + ";\n";
  }
  function update() {
    Object.keys(D.PLATFORMS).forEach(k => { const p = $("p-" + k); if (p) p.textContent = D.buildUrl(k, CFG.socials[k]); });
    D.renderLinks($("links-grid"));
    $("config-out").textContent = configText();
  }
  $("copy-config").addEventListener("click", () => D.copyText(configText(), $("config-out")));

  renderCustom(); renderReleases(); update();
});
