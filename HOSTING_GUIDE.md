# 🚀 Free Hosting Guide for "The Agency" News Platform

## Overview
This guide will help you deploy your full-stack news application for **FREE** using the easiest options available.

### Your Application Stack
- **Frontend**: Next.js 14 (currently on port 3301)
- **Backend**: Spring Boot Java (currently on port 8801)
- **Database**: H2 (dev) → PostgreSQL (production)

---

## 🎯 Recommended Free Hosting Options

| Component | Service | Free Tier |
|-----------|---------|-----------|
| Frontend | **Vercel** | ✅ Unlimited projects, 100GB bandwidth |
| Backend | **Render** | ✅ 750 hours/month, sleeps after 15min inactivity |
| Database | **Render PostgreSQL** | ✅ 1GB storage, 1 concurrent connection |
| File Storage | **Cloudinary** (optional) | ✅ 25GB bandwidth, 500MB storage |

---

## ⚠️ Important: Code Changes Required

Before deploying, you need to make these changes to your code:

### 1. Update Frontend API URL (for production)

**File: `news-agency/frontend/src/lib/api.ts`**

Change this:
```typescript
const BACKEND = 'http://localhost:8801';
```

To this (we'll update after backend deployment):
```typescript
const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8801';
```

### 2. Update Backend CORS Configuration

**File: `news-agency/backend/src/main/java/com/newsagency/config/SecurityConfig.java`**

Add your Vercel frontend domain to allowed origins:
```java
// Add your production frontend URL here after deployment
String[] allowedOrigins = {
    "http://localhost:3000",
    "http://localhost:3301",
    "https://your-app-name.vercel.app"  // Add this after Vercel deployment
};
```

---

## 📋 Step-by-Step Deployment

### Phase 1: Prepare Your Code

#### Step 1.1: Create a Dockerfile for the Backend

Create `news-agency/backend/Dockerfile`:

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8801
RUN mkdir -p /app/uploads
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Step 1.2: Update application.properties for Production

**File: `news-agency/backend/src/main/resources/application.properties`**

```properties
# Use PostgreSQL in production (Render will provide these)
spring.datasource.url=${DB_URL:jdbc:h2:file:./newsagency-db;AUTO_SERVER=TRUE}
spring.datasource.username=${DB_USER:sa}
spring.datasource.password=${DB_PASSWORD:}
spring.datasource.driver-class-name=${DB_DRIVER:org.h2.Driver}

# Switch to PostgreSQL dialect in production
spring.jpa.database-platform=${DB_DIALECT:org.hibernate.dialect.H2Dialect}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

spring.h2.console.enabled=${H2_CONSOLE_ENABLED:false}

# File uploads
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
app.upload-dir=/app/uploads

# JWT - Change secret in production!
app.jwt.secret=${JWT_SECRET:ThisIsAVerySecretKeyForJWTTokenGenerationNewsAgency2024ChangeMe!}
app.jwt.expiration=86400000

# Admin credentials
app.admin.username=${ADMIN_USERNAME:admin}
app.admin.password=${ADMIN_PASSWORD:admin123}

server.port=8801

logging.level.org.springframework.security=WARN
logging.level.org.hibernate=WARN
```

#### Step 1.3: Update frontend/lib/api.ts for Environment Variables

**File: `news-agency/frontend/src/lib/api.ts`** - Change first line to:
```typescript
const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8801';
```

#### Step 1.4: Create Production Build Script

Create `news-agency/frontend/next.config.js` (update if needed):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'your-backend.onrender.com'],
  },
}

module.exports = nextConfig
```

#### Step 1.5: Push Code to GitHub

1. Create a GitHub account at https://github.com
2. Create a new repository
3. Push your code:
```bash
cd news-agency
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

### Phase 2: Deploy Backend (Render)

#### Step 2.1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"

#### Step 2.2: Deploy Backend
1. Select your GitHub repository
2. Configure:
   - **Name**: `news-agency-backend`
   - **Branch**: `main`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Build Command**: (leave empty - Docker handles it)
   - **Start Command**: (leave empty - Docker handles it)

3. Click "Create Web Service"

#### Step 2.3: Configure Environment Variables
After service is created, go to "Environment" tab and add:

| Key | Value |
|-----|-------|
| `DB_URL` | (Will be auto-filled when you connect PostgreSQL) |
| `DB_DRIVER` | `org.postgresql.Driver` |
| `DB_DIALECT` | `org.hibernate.dialect.PostgreSQLDialect` |
| `DB_USER` | (from PostgreSQL) |
| `DB_PASSWORD` | (from PostgreSQL) |
| `H2_CONSOLE_ENABLED` | `false` |
| `JWT_SECRET` | `YourSuperSecretJWTKey123!@#$` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `admin123` |

#### Step 2.4: Create PostgreSQL Database
1. In Render dashboard: "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `news-agency-db`
   - **Database Name**: `newsagency`
   - **User**: `newsagency`
3. Copy the "Internal Database URL"
4. Go to your Backend Web Service → Environment
5. Add: `DB_URL=postgresql://newsagency:password@host.internal:5432/newsagency`

---

### Phase 3: Deploy Frontend (Vercel)

#### Step 3.1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

#### Step 3.2: Deploy Frontend
1. Click "Add New..." → "Project"
2. Select your GitHub repository
3. Configure:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `next build`
   - **Output Directory**: `.next` (or `standalone/.next`)
4. In "Environment Variables", add:
   - `NEXT_PUBLIC_API_URL` = `https://news-agency-backend.onrender.com`
   - (Replace with your actual Render backend URL)
5. Click "Deploy"

---

### Phase 4: Connect Frontend to Backend

#### Step 4.1: Update CORS
1. After Vercel deployment, you'll get a URL like: `https://news-agency.vercel.app`
2. Go to Render → Your Backend → Environment
3. Add to CORS config (or create a support ticket if not available in UI)
4. Actually, update **SecurityConfig.java** before pushing:
   ```java
   String[] allowedOrigins = {
       "http://localhost:3000",
       "http://localhost:3301",
       "https://your-project.vercel.app"  // REPLACE THIS
   };
   ```

---

## 🔧 Troubleshooting

### Issue: CORS Errors
**Solution**: Update SecurityConfig.java to include your Vercel domain, then redeploy.

### Issue: Database Connection Failed
**Solution**: 
1. Check PostgreSQL is running on Render
2. Verify DB_URL format is correct
3. Ensure DB_DRIVER is set to `org.postgresql.Driver`

### Issue: Images Not Loading
**Solution**: 
1. File uploads are stored on the server's `/app/uploads` folder
2. For production, consider using Cloudinary or AWS S3
3. Update MediaService to use cloud storage

### Issue: Backend Goes to Sleep
**Solution**: Render's free tier puts services to sleep after 15 min. Upgrade to paid ($7/month) or use a ping service like https://cron-job.org to keep it awake.

---

## 📞 Quick Checklist

Before deploying, verify you have:
- [ ] GitHub account
- [ ] Code pushed to GitHub
- [ ] Updated `api.ts` to use environment variables
- [ ] Updated `SecurityConfig.java` with production domain
- [ ] Created `Dockerfile` for backend
- [ ] Updated `application.properties` for PostgreSQL

---

## 🆘 Need Help?

If you get stuck at any step, share:
1. Which step you're on
2. Any error messages you see
3. Screenshots if possible

I'll help you debug any issues!

