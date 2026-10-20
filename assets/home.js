/* Home page: members, releases, community wall, 3D diamond. */
document.addEventListener("DOMContentLoaded", () => {
  const D = window.Darktism, S = window.DarktismStore, CFG = D.CFG;

  // 3D diamond (falls back to the SVG if WebGL is unavailable)
  const stage = document.getElementById("diamond");
  if (stage && window.mountDiamond) { try { window.mountDiamond(stage); } catch (e) { console.warn("diamond fallback", e); } }
  if (stage) stage.addEventListener("dblclick", e => D.burst(e.clientX, e.clientY, 40));

  // members
  const mg = document.getElementById("members-grid");
  (CFG.members || []).forEach(m => {
    const card = D.el("article", { class: "panel member" });
    card.style.setProperty("--gem", m.color || "#fff");
    card.style.setProperty("--gemtext", m.color || "#fff");
    card.innerHTML = '<div class="gem" aria-hidden="true"></div><div style="display:grid;gap:6px"><span class="eyebrow"></span><h3></h3><span class="role"></span></div><p class="muted bio"></p><div class="stats"><span class="chip">Mohs <b></b></span><span class="chip">RI <b></b></span></div>';
    card.querySelector(".eyebrow").textContent = m.gem || "Gem";
    card.querySelector("h3").textContent = m.name;
    card.querySelector(".role").textContent = m.role || "";
    card.querySelector(".bio").textContent = m.bio || "";
    const b = card.querySelectorAll(".chip b"); b[0].textContent = m.hardness || "?"; b[1].textContent = m.ri || "?";
    mg.appendChild(card);
  });

  // releases
  const mb = document.getElementById("music-body");
  const rel = (CFG.releases || []).filter(r => r && r.title);
  if (!rel.length) {
    mb.innerHTML = '<div class="panel release-empty"><div class="pressure-ring" style="--p:72%"><div><span>Status</span><strong>forming</strong></div></div><div style="display:grid;gap:12px"><h3>First drop is under pressure</h3><p class="muted">Songs are being cut right now. Follow us anywhere below to catch the first release the second it lands.</p><div class="btn-row"><a class="btn" href="#links">Follow for the drop</a></div></div></div>';
  } else {
    const grid = D.el("div", { class: "releases" });
    rel.forEach(r => {
      const card = D.el("article", { class: "panel release" });
      const out = !r.date || new Date(r.date) <= new Date();
      card.innerHTML = (r.cover ? '<img class="cover" alt="">' : '<div class="cover" aria-hidden="true" style="background:conic-gradient(from 45deg, var(--prism-a), #000, var(--prism-b), #000, var(--prism-c), #000, var(--prism-a))"></div>') +
        '<span class="eyebrow"></span><h3></h3><div class="btn-row"></div>';
      if (r.cover) { const img = card.querySelector("img"); img.src = r.cover; img.alt = r.title + " cover art"; }
      card.querySelector(".eyebrow").textContent = (r.type || "Release") + " · " + (out ? "Out now" : "Drops " + new Date(r.date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }));
      card.querySelector("h3").textContent = r.title;
      const row = card.querySelector(".btn-row");
      Object.entries(r.links || {}).forEach(([k, v]) => {
        if (!v) return;
        const a = D.el("a", { class: "btn ghost", href: D.buildUrl(k, v), target: "_blank", rel: "noopener" });
        a.style.padding = "11px 18px";
        a.innerHTML = (D.iconSvg(k) ? D.iconSvg(k).replace("<svg", '<svg style="width:14px;height:14px;fill:currentColor"') : "") + "<span></span>";
        a.querySelector("span").textContent = (D.PLATFORMS[k] || { label: k }).label;
        row.appendChild(a);
      });
      grid.appendChild(card);
    });
    mb.appendChild(grid);
  }

  // community wall
  const form = document.getElementById("wall-form");
  const feed = document.getElementById("wall-feed");
  const status = document.getElementById("wall-status");
  const msg = document.getElementById("wall-msg");
  const count = document.getElementById("wall-count");
  document.getElementById("wall-demo").hidden = S.live;
  msg.addEventListener("input", () => { count.textContent = msg.value.length + " / 500"; });

  function postEl(p) {
    const d = D.el("article", { class: "post" });
    d.innerHTML = '<div class="avatar" aria-hidden="true"></div><div style="min-width:0"><div class="meta"><span class="who"></span><span class="when"></span></div><p class="msg"></p></div>';
    d.querySelector(".avatar").style.setProperty("--av", "hsl(" + (D.hash(p.name) % 360) + " 90% 60%)");
    d.querySelector(".who").textContent = p.name;
    d.querySelector(".when").textContent = D.timeAgo(p.created_at);
    d.querySelector(".msg").textContent = p.message;
    return d;
  }
  function emptyState() {
    feed.innerHTML = '<div class="empty"><strong>The wall is clean.</strong><span>Be the first name carved into it.</span></div>';
  }
  async function load() {
    feed.innerHTML = '<div class="empty">Loading the wall…</div>';
    try {
      const rows = await S.list("comments");
      feed.innerHTML = "";
      if (!rows.length) return emptyState();
      rows.forEach(r => feed.appendChild(postEl(r)));
    } catch (e) { feed.innerHTML = ""; const d = D.el("div", { class: "empty", text: e.message }); feed.appendChild(d); }
  }
  load();

  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.className = "status"; status.textContent = "";
    if (document.getElementById("wall-hp").value) return; // bot
    const name = document.getElementById("wall-name").value.trim();
    const message = msg.value.trim();
    if (!name) { status.className = "status err"; status.textContent = "Add a name so people know who said it."; return; }
    if (message.length < 2) { status.className = "status err"; status.textContent = "Write a message first."; return; }
    const btn = document.getElementById("wall-submit"); btn.disabled = true;
    try {
      const saved = await S.add("comments", { name: name.slice(0, 40), message: message.slice(0, 500) });
      if (feed.querySelector(".empty")) feed.innerHTML = "";
      feed.prepend(postEl(saved));
      msg.value = ""; count.textContent = "0 / 500";
      status.className = "status ok"; status.textContent = "Posted to the wall.";
      const r = btn.getBoundingClientRect(); D.burst(r.left + r.width / 2, r.top, 30);
    } catch (err) { status.className = "status err"; status.textContent = err.message; }
    btn.disabled = false;
  });
});
