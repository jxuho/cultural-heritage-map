# 🏛️ Berlin Cultural Heritage Map 

## 🛠️ Tech Stack & Deployment

| Category | Tech |
| :--- | :--- |
| **Deployment** | [![Vercel](https://img.shields.io/badge/Frontend_Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://cultural-heritage-map.vercel.app/) [![Render](https://img.shields.io/badge/Backend_Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://cultural-heritage-map.onrender.com/) |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| **Backend** | ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=black) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) |
| **DevOps & CI/CD** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white) |
| **Testing** | ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white) ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white) |

This web application visualizes **17,535 cultural heritage sites across Berlin**.

The primary focus of this iteration was addressing performance bottlenecks — browser freezing and network latency — that arose from a 35× increase in dataset size. By identifying critical path issues and optimizing execution across both the frontend and backend layers, the application maintains a stable **60 FPS** user experience even on lower-end mobile devices.

### 🔗 **[Live Demo](https://cultural-heritage-map.vercel.app/)** · **[API Docs (Swagger)](https://cultural-heritage-map.onrender.com/api-docs/)**

---

## 📊 Lighthouse Scores (Production)

> Measured on the live deployment. 
<img width="442" height="97" alt="Lighthouse desktop" src="https://github.com/user-attachments/assets/b59be200-91e2-4084-ba7c-fb2b0b7de8bf" />

<br/>
<img width="442" height="97" alt="Lighthouse mobile" src="https://github.com/user-attachments/assets/51cff568-08a0-4cb1-b0ae-d89276fc7b53" />



| Category | Desktop | Mobile |
| :--- | :--- | :--- |
| **Performance** | 99 | 83 |
| **Accessibility** | 89 | 93 |
| **Best Practices** | 100 | 100 |
| **SEO** | 100 | 100 |


---

### Map View — LOD District Markers (Zoom Out)
<img width="960" height="540" alt="Ditrict markers view" src="https://github.com/user-attachments/assets/4bc0bfad-6814-4497-ab5a-19b3a5375d0e" />

### Map View — Clustered & Expanded Markers (Zoom In)
<img width="960" height="540" alt="Map view with marker clusters, individual markers visible at zoom" src="https://github.com/user-attachments/assets/8b00c369-ccf7-4374-8fa3-cf41c5ee3adc" />

<br/>

<details>
<summary><b>📸 More Screenshots (Landing Page · Detail Panel · Admin · Mobile)</b></summary>

**Landing Page**
<img width="960" height="540" alt="Landing page hero section" src="https://github.com/user-attachments/assets/e7bbdba6-5bb2-4beb-bafb-11354c28e56f" />

**List View**
<img width="960" height="540" alt="List view" src="https://github.com/user-attachments/assets/1224255d-f8c2-43f4-8fa6-1c6e7ffc64e7" />

**Side Panel**
<img width="960" height="540" alt="Side panel showing cultural site details" src="https://github.com/user-attachments/assets/5f925482-c0c1-49a1-a263-88b1593c4db3" />

**Admin Dashboard**
<img width="960" height="540" alt="Admin dashboard" src="https://github.com/user-attachments/assets/57706fb2-7ab6-4d22-a227-4cb4ce29606c" />

**Manage Users (Admin)**
<img width="960" height="540" alt="Admin management panel" src="https://github.com/user-attachments/assets/bcf06b35-7d56-4755-ae2b-c2bec6904cd0" />

**Mobile View**
<img width="355" height="636" alt="Mobile responsive view" src="https://github.com/user-attachments/assets/4f0fb801-29d1-4482-95c3-449c4b58611d" />

</details>

---

## 🚀 Quick Start

```bash
git clone https://github.com/jxuho/cultural-heritage-map.git
cd cultural-heritage-map
cp backend/.env.example backend/.env   # Configure your environment variables
docker-compose up --build
```

> **Auto-Seeding:** If the database is empty on initial startup, the backend automatically seeds it with 17,500+ Berlin cultural heritage sites via the Overpass API.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🗺️ Interactive Map | 17,500+ sites rendered with Leaflet, clustered via Supercluster (R-Tree, O(log n)) |
| 🏙️ Berlin Coverage | Migrated from Chemnitz (500 sites) to all 12 Berlin districts (17,535 sites) |
| ⚡ Performance | Web Worker offloading, Flyweight icon cache, Vite code-splitting, preconnect hints |
| 🔐 RBAC | Role-based access control separating `user` and `admin` permissions |
| 👤 Auth | Google OAuth 2.0 + dual-token JWT (Access: 15m Bearer / Refresh: 7d httpOnly cookie) |
| 📡 Live Data Sync | Weekly cron job syncs GeoJSON from OpenStreetMap via Overpass API |
| 🤖 CI/CD | Automated linting, formatting (Prettier), and testing via GitHub Actions |
| ✅ Testing | Unit/Integration with Vitest + RTL; E2E with Playwright (Chromium, WebKit, Firefox) |
| 📱 Responsive | Mobile-first minimalist UI, tested across breakpoints |
| 📄 API Docs | Full OpenAPI/Swagger specification for all 30 endpoints |

---

## 🛠️ Tech Stack

### Frontend
- **React 19 + TypeScript** — Migrated from JavaScript; catches integration errors at compile time
- **TanStack Query** — Server state with caching, background refetch, and loading/error states
- **Zustand** — Lightweight UI state management (map filters, auth)
- **Leaflet + Supercluster** — Open-source mapping with R-Tree spatial indexing
- **Web Worker** — Supercluster tree builds and spatial queries offloaded off the main thread
- **Vitest + React Testing Library** — Unit and integration tests
- **Playwright** — E2E tests across Chromium, WebKit, Firefox
- **Tailwind CSS + shadcn/ui**

### Backend
- **Express.js (MVC)** — Strict Controllers → Services → Models separation
- **MongoDB Atlas + Replica Sets** — Multi-document atomic transactions for admin approval flows
- **Passport.js** — JWT and Google OAuth 2.0 strategies in a single middleware layer
- **Node-cron** — Weekly automated geospatial data sync from OSM

### Infrastructure
| Layer | Service |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| CI/CD | GitHub Actions |
| Local Dev | Docker Compose (3-service stack) |

---

## 🏗️ Architecture Overview

```
┌───────────────────────────────────────────────────┐
│              React Frontend (Vercel)              │
│  Minimalist UI · TanStack Query · Zustand · shadcn│
└─────────────────────┬─────────────────────────────┘
                      │
              (rAF Dispatch / 300ms Debounce)
                      │
┌─────────────────────▼─────────────────────────────┐
│         Web Worker (cluster.worker.ts)            │
│    Supercluster · O(log n) R-Tree · Pre-cache     │
└─────────────────────┬─────────────────────────────┘
                      │ REST API (httpOnly JWT Cookie)
┌─────────────────────▼─────────────────────────────┐
│            Express.js Backend (Render)            │
│    Routes → Controllers → Services (MVC)          │
│    Passport.js · RBAC Middleware                  │
└──────────────┬─────────────────────────────────── ┘
               │
   ┌───────────┴──────────────────┐
   │                              │
┌──▼─────────────────────────┐  ┌─▼──────────────────────────────────┐
│    MongoDB Atlas           │  │        Overpass API (OSM)          │
│  · Single Aggregation Doc  │  │  · Weekly Automated GeoJSON Cron   │
│  · 2dsphere Spatial Index  │  │  · Idempotent Upsert (OSM ID key)  │
│  · Multi-Doc Transactions  │  │  · Promise.allSettled Batch        │
└────────────────────────────┘  └────────────────────────────────────┘
```

---

## 🔑 Engineering & Optimization Details

### 1. Frontend: Spatial Data & Marker Rendering

**Icon Caching via Flyweight Pattern (`iconFactory.ts`)**

Rendering 17k markers repeatedly triggered `ReactDOMServer.renderToString` per marker, causing severe CPU load. Category icons are now cached in singleton-style pools (`iconCache`, `selectedIconCache`) and reused by reference. This reduced serialization calls from 17,000 to ~20 (categories × 2) — a **99.9% reduction**.

**Component Isolation & Reference Integrity (`CulturalSiteMarkers.tsx`)**

The full marker array is wrapped in `useMemo` to prevent recalculation on unrelated UI changes (e.g., toggling the sidebar). Individual markers use `React.memo` with a custom comparator that restricts re-renders to changes in `isSelected` or the site's own data — the remaining 16,999 elements skip virtual DOM diffing entirely.

**Supercluster Spatial Indexing**

Standard React lifecycle-based clustering performs a full O(n) scan per map interaction. Supercluster pre-computes an R-Tree index across all zoom levels (0–18) at startup, reducing viewport queries to O(log n). Active DOM marker count stays between **100–300** at all times regardless of total dataset size.

---

### 2. Thread Offloading & Frame Rate Control

CPU-heavy computations are fully decoupled from the main UI thread:

```
[Before]  Main Thread: UI interactions + Supercluster indexing + cluster calculations + DOM rendering

[After]   Main Thread: UI interactions + rendering of computed visible markers only
               └── Web Worker (cluster.worker.ts): R-Tree indexing + multi-zoom cluster calculations
```

- **Frame Rate Protection via rAF:** High-frequency map events (rapid panning) are throttled with `requestAnimationFrame`, ensuring at most one data update per frame (60 FPS target).
- **Debounce Guard:** A 300ms `lodash.debounce` at the end of the calculation chain ensures the final accurate cluster state is always rendered after panning stops.

---

### 3. Backend Query Optimization Pipeline

Profiling showed that the primary bottleneck was not MongoDB execution (~19ms) but BSON-to-JSON serialization and Mongoose document hydration within Node.js. The query was optimized across five stages:

| Stage | Description | Payload | Avg Latency |
|---|---|---|---|
| **1. Baseline** | No index, no lean | 6,059 KB | 2.03s |
| **2. `.lean()`** | Bypass Mongoose hydration, return plain JS objects | 6,059 KB | 1.67s |
| **3. `hint()`** | Apply `2dsphere` index, prevent full-collection scans | 6,059 KB | 1.56s |
| **4. Data Thinning** | Exclude unused fields via `.select()`, drop `countDocuments()` | 5,244 KB | 1.24s |
| **5. Aggregation Merger** | Merge all docs into a single array in one object | 5,540 KB | **989ms** ✅ |

**Stage 5 — Single-Document Aggregation Merger**

To bypass the overhead of allocating and parsing 17,535 individual document objects in Node.js, a `$group` stage merges all records into a single array inside one document before transmission:

```javascript
const getAllCulturalSites = asyncHandler(async (req, res, next) => {
  const bbox = parseBboxParams(req.query);
  const queryFilter = {};

  if (bbox) {
    queryFilter.location = {
      $geoWithin: {
        $box: [
          [bbox.minLng, bbox.minLat],
          [bbox.maxLng, bbox.maxLat],
        ],
      },
    };
  }

  const pipeline = [
    { $match: queryFilter },
    {
      $project: {
        _id: 1, name: 1, category: 1, location: 1,
        address: 1, averageRating: 1, reviewCount: 1,
      },
    },
    {
      // Groups all documents into a single array inside one document,
      // avoiding per-document object parsing overhead in Node.js.
      $group: {
        _id: null,
        allSites: { $push: '$$ROOT' },
      },
    },
  ];

  const aggregationOptions = bbox ? { hint: { location: '2dsphere' } } : {};
  const result = await CulturalSite.aggregate(pipeline, aggregationOptions);

  const culturalSites = result[0]?.allSites || [];

  res.status(200).json({
    status: 'success',
    results: culturalSites.length,
    data: { culturalSites },
  });
});
```

---

### 4. Data Denormalization & Client-Side Querying

**Read-Optimized Schema Design**

Rather than computing `averageRating` and `reviewCount` via `$lookup` and `$avg` at query time, these fields are embedded directly in the `CulturalSite` schema and updated asynchronously through Mongoose middleware hooks (`post('save')`, `post(/^findOneAnd/)`) only when a review is created, updated, or deleted.

**Client-Side Filtering**

The complete pruned dataset for 17k records is approximately **4MB** — negligible compared to typical browser tab memory usage. Text search and category filtering are processed entirely in-memory on the client, eliminating server roundtrips. Text search is debounced at 300ms, and list views use `IntersectionObserver` for infinite scrolling to keep the off-screen DOM footprint low.

---


### 5. Prefetching Flow (LOD & Animation Pipeline)

Data was originally fetched after navigating to `MapPage`, causing a ~1.5s blank map with a loading spinner if the user zoomed in immediately. This was resolved by hoisting the fetch execution to the entry gateway (`HomePage`) and piping it directly into the Framer Motion layout lifecycle via the `onAnimationComplete` event boundary:
```
User lands on HomePage
└── Layout animation triggers (Staggered UI entry)
└── Animation completes (onAnimationComplete callback fires)
└── Background fetch begins (Asynchronous TanStack Query prefetch)
└── User reads landing metrics (~2–3s)
└── User clicks "Explore Map"
└── Data already cached → markers initialize immediately, no spinner
```
By decoupling the data stream from component mounting and binding it instead to the UI layout finish line, the application avoids competing with the main thread during initial heavy hydration. 

This optimization directly addresses resource contention on mobile devices, protecting the core visual frame rate (60fps) while guaranteeing instant marker initialization upon view change. As a direct result, **Lighthouse Mobile Performance scores improved from 72 to 83**, reducing Total Blocking Time (TBT) and First Contentful Paint (FCP) latency.


---

## 🔒 Security & System Integrity

### Dual-Token JWT Authentication

The auth system separates concerns across two token types to balance security and usability:

| | Access Token | Refresh Token |
|---|---|---|
| **Lifespan** | 15 minutes | 7 days |
| **Storage** | `Authorization: Bearer` header | `httpOnly` + `Secure` cookie |
| **Secret** | `JWT_ACCESS_SECRET` | `JWT_REFRESH_SECRET` |
| **Purpose** | Authorizes API requests | Issues new Access Tokens |

**Flow:**

```
Google OAuth callback
  └── Passport.js verify
        └── Refresh Token issued → stored in httpOnly cookie (never JS-accessible)
              └── Frontend load / 401 response
                    └── GET /auth/refresh → verifies cookie → returns new Access Token
                          └── Access Token stored in memory → attached as Bearer header
```

The `refreshToken` cookie is overwritten with the string `'loggedout'` on logout — a deliberate sentinel value that the `refresh` handler explicitly rejects, avoiding the need to maintain a server-side token denylist.

**`protect` middleware** reads only the `Authorization` header, keeping stateless API verification fully decoupled from the cookie layer:

```javascript
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('Please log in to access this resource.', 401));

  const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError('User not found.', 401));

  req.user = currentUser;
  next();
});
```

**RBAC** (`restrictTo`) is layered on top of `protect` and validated at both the route and service layers:

```javascript
// Route level
router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);

// restrictTo implementation
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(new AppError('You do not have permission to perform this action.', 403));
  next();
};
```

### ACID Transactions for Content Moderation

When an admin approves a user-submitted proposal, a document must move from `Proposals` to `CulturalSites`. This is wrapped in a MongoDB Atlas multi-document transaction — the operation either fully commits or fully rolls back, preventing partial or orphaned writes.

---

## 📊 Project Stats

- **17,535** cultural heritage sites indexed (Berlin, all 12 districts)
- **30** REST API endpoints with full Swagger documentation
- **2 roles** (`user`, `admin`) with distinct permission sets

---

## 🚧 Roadmap

- [x] Expand dataset to Berlin (17,535 sites)
- [x] Minimalist UI redesign
- [x] Web Worker + Supercluster rendering pipeline
- [x] Flyweight icon cache
- [x] Backend aggregation pipeline optimization
- [x] E2E testing with Playwright
- [ ] Optimize mobile web performance and accelerate initial rendering.

---

## 💻 Development & Testing Setup

<details>
<summary><b>🛠️ Setup Instructions (Docker & Manual)</b></summary>

### 🐳 1. Docker Compose (Recommended)

**Step 1: Environment Variables**

Create a `.env` file in the `/backend` directory:

```env
MONGO_URI=mongodb://mongodb:27017/cultural-heritage
PORT=5000
NODE_ENV=dev
JWT_ACCESS_SECRET=your_access_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_COOKIE_EXPIRES_IN=7
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

**Step 2: Start Containers**

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend & Swagger Docs: `http://localhost:5000/api-docs`

### 🛠️ 2. Manual Setup

```bash
# Install root dependencies
npm install

# Backend (http://localhost:5000)
cd backend && npm install && npm run dev

# Frontend (http://localhost:3000)
cd ../frontend && npm install && npm run dev
```

### 🧪 3. Running Tests

```bash
# Frontend unit & integration tests (Vitest)
cd frontend && npm run test

# Frontend E2E tests (Playwright)
cd frontend && npx playwright test

# Backend tests
cd backend && npm run test
```

</details>
