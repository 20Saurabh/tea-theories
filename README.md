# The Agency — News Platform

A full-stack news publishing platform with a minimal black-and-white design.

## Tech Stack
- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Java Spring Boot 3
- **Database**: H2 (local dev) / PostgreSQL (production)
- **Auth**: JWT (admin only)

---

## Quick Start

### Prerequisites
- **Java 17+** — [Download](https://adoptium.net/)
- **Maven 3.8+** — [Download](https://maven.apache.org/)
- **Node.js 18+** — [Download](https://nodejs.org/)

---

## 1. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts at **http://localhost:8080**

- H2 Console: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:file:./newsagency-db`)
- Default admin: `admin` / `admin123`

> **Change admin credentials** in `backend/src/main/resources/application.properties`:
> ```
> app.admin.username=admin
> app.admin.password=admin123
> ```

---

## 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at **http://localhost:3000**

---

## Usage

### Public Site
- Homepage: http://localhost:3000
- Article: http://localhost:3000/article/[slug]
- Category: http://localhost:3000/category/[slug]

### Admin Panel
1. Go to: http://localhost:3000/admin/login
2. Login with `admin` / `admin123`
3. Create articles, upload media, manage content

---

## Admin Features
- **Dashboard**: Overview of all articles
- **Article Editor**: Rich text editor (bold, italic, headings, lists, quotes, code blocks, images, video, audio, links)
- **Media Library**: Upload and manage images, videos, and audio files
- **Publish/Draft**: Control article visibility

## Visitor Features
- Read articles
- Like articles (tracked by browser token, no account needed)
- Comment on articles (no account needed)
- Share articles

---

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/articles | List published articles |
| GET | /api/articles/{slug} | Get article by slug |
| GET | /api/categories | List categories |
| GET | /api/categories/home | Home page data |
| GET | /api/articles/{slug}/comments | Get comments |
| POST | /api/articles/{slug}/comments | Post comment |
| GET | /api/articles/{slug}/like | Get like count |
| POST | /api/articles/{slug}/like?token={token} | Toggle like |

### Admin (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/admin/articles | List all articles |
| POST | /api/admin/articles | Create article |
| PUT | /api/admin/articles/{id} | Update article |
| DELETE | /api/admin/articles/{id} | Delete article |
| POST | /api/admin/media/upload | Upload media |
| GET | /api/admin/media | List media |

---

## Database

The H2 database file is stored at `backend/newsagency-db.mv.db`. To reset, delete this file and restart.

### Switch to PostgreSQL

1. Create a PostgreSQL database
2. Update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/newsagency
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.h2.console.enabled=false
```

---

## Project Structure

```
news-agency/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/newsagency/
│       ├── NewsAgencyApplication.java
│       ├── config/          # Security, CORS, Data init
│       ├── controller/      # REST controllers
│       ├── dto/             # Data transfer objects
│       ├── entity/          # JPA entities
│       ├── repository/      # Spring Data repositories
│       ├── security/        # JWT auth
│       └── service/         # Business logic
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Homepage
│       │   ├── article/[slug]/       # Article page
│       │   ├── category/[slug]/      # Category page
│       │   └── admin/                # Admin panel
│       ├── components/
│       │   ├── editor/RichEditor.tsx # Tiptap editor
│       │   ├── layout/Navbar.tsx
│       │   └── ui/                   # Article card, interactions
│       └── lib/api.ts                # API client
└── README.md
```

---

## Embedding Media in Articles

In the article editor toolbar:
- **Image** button: Enter URL (or copy URL from Media Library)
- **Video** button: Enter YouTube URL or `/uploads/video/filename.mp4`
- **Audio** button: Enter `/uploads/audio/filename.mp3`

To get file URLs from the Media Library:
1. Go to Admin → Media
2. Upload your file
3. Click "Copy URL" on the file
4. Paste into the editor when inserting media
