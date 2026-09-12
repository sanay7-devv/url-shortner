# 🌿 Fern — Modern URL Shortener

A full-stack, responsive URL shortener web application. Paste any long web address to generate a collision-resistant 6-character short link (or custom vanity code) that seamlessly redirects to the destination while tracking total click analytics in real-time.

---

## 🔗 Live Links

- **Live Application (Frontend):** [https://your-frontend-url.vercel.app](https://your-frontend-url.vercel.app) *(Replace with your live URL)*
- **API Base URL (Backend):** [https://your-backend-url.onrender.com](https://your-backend-url.onrender.com) *(Replace with your live URL)*
- **GitHub Repository:** [https://github.com/your-username/url-shortener](https://github.com/your-username/url-shortener)

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
- **Backend Hosting:** Render / Railway.
- **Frontend Hosting:** Vercel / Netlify / GitHub Pages.

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
│   └── Backend.md                  # Backend and database configuration documentation
├── frontend/
│   ├── index.html                  # Main user interface
│   ├── style.css                   # Custom styles, responsive layout, animations
│   └── script.js                   # Client-side logic, API calls, and event listeners
├── .gitignore                      # Root gitignore
└── README.md                       # Project documentation & assignment report
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

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/url-shortener.git
cd url-shortener
```

---

### Step 2: Configure & Start Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env   # On Windows PowerShell: copy .env.example .env
```

Open `backend/.env` and fill in your values:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shortener?retryWrites=true&w=majority
BASE_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,http://localhost:5000
```

Start the backend server:
```bash
npm start
```
*The backend will boot on `http://localhost:5000`.*

---

### Step 3: Run Frontend
Open a new terminal window:
```bash
cd frontend

# Option A: Serve locally using Node's serve utility
npx serve .

# Option B: Or open frontend/index.html with VS Code Live Server
```
*The frontend automatically targets `http://localhost:5000` when running locally.*

---

## 🚀 Production Deployment Guide

### Step 1: Set up MongoDB Atlas (Cloud Database)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free Shared Cluster.
2. In **Database Access**, create a database user with username and password.
3. In **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so hosting providers can connect.
4. Go to **Database → Connect → Drivers**, copy the connection string and insert your password and database name:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/urlshortener?retryWrites=true&w=majority`

---

### Step 2: Deploy Backend to [Render](https://render.com)
1. Push your repository to **GitHub**.
2. Sign in to Render and click **New + → Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name:** `url-shortener-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. In the **Environment Variables** section, add:
   - `MONGODB_URI` = *(Your MongoDB Atlas connection string from Step 1)*
   - `BASE_URL` = `https://<your-service-name>.onrender.com` *(Render assigned URL)*
   - `ALLOWED_ORIGINS` = `*` *(or your frontend URL once deployed)*
6. Click **Deploy Web Service**.
7. Test by visiting `https://<your-backend-url>.onrender.com/health` in your browser.

---

### Step 3: Deploy Frontend to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

#### Updating API Base URL in Frontend:
Before or after deploying the backend, update line 5 of [`frontend/script.js`](frontend/script.js):
```javascript
const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://your-backend-name.onrender.com"; // <-- Paste your Render backend URL here
```

#### Deploying on Vercel:
1. Log in to [Vercel](https://vercel.com) and click **Add New → Project**.
2. Select your GitHub repository.
3. In the project setup:
   - **Root Directory:** Edit and choose `frontend`.
   - **Framework Preset:** Select `Other`.
4. Click **Deploy**.
5. Copy your live Vercel URL (e.g. `https://url-shortener-xxx.vercel.app`).

---

### Step 4: Final Connection (CORS Security)
1. Go back to your backend service dashboard on **Render**.
2. Update the `ALLOWED_ORIGINS` environment variable with your frontend domain:
   ```env
   ALLOWED_ORIGINS=https://url-shortener-xxx.vercel.app
   ```
3. Save changes. Render will redeploy automatically with strict CORS protection.

---

## 🛡️ Edge Cases & Error Handling

- **Malformed URL Rejection:** Inputs without `http://` or `https://` protocol or invalid URI formats are caught on both client and server before querying the database.
- **Custom Alias Validation:** Checks that custom codes follow alphanumeric and hyphen/underscore rules (`^[a-zA-Z0-9_-]{3,20}$`) and returns `409 Conflict` if already in use.
- **Race-Condition Collision Prevention:** Protected by a MongoDB unique index on `shortCode` and automatic 5-attempt retry loop on random code generation.
- **Graceful Error Messages:** Central error middleware prevents server crashes and avoids leaking internal stack traces or connection strings to client responses.

---

## 👤 Author & Assignment Details

- **Student / Author:** Sagar Shah
- **Assignment:** URL Shortener Full-Stack Web Application
- **Date:** September 2026
