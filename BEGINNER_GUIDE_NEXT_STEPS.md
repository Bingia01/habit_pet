# Next Steps Guide - For Beginners

## What We Just Did (Simple Explanation)

We made your iPhone app smarter! Before, it could only talk to one place (Supabase) to identify food. Now it can:
1. **First try**: Talk to your web app (Next.js) - this has better food recognition
2. **If that fails**: Automatically switch to Supabase - this always works as backup

Think of it like having two phone numbers - you try the first one, and if they don't answer, you call the backup number.

## What You Need to Do Next

### Step 1: Open Xcode (The App Builder)

1. Find **Xcode** on your Mac (it's the app with a blue icon that looks like a hammer)
2. Click to open it
3. Wait for it to load (this might take a minute)

**What is Xcode?** It's like Microsoft Word, but for making iPhone apps instead of documents.

---

### Step 2: Open Your Project

1. In Xcode, click **File** at the top
2. Click **Open...**
3. Find the folder called `habit_pet` on your computer
4. Inside that folder, find `CalorieCameraHost` folder
5. Inside that, find `CalorieCameraHost.xcodeproj` (it has a blue icon)
6. Click on it and press **Open**

**What is a project?** It's like opening a saved document - all your app's code is in here.

---

### Step 3: Set Up Environment Variables (Tell the App Where to Look)

This sounds complicated, but it's just telling your app "Hey, use this website address."

1. At the top of Xcode, you'll see a dropdown menu that probably says "CalorieCameraHost" or "Any iOS Device"
2. Click on **CalorieCameraHost** (the name of your app) next to that dropdown
3. Click **Edit Scheme...** (a menu will pop up)

**What is a scheme?** It's like settings for how your app runs.

4. In the popup window, on the left side, click **Run** (it has a play button icon)
5. Click the **Arguments** tab at the top
6. Look for **Environment Variables** section
7. Click the **+** button to add a new variable

**Add these three variables one by one:**

#### Variable 1: Next.js API URL
- Click the **+** button
- In the **Name** box, type: `NEXTJS_API_URL`
- In the **Value** box, type: `http://localhost:3000`
- Press Enter

**What does this do?** This tells your app where your web app is running (on your computer, at address 3000).

#### Variable 2: Supabase URL
- Click the **+** button again
- In the **Name** box, type: `SUPABASE_URL`
- In the **Value** box, type: `https://uisjdlxdqfovuwurmdop.supabase.co/functions/v1`
- Press Enter

**What does this do?** This is the backup address - if the first one doesn't work, use this.

#### Variable 3: Supabase Key
- Click the **+** button again
- In the **Name** box, type: `SUPABASE_ANON_KEY`
- In the **Value** box, type: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc2pkbHhkcWZvdnV3dXJtZG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDkyODYsImV4cCI6MjA3NDQ4NTI4Nn0.WaACHNXUWh5ZXKu5aZf1EjolXvWdD7R5mbNqBebnIuI`
- Press Enter

**What does this do?** This is like a password - it lets your app talk to Supabase.

8. Click **Close** to save

**You should now see three rows in the Environment Variables list!**

---

### Step 4: Connect Your iPhone

1. Get a USB cable (the one that charges your iPhone)
2. Plug one end into your iPhone
3. Plug the other end into your Mac
4. On your iPhone, if it asks "Trust This Computer?", tap **Trust**
5. Enter your iPhone passcode if asked

**Why do we need the iPhone?** The camera and LiDAR (depth sensor) only work on a real iPhone, not on the computer simulator.

---

### Step 5: Select Your iPhone in Xcode

1. At the top of Xcode, you'll see a dropdown menu next to a play button
2. Click that dropdown
3. You should see your iPhone's name (like "Wutthichai's iPhone")
4. Click on it

**What does this do?** This tells Xcode "I want to run the app on THIS iPhone."

---

### Step 6: Start Your Web App (Next.js)

Before testing the iPhone app, we need to start the web app so the iPhone can talk to it.

1. Open **Terminal** on your Mac (it's in Applications → Utilities, or search for "Terminal")
2. Type this and press Enter:
   ```
   cd habit_pet
   ```
   (This means "go into the habit_pet folder")

3. Type this and press Enter:
   ```
   npm run dev
   ```

4. Wait until you see a message like:
   ```
   ✓ Ready in 2.3s
   ○ Local: http://localhost:3000
   ```

5. **Leave Terminal open** - don't close it! The web app needs to keep running.

**What is this doing?** This starts your web app on your computer so your iPhone can talk to it.

---

### Step 7: Run the App on Your iPhone

1. Go back to Xcode
2. Click the **Play button** (▶️) at the top left, or press `Command + R` on your keyboard
3. Wait... Xcode will:
   - Build the app (like compiling a document)
   - Install it on your iPhone
   - Launch it

**This might take 2-5 minutes the first time!**

4. On your iPhone, if it asks "Do you want to trust this developer?", go to:
   - **Settings** → **General** → **VPN & Device Management**
   - Tap on your developer name
   - Tap **Trust**
   - Go back to the app

---

### Step 8: Test the Camera Feature

1. The app should open on your iPhone
2. Look for a button that says something like "Open Calorie Camera" or "Scan Food"
3. Tap it
4. Allow camera permissions if asked
5. Point your camera at some food (like an apple, or a packaged snack)
6. Take a photo
7. Wait for it to analyze (this might take 5-10 seconds)

**What should happen?**
- The app will try to use the Next.js API first
- If that works, you'll see the food identified with calories
- If it doesn't work, it will automatically try Supabase instead

---

### Step 9: Check the Logs (See What Happened)

To see which analyzer was used:

1. In Xcode, at the bottom, you should see a panel (if not, click **View** → **Debug Area** → **Show Debug Area**)
2. Look for messages that start with `[DualAnalyzer]`
3. You might see:
   - `🔄 [DualAnalyzer] Trying Next.js API first...` - It's trying the web app
   - `✅ [DualAnalyzer] Next.js API success!` - The web app worked!
   - `⚠️ [DualAnalyzer] Next.js API failed, falling back to Supabase` - It switched to backup
   - `✅ [DualAnalyzer] Supabase API success!` - The backup worked!

**What are logs?** They're like a diary - the app writes down everything it's doing so you can see what happened.

---

## Troubleshooting (If Something Goes Wrong)

### Problem: "Build Failed" in Xcode

**What to do:**
1. Look at the error message at the bottom
2. Common fix: Make sure you selected your iPhone (not a simulator) in Step 5
3. Try clicking the Play button again

### Problem: App won't install on iPhone

**What to do:**
1. Make sure your iPhone is unlocked
2. Check that you tapped "Trust" in Settings (Step 7)
3. Unplug and replug the USB cable
4. Try again

### Problem: "Next.js API failed" in logs

**What to do:**
1. Check that Terminal is still running `npm run dev` (Step 6)
2. Make sure you see "Ready" message in Terminal
3. Check that `NEXTJS_API_URL` is set to `http://localhost:3000` in Xcode
4. If you're testing on a real iPhone (not simulator), `localhost` won't work - you need your Mac's IP address (see below)

### Problem: Testing on Real iPhone, but Next.js API doesn't work

**Why:** `localhost` means "this computer" - your iPhone can't reach `localhost` on your Mac.

**What to do:**
1. Find your Mac's IP address:
   - Open **System Settings** → **Network**
   - Click on your Wi-Fi connection
   - Look for "IP Address" (it looks like `192.168.1.100`)
2. In Xcode, change `NEXTJS_API_URL` from `http://localhost:3000` to `http://YOUR_IP_ADDRESS:3000`
   - Example: If your IP is `192.168.1.100`, use `http://192.168.1.100:3000`
3. Make sure your iPhone and Mac are on the same Wi-Fi network
4. Try again

---

## What Success Looks Like

✅ You see the app on your iPhone  
✅ You can open the camera  
✅ You can take a photo of food  
✅ The app identifies the food and shows calories  
✅ In the logs, you see `[DualAnalyzer]` messages showing which analyzer was used  
✅ LiDAR/volume calculations still work (if you have an iPhone Pro)

---

## Next Steps After Testing

Once everything works:

1. **For Production** (when you want to share the app):
   - Deploy your Next.js app to Vercel (or another hosting service)
   - Change `NEXTJS_API_URL` to your deployed URL (like `https://your-app.vercel.app`)
   - Build the app for App Store

2. **For Development** (while you're still working on it):
   - Keep using `http://localhost:3000` for local testing
   - Or use your Mac's IP address if testing on a real iPhone

---

## Quick Reference

**Where to find things:**
- **Xcode**: Applications folder or Spotlight search
- **Terminal**: Applications → Utilities → Terminal
- **Environment Variables**: Xcode → Product → Scheme → Edit Scheme → Run → Arguments → Environment Variables
- **Logs**: Xcode → View → Debug Area → Show Debug Area (or press `Command + Shift + Y`)

**Keyboard Shortcuts:**
- `Command + R` = Run the app
- `Command + Shift + Y` = Show/hide debug area (logs)

---

## Need Help?

If you get stuck:
1. Read the error message carefully
2. Check the logs in Xcode (bottom panel)
3. Make sure all the steps above were completed
4. Try restarting Xcode and Terminal
5. Check that your iPhone and Mac are connected properly

Good luck! 🚀

