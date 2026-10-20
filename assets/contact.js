/* Contact page. Sends through Web3Forms (free) when a key is set in config.js,
   otherwise opens the visitor's email app addressed to the band email. */
document.addEventListener("DOMContentLoaded", () => {
  const D = window.Darktism, CFG = D.CFG;
  const email = String(CFG.email || "").trim();
  const key = ((CFG.contact || {}).web3formsKey || "").trim();

  const slot = document.getElementById("email-slot");
  if (email) {
    slot.innerHTML = '<div class="email-box"><code id="email-text"></code><button class="btn ghost" type="button" id="copy-email" style="padding:11px 18px">Copy</button></div>';
    document.getElementById("email-text").textContent = email;
    document.getElementById("copy-email").addEventListener("click", () => D.copyText(email, document.getElementById("email-text")));
  } else {
    slot.innerHTML = '<p class="notice">Band email is being set up. Use the form for now.</p>';
  }

  const btn = document.getElementById("c-submit");
  if (!key && !email) { btn.disabled = true; document.getElementById("c-status").textContent = "Messages open soon."; }

  document.getElementById("c-form").addEventListener("submit", async e => {
    e.preventDefault();
    const st = document.getElementById("c-status"); st.className = "status"; st.textContent = "";
    if (document.getElementById("c-hp").value) return;
    const name = document.getElementById("c-name").value.trim();
    const from = document.getElementById("c-email").value.trim();
    const message = document.getElementById("c-msg").value.trim();
    const reason = (document.querySelector('input[name="reason"]:checked') || {}).value || "Other";
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from) || message.length < 5) {
      st.className = "status err"; st.textContent = "Add your name, a real email so we can reply, and a message."; return;
    }
    const subject = "[" + (CFG.bandName || "Darktism") + " site] " + reason + " from " + name;
    if (key) {
      btn.disabled = true; st.textContent = "Sending…";
      try {
        const r = await fetch("https://api.web3forms.com/submit", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: key, subject, from_name: name, email: from, reason, message })
        });
        const j = await r.json();
        if (!j.success) throw new Error(j.message || "Send failed");
        st.className = "status ok"; st.textContent = "Message sent. We'll hit you back.";
        document.getElementById("c-msg").value = "";
        const b = btn.getBoundingClientRect(); D.burst(b.left + b.width / 2, b.top, 30);
      } catch (err) {
        st.className = "status err";
        st.textContent = email ? "That didn't send. Email us directly at " + email + "." : "That didn't send. Try again in a minute.";
      }
      btn.disabled = false;
    } else {
      const body = message + "\n\n— " + name + " (" + from + ")";
      location.href = "mailto:" + encodeURIComponent(email) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      st.className = "status"; st.textContent = "Your email app should open with the message ready. If nothing opened, email us at " + email + ".";
    }
  });
});
