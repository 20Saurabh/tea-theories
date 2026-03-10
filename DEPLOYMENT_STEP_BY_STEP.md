# 📖 Detailed Deployment Guide with Examples

This guide walks you through hosting your news agency website for **FREE** using Render (backend + database) and Vercel (frontend).

---

## Prerequisites

Before starting, ensure you have:
- ✅ A **GitHub account** (free at github.com)
- ✅ Your code ready (we've already prepared it!)
- ✅ 30 minutes of free time

---

## Step 1: Push Code to GitHub

### 1.1 Create a GitHub Repository

1. Go to **https://github.com** and log in
2. Click the **+** icon (top right) → **New repository**
3. Fill in:
   - **Repository name**: `news-agency`
   - **Description**: `News publishing platform`
   - **Public** (or Private - both work)
4. Click **Create repository**

### 1.2 Push Your Code

Open your terminal/command prompt and run:

```bash
# Navigate to your project folder
cd c:/Users/Saurabh/Downloads/teaTheories/news-agency

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - ready for deployment"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/news-agency.git
# REPLACE "YOUR_USERNAME" with your actual GitHub username!
# For example: https://github.com/johndoe/news-agency.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ **Success!** Your code is now on GitHub. You should see it at:
`https://github.com/YOUR_USERNAME/news-agency`

---

## Step 2: Deploy Backend on Render

### 2.1 Create Render Account

1. Go to **https://render.com**
2. Click **Sign Up** → Choose **GitHub** (fastest)
3. Authorize Render to access your GitHub repos

### 2.2 Deploy the Backend Service

1. After login, click **Dashboard**
2. Click **New +** (top right) → **Web Service**
3. You'll see a list of your GitHub repos - find **news-agency** and click **Connect**

4. Configure the service:
   | Setting | Value |
   |---------|-------|
   | **Name** | `news-agency-backend` |
   | **Branch** | `main` |
   | **Runtime** | `Docker` |
   | **Dockerfile Path** | `backend/Dockerfile` |
   | **Build Command** | (leave empty) |
   | **Start Command** | (leave empty) |

5. Click **Create Web Service**

### 2.3 Wait for Build

You'll see logs like:
```
===> Building your service...
Step 1/10 : FROM eclipse-temurin:17-jdk-alpine AS build
...
=> Built in 2m 30s
=> Starting service...
```

⏳ Wait 2-3 minutes for the first build!

### 2.4 Get Your Backend URL

Once deployed, you'll see:
```
Your service is live at: https://news-agency-backend.onrender.com
```

✅ Copy this URL! You'll need it later.
Example: `https://news-agency-backend-abc123.onrender.com`

---

## Step 3: Create PostgreSQL Database

### 3.1 Create the Database

1. In Render dashboard, click **New +** → **PostgreSQL**
2. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `news-agency-db` |
   | **Database Name** | `newsagency` |
   | **User** | `newsagency` |
   | **Plan** | `Free` |

3. Click **Create Database**

### 3.2 Copy Connection Info

1. Wait 1-2 minutes for it to provision
2. Look for **"Internal Database URL"** - it looks like:
   ```
   postgresql://newsagency:xyZ123abc@host.internal:5432/newsagency
   ```
3. Copy this URL

### 3.3 Connect Database to Backend

1. Go to your **news-agency-backend** service
2. Click **Environment** (in the left menu)
3. Add these environment variables:

| Key | Value |
|-----|-------|
| `DB_URL` | `postgresql://newsagency:YOUR_PASSWORD@YOUR_HOST.internal:5432/newsagency` |
| `DB_DRIVER` | `org.postgresql.Driver` |
| `DB_DIALECT` | `org.hibernate.dialect.PostgreSQLDialect` |
| `H2_CONSOLE_ENABLED` | `false` |

4. Click **Save Changes**
5. Your backend will **restart** automatically

---

## Step 4: Deploy Frontend on Vercel

### 4.1 Create Vercel Account

1. Go to **https://vercel.com**
2. Click **Sign Up** → Choose **GitHub**
3. Authorize Vercel

### 4.2 Deploy the Frontend

1. Click **Add New...** → **Project**
2. Find and import your **news-agency** repo
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Next.js` |
   | **Build Command** | `next build` |
   | **Output Directory** | `.next` |

4. **Important**: Add Environment Variable:
   - Click **Environment Variables**
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com`
   - ⚠️ Use YOUR actual backend URL from Step 2.4!

5. Click **Deploy**

### 4.3 Wait for Deployment

⏳ Wait 2-3 minutes. You'll see:
```
✅ Deployment completed!
Your site is live at: https://news-agency.vercel.app
```

✅ Copy your frontend URL! Example: `https://news-agency.vercel.app`

---

## Step 5: Connect Frontend to Backend (CORS)

This is the final critical step!

### 5.1 Update CORS in Backend

1. Go to **Render → news-agency-backend → Environment**
2. Add new environment variable:

| Key | Value |
|-----|-------|
| `app.cors.origins` | `https://your-frontend.vercel.app` |

⚠️ Replace with your ACTUAL Vercel URL!

Example:
```
app.cors.origins=https://news-agency.vercel.app
```

3. Click **Save Changes**
4. Backend will restart (wait 1 minute)

---

## Step 6: Test Your Live Website!

### 6.1 Visit Your Site

Open your Vercel URL in a browser:
```
https://news-agency.vercel.app
```

✅ You should see your news website!

### 6.2 Test Admin Panel

1. Go to: `https://news-agency.vercel.app/admin/login`
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin123`

✅ You should see the admin dashboard!

### 6.3 Test API Connection

Try visiting:
```
https://news-agency-backend.onrender.com/api/categories
```

You should see JSON data with your categories.

---

## 🔧 Troubleshooting

### Problem: "502 Bad Gateway" on Frontend
**Solution**: Your backend might be sleeping. Visit your backend URL first to wake it up.

### Problem: "Failed to fetch" on frontend
**Solution**: 
1. Check that CORS is configured (Step 5.1)
2. Verify `NEXT_PUBLIC_API_URL` is correct in Vercel

### Problem: "Database connection failed"
**Solution**: 
1. Check PostgreSQL is running (green status)
2. Verify `DB_URL` is correct in Backend Environment

### Problem: Backend goes to sleep after 15 minutes
**Solution**: This is normal for free Render tier. 
- Upgrade to paid ($7/month) to keep it awake, OR
- Use a free ping service like https://cron-job.org to hit your backend every 5 minutes

---

## 📋 Complete URL Example

After deployment, you'll have:

| Service | Example URL |
|---------|-------------|
| Frontend | `https://news-agency.vercel.app` |
| Backend API | `https://news-agency-backend-abc123.onrender.com` |
| Admin Panel | `https://news-agency.vercel.app/admin/login` |

---

## 🎉 You're Done!

Your news agency website is now live on the internet!

**Next steps:**
1. Change admin password in production (for security)
2. Upload a logo and customize your site
3. Start publishing articles!

If you get stuck, share the error message and which step you're on, and I'll help you debug!
