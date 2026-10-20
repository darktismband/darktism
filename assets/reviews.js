/* Reviews page: carat ratings + honest feedback. */
document.addEventListener("DOMContentLoaded", () => {
  const D = window.Darktism, S = window.DarktismStore, CFG = D.CFG;
  const WORDS = ["", "Not for me", "Needs work", "Solid", "Heat", "Flawless"];
  const tracks = (CFG.tracks && CFG.tracks.length ? CFG.tracks : ["Overall sound"]).slice();
  (CFG.releases || []).forEach(r => { if (r && r.title && !tracks.includes(r.title)) tracks.push(r.title); });

  const sel = document.getElementById("rev-track"), fsel = document.getElementById("f-track");
  tracks.forEach(t => { sel.appendChild(D.el("option", { value: t, text: t })); fsel.appendChild(D.el("option", { value: t, text: t })); });
  document.getElementById("rev-demo").hidden = S.live;

  // carat picker
  let rating = 0;
  const picker = document.getElementById("picker"), word = document.getElementById("rating-word");
  const btns = [];
  for (let i = 1; i <= 5; i++) {
    const b = D.el("button", { type: "button", role: "radio", "aria-checked": "false", "aria-label": i + " carat" + (i > 1 ? "s" : "") + ": " + WORDS[i] }, "<span></span>");
    b.addEventListener("click", () => setRating(i));
    b.addEventListener("mouseenter", () => paint(i));
    b.addEventListener("keydown", e => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setRating(Math.min(5, (rating || 0) + 1)); btns[rating - 1].focus(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setRating(Math.max(1, (rating || 2) - 1)); btns[rating - 1].focus(); }
    });
    picker.appendChild(b); btns.push(b);
  }
  picker.addEventListener("mouseleave", () => paint(rating));
  function paint(n) { btns.forEach((b, i) => b.classList.toggle("on", i < n)); word.textContent = n ? n + " · " + WORDS[n] : "Pick 1–5"; }
  function setRating(n) {
    rating = n; paint(n);
    btns.forEach((b, i) => { b.setAttribute("aria-checked", String(i + 1 === n)); b.tabIndex = (i + 1 === (n || 1)) ? 0 : -1; });
    const r = btns[n - 1].getBoundingClientRect(); D.burst(r.left + r.width / 2, r.top + r.height / 2, 6 + n * 4);
  }
  btns.forEach((b, i) => b.tabIndex = i === 0 ? 0 : -1);

  function carats(n, holder) {
    holder.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const c = D.el("span", { class: "carat" });
      if (n >= i) c.classList.add("on"); else if (n >= i - 0.5) c.classList.add("half");
      holder.appendChild(c);
    }
    return holder;
  }

  let all = [];
  function summary() {
    const n = all.length;
    const avg = n ? all.reduce((s, r) => s + (+r.rating || 0), 0) / n : 0;
    document.getElementById("avg").textContent = avg.toFixed(1);
    carats(Math.round(avg * 2) / 2, document.getElementById("avg-carats"));
    document.getElementById("total").textContent = n ? n + " review" + (n > 1 ? "s" : "") : "No reviews yet. Be the first.";
    const dist = document.getElementById("dist"); dist.innerHTML = "";
    for (let s = 5; s >= 1; s--) {
      const c = all.filter(r => +r.rating === s).length;
      const row = D.el("div", { class: "dist-row" });
      row.innerHTML = "<span>" + s + "ct</span><div class='bar'><i></i></div><span>" + c + "</span>";
      dist.appendChild(row);
      requestAnimationFrame(() => { row.querySelector("i").style.width = (n ? c / n * 100 : 0) + "%"; });
    }
  }
  function reviewEl(r) {
    const d = D.el("article", { class: "review" });
    d.innerHTML = '<div class="head"><span class="carats"></span><strong class="who"></strong><span class="chip track"></span><span class="mono muted when"></span></div><dl></dl>';
    carats(+r.rating, d.querySelector(".carats"));
    d.querySelector(".who").textContent = r.name || "Anonymous";
    d.querySelector(".track").textContent = r.track || "Overall";
    d.querySelector(".when").textContent = D.timeAgo(r.created_at);
    const dl = d.querySelector("dl");
    if (r.liked) { dl.appendChild(D.el("dt", { text: "What hit" })); dl.appendChild(D.el("dd", { text: r.liked })); }
    if (r.improve) { dl.appendChild(D.el("dt", { class: "fix", text: "Fix this" })); dl.appendChild(D.el("dd", { text: r.improve })); }
    return d;
  }
  function renderList() {
    const list = document.getElementById("rev-list");
    const t = fsel.value, sort = document.getElementById("f-sort").value;
    let rows = all.filter(r => !t || r.track === t);
    if (sort === "high") rows.sort((a, b) => b.rating - a.rating || b.created_at.localeCompare(a.created_at));
    else if (sort === "low") rows.sort((a, b) => a.rating - b.rating || b.created_at.localeCompare(a.created_at));
    else rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    list.innerHTML = "";
    if (!rows.length) { list.innerHTML = '<div class="empty"><strong>No reviews here yet.</strong><span>Rate something above and you will be the first.</span></div>'; return; }
    rows.forEach(r => list.appendChild(reviewEl(r)));
  }
  fsel.addEventListener("change", renderList);
  document.getElementById("f-sort").addEventListener("change", renderList);

  async function load() {
    try { all = await S.list("reviews"); }
    catch (e) { all = []; document.getElementById("rev-list").innerHTML = ""; document.getElementById("rev-list").appendChild(D.el("div", { class: "empty", text: e.message })); summary(); return; }
    summary(); renderList();
  }
  load();

  document.getElementById("rev-form").addEventListener("submit", async e => {
    e.preventDefault();
    const st = document.getElementById("rev-status"); st.className = "status"; st.textContent = "";
    if (document.getElementById("rev-hp").value) return;
    const liked = document.getElementById("rev-hit").value.trim();
    const improve = document.getElementById("rev-fix").value.trim();
    if (!rating) { st.className = "status err"; st.textContent = "Pick a rating from 1 to 5 carats."; return; }
    if (!liked && !improve) { st.className = "status err"; st.textContent = "Write at least one line: what hit, or what to fix."; return; }
    const btn = document.getElementById("rev-submit"); btn.disabled = true;
    try {
      const saved = await S.add("reviews", {
        name: (document.getElementById("rev-name").value.trim() || "Anonymous").slice(0, 40),
        track: sel.value.slice(0, 80), rating, liked: liked.slice(0, 600), improve: improve.slice(0, 600)
      });
      all.unshift(saved); summary(); renderList();
      document.getElementById("rev-hit").value = ""; document.getElementById("rev-fix").value = "";
      st.className = "status ok"; st.textContent = "Review posted. Thank you for keeping it real.";
    } catch (err) { st.className = "status err"; st.textContent = err.message; }
    btn.disabled = false;
  });
});
