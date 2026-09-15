# 🌿 Fern — Modern URL Shortener

A full-stack, responsive URL shortener web application. Paste any long web address to generate a collision-resistant 6-character short link (or custom vanity code) that seamlessly redirects to the destination while tracking total click analytics in real-time.

---

## 🔗 Live Links

- **Live Application (Frontend):** [https://url-shortner-nine-snowy.vercel.app](https://url-shortner-nine-snowy.vercel.app)
- **API Base URL (Backend):** [https://url-shortner-126s.onrender.com/](https://url-shortner-126s.onrender.com/)

---

## ✨ Features

- **⚡ Fast & Collision-Safe Shortening:** Generates 6-character, URL-safe codes using `nanoid` (~56 billion unique combinations) with duplicate checks.
- **🏷️ Custom Vanity Aliases:** Option to specify custom link codes (e.g., `my-custom-link`) with strict regex validation (`3-20` alphanumeric characters, hyphens, and underscores).
- **🔁 Intelligent URL Deduplication:** Re-shortening an existing original URL returns the existing short link instead of creating duplicate records.
- **📊 Real-time Click Tracking:** Automatically logs and increments visit counts upon redirection, with timestamp updates (`lastAccessedAt`).
- **📋 One-Click Clipboard Copying:** Smooth asynchronous clipboard integration with visual status feedback.
- **📜 Recent Links Feed:** Live dashboard displaying recently created short links with original targets and total click counters.
- **🛡️ Robust Error Handling & Validation:** Complete frontend and backend validation for malformed URLs, non-HTTP(S) schemes, code collisions, and database disconnections.
- **📱 Responsive & Elegant UI:** Clean, modern typography and dark-mode aesthetics built with Vanilla HTML5, CSS3, and JavaScript.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5:** Semantic document structure and accessibility attributes.
- **CSS3:** Custom properties, responsive flex/grid layouts, glassmorphism card styling, and micro-interactions.
- **Vanilla JavaScript (ES6+):** Asynchronous DOM manipulation, Fetch API, and Clipboard API without heavy framework overhead.

### Backend
- **Node.js & Express.js:** Modular RESTful API and lightweight HTTP redirection engine.
- **Mongoose (ODM):** Schema validation, indexing, and MongoDB lifecycle management.
- **nanoid:** Fast, secure, URL-friendly unique ID generator.
- **dotenv:** Environment variable isolation.
- **cors:** Configurable cross-origin resource sharing.

### Database & Hosting
- **Database:** MongoDB Atlas (Cloud NoSQL database with automated indexing).
- **Backend Hosting:** Render
- **Frontend Hosting:** Vercel

---

## 🏛️ System Architecture & Workflow

```
┌────────────────────────────────────────────────────────┐
│                   Client (Browser)                     │
│    Vanilla HTML5 / CSS3 / JavaScript (ES6+ Fetch)      │
└─────────────┬────────────────────────────▲─────────────┘
              │ 1. POST /api/shorten        │
              │ 2. GET /api/urls            │ 4. Receives JSON / Short URL
              │ 3. GET /:shortCode (Click)   │
              ▼                            │
┌──────────────────────────────────────────┴─────────────┐
│                 Express.js REST API                    │
│      ├── Routes (/api, /:shortCode, /health)           │
│      ├── Controller (Validation, nanoid, Dedupe)       │
│      └── CORS & Error Handling Middleware              │
└─────────────┬────────────────────────────▲─────────────┘
              │ Query / Insert / Inc       │ Database
              ▼                            │ Documents
┌──────────────────────────────────────────┴─────────────┐
│                   MongoDB Atlas                        │
│            Collection: `urls` (Indexed)                │
└────────────────────────────────────────────────────────┘
```

### Request Flow:
1. **Shorten URL (`POST /api/shorten`):**
   - Validates input format (must be valid `http://` or `https://`).
   - Checks if original URL already exists (reuses if found).
   - Generates a unique 6-character code (or validates custom alias).
   - Persists document in MongoDB Atlas and returns the formatted short URL.
2. **Redirection (`GET /:shortCode`):**
   - Finds matching `shortCode` in MongoDB.
   - Atomically increments `clicks` count by 1 and updates `lastAccessedAt`.
   - Sends an HTTP `302 Found` redirect header targeting the destination `originalUrl`.
3. **Analytics & Recents (`GET /api/urls`):**
   - Fetches the 20 most recent shortened links sorted by `createdAt` descending.

---

## 📂 Project Directory Structure

```
url-shortener/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB Atlas connection with Mongoose
│   │   ├── controllers/
│   │   │   └── urlController.js    # Core logic (shorten, redirect, stats, list)
│   │   │   └── validateUrl.js      # URL format validation helper
│   │   ├── models/
│   │   │   └── Url.js              # Mongoose schema and unique indexing
│   │   ├── routes/
│   │   │   ├── apiRoutes.js        # API endpoints (/api/shorten, /api/urls, etc.)
│   │   │   └── redirectRoutes.js   # Top-level short code redirection (/:shortCode)
│   │   ├── utils/
│   │   │   └── validateUrl.js      # URL format validation helper
│   │   └── index.js                # Express app initialization, middleware, server boot
│   ├── .env.example                # Sample environment variables
│   ├── .gitignore                  # Git ignore rules for node_modules and .env
│   ├── package.json                # Dependencies and backend scripts
├── frontend/
│   ├── index.html                  # Main user interface
│   ├── style.css                   # Custom styles, responsive layout, animations
│   └── script.js                   # Client-side logic, API calls, and event listeners
├── .gitignore                      # Root gitignore

```

---

## 🗄️ Database Schema

Defined in [`backend/src/models/Url.js`](backend/src/models/Url.js):

| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `originalUrl` | `String` | Yes | — | The destination URL (trimmed). |
| `shortCode` | `String` | Yes | — | Unique 6-character alias or custom code (**Unique Index**). |
| `clicks` | `Number` | No | `0` | Total number of times redirected. |
| `lastAccessedAt` | `Date` | No | `null` | Timestamp of the most recent redirect. |
| `createdAt` | `Date` | Auto | Timestamp | Creation date (managed by `timestamps: true`). |
| `updatedAt` | `Date` | Auto | Timestamp | Last update date (managed by `timestamps: true`). |

---

## 📡 API Reference

### 1. Shorten a URL
- **Endpoint:** `POST /api/shorten`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "originalUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    "customCode": "mdn-js" // Optional
  }
  ```
- **Response (`201 Created` / `200 OK`):**
  ```json
  {
    "shortCode": "mdn-js",
    "shortUrl": "https://your-backend.onrender.com/mdn-js",
    "originalUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    "clicks": 0,
    "reused": false
  }
  ```

### 2. Redirect Short Code
- **Endpoint:** `GET /:shortCode`
- **Response:** `302 Found` (Redirects to original URL) or `404 Not Found`.

### 3. Get Link Analytics
- **Endpoint:** `GET /api/stats/:shortCode`
- **Response (`200 OK`):**
  ```json
  {
    "shortCode": "mdn-js",
    "originalUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    "clicks": 14,
    "createdAt": "2026-09-12T10:00:00.000Z",
    "lastAccessedAt": "2026-09-12T15:30:00.000Z"
  }
  ```

### 4. Get Recent Links
- **Endpoint:** `GET /api/urls`
- **Response (`200 OK`):** Array of the 20 most recent shortened URLs.

### 5. Health Check
- **Endpoint:** `GET /health`
- **Response (`200 OK`):** `{"status": "healthy"}`

---

## 🚀 Deployment Process Followed

Here is the step-by-step process I followed to deploy this full-stack application to production:

### 1. Database Provisioning (MongoDB Atlas)
- Created a shared cluster on **MongoDB Atlas** for cloud database management.
- Configured database credentials and configured Network Access with `0.0.0.0/0` to allow secure connections from cloud host environments.
- Obtained the connection URI string to connect Mongoose with the hosted database.

---

### 2. Backend Deployment on [Render]
- Connected the GitHub repository (`sanay7-devv/url-shortner`) to a new **Web Service** on Render.
- Configured the service settings:
  - **Root Directory:** `backend`
  - **Runtime:** `Node`
  - **Build Command:** `npm install`
  - **Start Command:** `npm start`
- Configured production environment variables on Render:
  - `MONGODB_URI`: Secure connection string to MongoDB Atlas.
  - `BASE_URL`: `https://url-shortner-126s.onrender.com`
  - `ALLOWED_ORIGINS`: Configured to allow cross-origin requests from the Vercel frontend.
- Verified backend deployment and verified the `/health` endpoint at `https://url-shortner-126s.onrender.com/health`.

---

### 3. Frontend Deployment on [Vercel]
- Configured the API endpoint targeting in [`frontend/script.js`](frontend/script.js) to dynamically connect to the live Render backend (`https://url-shortner-126s.onrender.com`).
- Connected the repository to **Vercel**:
  - **Root Directory:** `frontend`
  - **Framework Preset:** `Other` (Vanilla HTML/CSS/JS)
- Deployed the client-side files to obtain the production URL: [`https://url-shortner-nine-snowy.vercel.app/`](https://url-shortner-nine-snowy.vercel.app/).

---

### 4. Integration & CORS Verification
- Updated backend CORS settings via the `ALLOWED_ORIGINS` environment variable on Render with the production Vercel domain (`https://url-shortner-nine-snowy.vercel.app`).
- Tested end-to-end functionality including URL compression, custom vanity codes, instant 302 redirections, clipboard copying, and live click tracking.

---

## 🛡️ Edge Cases & Error Handling

- **Malformed URL Rejection:** Inputs without `http://` or `https://` protocol or invalid URI formats are caught on both client and server before querying the database.
- **Custom Alias Validation:** Checks that custom codes follow alphanumeric and hyphen/underscore rules (`^[a-zA-Z0-9_-]{3,20}$`) and returns `409 Conflict` if already in use.
- **Race-Condition Collision Prevention:** Protected by a MongoDB unique index on `shortCode` and automatic 5-attempt retry loop on random code generation.
- **Graceful Error Messages:** Central error middleware prevents server crashes and avoids leaking internal stack traces or connection strings to client responses.

---

