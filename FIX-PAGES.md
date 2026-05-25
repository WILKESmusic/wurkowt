# Fix "Site not found" (do these steps in order)

Your files are on GitHub. Pages just is not publishing yet. These steps fix it.

---

## Step 1 — Upload the fix file (Terminal)

Open **Terminal**. Paste **each block**, press **Enter** after each.

**Block 1:**
```
cd /Users/wilkes/Projects/wurkowt
```

**Block 2:**
```
git add .
git commit -m "Fix GitHub Pages deploy"
git push
```

When it asks for password, paste your **GitHub token** again (same as before). You will not see characters — that is normal.

**Done when:** it finishes with no red error (like last time).

---

## Step 2 — Switch Pages to GitHub Actions (browser)

1. Go to: **https://github.com/WILKESmusic/wurkowt/settings/pages**
2. Under **Build and deployment**, find **Source**.
3. Change **Source** from "Deploy from a branch" to **GitHub Actions**.
4. If it saves automatically, good. If there is a **Save** button, click **Save**.

---

## Step 3 — Run the deploy

1. Go to: **https://github.com/WILKESmusic/wurkowt/actions**
2. Left side: click **Deploy WurkOwt to GitHub Pages**.
3. Click **Run workflow** (right side) ? **Run workflow** again.
4. Wait until the row shows a **green checkmark** (about 1–2 minutes).

---

## Step 4 — Open your app

Use this link exactly:

**https://wilkesmusic.github.io/wurkowt/**

You should see WurkOwt (cream / teal screen).

---

## If Step 2 does not show "GitHub Actions"

1. Finish Step 1 first (push must succeed).
2. Refresh the Pages settings page.
3. Under **Build and deployment**, open the **Source** dropdown again.

---

## Still broken?

On **Actions**, if you see a **red X**, click it and tell your helper what the red error line says.
