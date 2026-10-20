# Darktism website

Your band site. It's free to host, and only the people you add to the GitHub repo can change it.

| File | What it is |
|---|---|
| `index.html` | Home: 3D diamond, members, music, socials, community wall |
| `reviews.html` | Fans rate your music 1–5 carats and leave honest feedback |
| `contact.html` | Email form for bookings, collabs and fan mail |
| `admin.html` | **Control Room**: type your handles here and it writes your config for you |
| `config.js` | **The only file you edit.** Handles, links, email, releases, keys |
| `supabase-setup.sql` | One-time database setup for the wall and reviews |

---

## 1. Put it online for free (GitHub Pages, ~10 min)

1. Make a free account at **github.com** (use the band Gmail).
2. Click **+ → New repository**. Name it `darktism`, set it to **Public**, and click **Create**.
3. On the new repo page, click **uploading an existing file**. Drag **everything inside this folder** in, including the `assets` folder and the hidden `.nojekyll` file, then click **Commit changes**.
   - On a Mac, press `Cmd + Shift + .` in Finder to show the hidden `.nojekyll` file.
4. Go to **Settings → Pages**. Under *Branch*, pick `main` and `/ (root)`, then click **Save**.
5. Wait about a minute. Your site is live at `https://YOURUSERNAME.github.io/darktism/`.

**Only you can edit it:** go to **Settings → Collaborators** and add Rep-o and Dr. JaymZ's GitHub accounts. Nobody else can change a thing.

**Custom domain later (optional, ~$12/yr):** buy `darktism.com` at Porkbun, Namecheap or Cloudflare. Then go to **Settings → Pages → Custom domain** and follow GitHub's DNS steps.

## 2. Add your socials (whenever you make them)

1. Open `https://YOUR-SITE/admin.html`.
2. Type each handle in its box, or paste a full profile link into **Paste any link** and it fills in the right platform for you.
3. Click **Copy config**.
4. On GitHub, open `config.js`, click the ✏️ pencil, select everything, paste, and click **Commit changes**. The site updates in about a minute.

Anything not on the list (merch, a Linktree, your itch.io game) goes under **Custom links**. Its icon fills in automatically.

## 3. Turn on the community wall + reviews (free, ~10 min)

Until you do this, the site runs in **demo mode**: posts only save in the browser of whoever wrote them.

1. Make a free account at **supabase.com**, then click **New project** (any name, any password, closest region).
2. Go to **SQL Editor → New query**, paste everything from `supabase-setup.sql`, and click **Run**.
3. Go to **Project Settings → API** (or **Data API**) and copy two things:
   - **Project URL**, e.g. `https://abcd1234.supabase.co`
   - The **anon / public** key (the long one). **Never** use the `service_role` key.
4. Paste both into the Control Room's **Keys** section, then copy the config into `config.js` again.

**Moderating:** in Supabase, go to **Table Editor → comments** (or **reviews**), pick a row, and click **Delete**. Visitors can only read and add posts. They can't edit or delete anything.

Free-tier note: Supabase pauses a free project after about a week with zero activity. Log in and click **Restore** if that happens.

## 4. Turn on the contact form (free, ~2 min)

1. Go to **web3forms.com**, enter the band email, and they'll email you an **access key**.
2. Paste it into the Control Room's **Web3Forms access key** box, and put the band email in **Band email**.
3. Copy the config into `config.js` again.

Messages land in your inbox. If you skip this step, the form opens the visitor's own email app instead.

## 5. Adding a release

In the Control Room, under **Releases**, click **Add release** and fill in the title, type, date and streaming links.
For cover art, upload the image to `assets/covers/` on GitHub (e.g. `assets/covers/first-single.jpg`) and put that path in **Cover image path**.
A release with a future date shows **"Drops Dec 1, 2026"**, and it switches to **"Out now"** on the day.
Released songs automatically show up as choices on the reviews page.

## Editing members or anything else

Member bios, gems and colors are in `config.js` under `"members"`. Edit them right on GitHub.
For bigger changes, ask Claude: everything lives in plain HTML/CSS/JS files.
