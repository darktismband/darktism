/* Darktism data store for the community wall + reviews.
   LIVE mode: Supabase (free) when supabaseUrl + supabaseAnonKey are set in config.js.
   DEMO mode: saves only in the visitor's own browser, so you can try the site before setup. */
(function () {
  const cfg = ((window.DARKTISM_CONFIG || {}).backend) || {};
  const url = String(cfg.supabaseUrl || "").replace(/\/+$/, "");
  const key = cfg.supabaseAnonKey || "";
  const live = !!(url && key);
  const headers = { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" };
  const COOLDOWN_MS = 30000;

  function readLocal(table) { try { return JSON.parse(localStorage.getItem("darktism_" + table) || "[]"); } catch (e) { return []; } }
  function writeLocal(table, rows) { try { localStorage.setItem("darktism_" + table, JSON.stringify(rows)); } catch (e) {} }

  function cooldownLeft(table) {
    let lastAt = 0; try { lastAt = +localStorage.getItem("darktism_last_" + table) || 0; } catch (e) {}
    return Math.max(0, COOLDOWN_MS - (Date.now() - lastAt));
  }
  function markPosted(table) { try { localStorage.setItem("darktism_last_" + table, String(Date.now())); } catch (e) {} }

  async function list(table) {
    if (!live) return readLocal(table).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const r = await fetch(url + "/rest/v1/" + table + "?select=*&order=created_at.desc&limit=300", { headers });
    if (!r.ok) throw new Error("Couldn't load posts (" + r.status + "). Check the Supabase settings in config.js.");
    return r.json();
  }
  async function add(table, row) {
    const wait = cooldownLeft(table);
    if (wait > 0) throw new Error("Slow down a sec. You can post again in " + Math.ceil(wait / 1000) + "s.");
    if (!live) {
      const rows = readLocal(table);
      const saved = Object.assign({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), created_at: new Date().toISOString() }, row);
      rows.push(saved); writeLocal(table, rows); markPosted(table); return saved;
    }
    const r = await fetch(url + "/rest/v1/" + table, { method: "POST", headers: Object.assign({ Prefer: "return=representation" }, headers), body: JSON.stringify(row) });
    if (!r.ok) throw new Error("That didn't post (" + r.status + "). Try again in a minute.");
    markPosted(table);
    const out = await r.json();
    return out[0] || row;
  }
  window.DarktismStore = { live, list, add };
})();
