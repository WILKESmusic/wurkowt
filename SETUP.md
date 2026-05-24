# WurkOwt ù Start Here (plain steps)

You do **not** need to know coding. Follow the steps in order.

**Your GitHub username:** WILKESmusic  
**Your app link when done:** https://wilkesmusic.github.io/wurkowt/

---

## What you are doing (big picture)

1. Put the app on **GitHub** (free website storage ù like a folder in the cloud).
2. Turn on **GitHub Pages** (GitHub gives you a link anyone can open).
3. On your **iPhone**, save that link to your **home screen** so it works like an app.

The app files are already on your Mac here:

`/Users/wilkes/Projects/wurkowt`

---

# PART 1 ù Create a place on GitHub (website)

## Step 1 - Log into GitHub

1. Open a web browser on your Mac.
2. Go to: **https://github.com**
3. Log in as **WILKESmusic** (or create a free account if you have not yet).

**You are done with Step 1 when:** you see your GitHub home page while logged in.

---

## Step 2 ù Make a new empty project folder on GitHub

1. On GitHub, click the **+** button (top right corner).
2. Click **New repository**.
3. Where it says **Repository name**, type exactly: **wurkowt** (all lowercase).
4. Make sure **Public** is selected.
5. **Leave everything else unchecked** ù especially do NOT check "Add a README file."
6. Click the green **Create repository** button.

**You are done with Step 2 when:** you see a page that says something like "Quick setup" and shows **WILKESmusic/wurkowt**. Leave this browser tab open.

---

# PART 2 ù Upload the app from your Mac

Pick **ONE** method below. **Method A (GitHub Desktop)** is easier if you have never used Terminal.

---

## METHOD A ù GitHub Desktop (recommended for beginners)

### Step 3A ù Install GitHub Desktop

1. On your Mac, go to: **https://desktop.github.com/**
2. Download and install **GitHub Desktop**.
3. Open **GitHub Desktop**.
4. Sign in with your **WILKESmusic** GitHub account when it asks.

**You are done when:** GitHub Desktop opens and shows you are signed in.

---

### Step 4A ù Add the WurkOwt folder

1. In GitHub Desktop, click **File** (top menu).
2. Click **Add Local Repositoryù**
3. Click **Chooseù**
4. Go to: **Users ? wilkes ? Projects ? wurkowt**
5. Click **Open**, then **Add Repository**.

**If it says "This directory does not appear to be a Git repository":**

1. Click the link that says **create a repository**.
2. Or click **File ? New Repository**:
   - Name: **wurkowt**
   - Local path should end with **Projects**
   - Leave "Initialize with README" **unchecked**
   - Click **Create Repository**
3. Then copy all the WurkOwt files into that new folder if needed (your files should already be in `/Users/wilkes/Projects/wurkowt`).

---

### Step 5A ù Publish to GitHub

1. In GitHub Desktop, you should see a list of files on the left.
2. Bottom left: type a short note, for example: **First upload of WurkOwt**
3. Click **Commit to main**.
4. Click **Publish repository** (top bar).
5. Name: **wurkowt**
6. Make sure **Keep this code private** is **OFF** (must be public for free hosting).
7. Click **Publish Repository**.

**You are done with Step 5A when:** GitHub Desktop says the last push succeeded (no error).

---

## METHOD B ù Terminal (if you prefer copy-paste commands)

### Step 3B ù Install Apple developer tools (one time only)

1. Open **Terminal** on your Mac:  
   **Finder ? Applications ? Utilities ? Terminal**
2. Copy and paste this line, then press **Enter**:

```
xcode-select --install
```

3. A popup appears. Click **Install**.
4. Wait until it finishes (can take several minutes).

**You are done when:** the install finishes and Terminal does not show an error.

---

### Step 4B ù Upload the files

Copy and paste **each block below, one at a time**. Press **Enter** after each block.

**Block 1 ù go to the app folder:**

```
cd /Users/wilkes/Projects/wurkowt
```

**Block 2 ù prepare the upload:**

```
git init
git add .
git commit -m "First upload of WurkOwt"
git branch -M main
```

**Block 3 ù connect to your GitHub account:**

```
git remote add origin https://github.com/WILKESmusic/wurkowt.git
```

**Block 4 ù send the files:**

```
git push -u origin main
```

**When Block 4 runs:** your Mac may open a browser and ask you to **sign in to GitHub**. Sign in as **WILKESmusic** and allow access.

**If Block 3 says "remote origin already exists"**, use this instead of Block 3:

```
git remote set-url origin https://github.com/WILKESmusic/wurkowt.git
```

Then run Block 4 again.

**You are done with Step 4B when:** Terminal finishes with no red error text.

---

# PART 3 ù Turn on your free app link

## Step 6 ù Enable GitHub Pages

1. In your browser, go to: **https://github.com/WILKESmusic/wurkowt**
2. Click **Settings** (top tab row on the repo page).
3. Left sidebar: click **Pages**.
4. Under **Build and deployment**:
   - **Source:** choose **Deploy from a branch**
   - **Branch:** choose **main**
   - **Folder:** choose **/ (root)**
5. Click **Save**.
6. Wait **2 to 5 minutes**.
7. Refresh the **Pages** settings page.

**You are done when:** you see a green box that says your site is published at:

**https://wilkesmusic.github.io/wurkowt/**

---

## Step 7 ù Test on your Mac

1. Open that link in your browser.
2. You should see **WurkOwt** with teal/gold/cream colors and a form or home screen.

**If the page is blank:** wait 5 more minutes and refresh. Make sure the URL ends with **/wurkowt/**

---

# PART 4 ù Put WurkOwt on your iPhone home screen

## Step 8 ù Install like an app

1. On your **iPhone**, open **Safari** (use Safari, not Chrome, for this first install).
2. Type or tap this link: **https://wilkesmusic.github.io/wurkowt/**
3. Wait for the page to load.
4. Tap the **Share** button (square with an arrow pointing up, bottom of the screen).
5. Scroll down and tap **Add to Home Screen**.
6. Name it **WurkOwt**.
7. Tap **Add**.

**You are done when:** you see a **WurkOwt** icon on your home screen.

---

## Step 9 ù First open (important)

1. Tap the **WurkOwt** icon on your home screen (not a Safari bookmark).
2. Stay on **Wi?Fi or cell data** for this first open (so images save for offline use).
3. Fill in your starting weight and push-up number when asked.
4. Tap **Start program**.

---

## Step 10 ù Turn on reminders (optional)

1. Inside WurkOwt, tap **Settings**.
2. Turn on **Morning & evening nudges**.
3. When iPhone asks, tap **Allow Notifications**.

---

# PART 5 ù How to use WurkOwt each day

## Step 11 ù Normal workout day

1. Open **WurkOwt** from your home screen.
2. Read what today is (Push, Pull, etc.).
3. Tap **What do I need today?** ù gather backpack, bench, etc. **before** you start.
4. Tap **Start session**.
5. Check off warmup items, then do each exercise.
6. **Tap the numbered dots** to log each set ù rest timer starts automatically.
7. Finish cooldown and tap **Complete session**.

**Workout order (repeats forever):**  
Push ? Pull ? Sculpt ? Lower ? Cardio ? Flex ? Rest ? then back to Push.

If you miss a day, just open the app the next day ù it gives you the **next** workout in that list.

---

## Step 12 ù Cardio day

1. Start session.
2. Choose **Outdoor run** or **Stay indoors**.
3. Follow the on-screen timers ù they tell you exactly how long to run or walk.

---

## Step 13 ù Rest day

1. Read the recovery tips.
2. Tap **Finish rest day** when done (optional easy walk is fine).
3. Only tap **Train anyway** if you really want to ù the app will suggest what makes sense.

---

## Step 14 ù Log your weight (whenever you want)

1. On the home screen, tap **Log weigh-in**.
2. Enter your weight in pounds.
3. Tap **Save**.

View progress under **Progress & history**.

---

# If something goes wrong

| Problem | What to do |
|--------|------------|
| **"git" or "developer tools" error on Mac** | Do **Method A (GitHub Desktop)** instead, or finish Step 3B first. |
| **Blank page at the link** | Wait 5 minutes. Check GitHub **Settings ? Pages** ù branch must be **main**, folder **/ (root)**. |
| **App looks old after an update** | Close WurkOwt completely on iPhone (swipe up), open again. |
| **Offline mode not working** | Open the app once on Wi?Fi and complete one full session. |
| **Push / upload failed** | Make sure repo name is **wurkowt** and you are logged in as **WILKESmusic**. |

---

# Words you might see (simple meanings)

| Word | Meaning |
|------|---------|
| **GitHub** | Free place to store your app files online. |
| **Repository (repo)** | The online folder named **wurkowt**. |
| **GitHub Pages** | Free feature that turns that folder into a website link. |
| **Commit / Publish / Push** | "Save and upload my files to GitHub." |
| **PWA** | A website that acts like an app when saved to your home screen. |

---

# Quick reference ù your links

- **GitHub repo:** https://github.com/WILKESmusic/wurkowt  
- **App link:** https://wilkesmusic.github.io/wurkowt/  
- **App folder on Mac:** `/Users/wilkes/Projects/wurkowt`

If you get stuck, note **which step number** failed and what the screen said ù that is enough to troubleshoot.
