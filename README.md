# 🏛️ Chemnitz Cultural Heritage Map

[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://cultural-heritage-map.vercel.app/)
[![Render](https://img.shields.io/badge/Backend-Render-blue?style=for-the-badge&logo=render)](https://cultural-heritage-map.onrender.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

An interactive web application designed to explore and manage cultural heritage sites in **Chemnitz, Germany**. This project was built using the **MERN stack**, focusing on efficient GIS data handling, interactive mapping, and a professional administrative workflow.

---

### 🔗 **[Live Demo](https://cultural-heritage-map.vercel.app/)**

> ⚠️ **Note:** The backend is hosted on Render's free tier. If the site is idle, the server "sleeps." Please allow **30–60 seconds** for the initial load while the backend wakes up.

---

## ✨ Key Features (Frontend & UX Focus)

* **Interactive Map Rendering:** Real-time visualization of heritage sites using **OpenStreetMap** and the **Overpass API**.
* **Decoupled Architecture:** Optimized performance by hosting the frontend on Vercel’s Global Edge Network and the backend on Render.
* **Admin Dashboard:** Comprehensive interface for managing user roles and reviewing site proposals.
* **Google OAuth 2.0 Integration:** Secure and seamless social authentication flow.
* **Responsive Design:** Fully optimized for mobile, tablet, and desktop viewing.
* **Automated Data Sync:** Weekly cron-jobs to fetch and update cultural data from the Overpass API.

---

## 🛠️ Tech Stack

### **Frontend**
* **React (Vite):** Leveraging Vite for lightning-fast HMR and optimized production builds.
* **TypeScript:** Currently migrating the codebase to TS to ensure type safety and scalability.
* **State Management:** (e.g., React Query / Context API)
* **Styling:** (e.g., CSS Modules / Tailwind CSS)

### **Backend**
* **Node.js & Express:** RESTful API architecture with robust error handling.
* **MongoDB Atlas:** Cloud-hosted NoSQL database utilizing replica sets for transactions.
* **Passport.js:** Strategic implementation of JWT and Google OAuth strategies.

---

## 🚀 Architectural Decision: Why Vercel + Render?

To provide the best possible user experience for a **Werkstudent** portfolio, I chose a decoupled deployment strategy:
1.  **Vercel (Frontend):** Ensures the UI is delivered via CDN immediately, preventing the "blank screen" during backend cold starts.
2.  **Render (Backend):** Provides a reliable environment for Node.js logic and scheduled cron-jobs.
3.  **Result:** Faster First Contentful Paint (FCP) and a more professional feel for the end user.

---

## 🚧 Roadmap & Ongoing Progress

- [ ] **TypeScript Migration:** Converting all React components and Express routes to TypeScript (currently 60% complete).
- [ ] **Berlin Support:** Extending the data architecture to support multiple German cities.
- [ ] **Performance:** Implementing client-side caching to reduce API calls to the Overpass server.

---

## 💻 Local Development

<details>
<summary>Click to expand setup instructions</summary>

### 1. Environment Variables
Create a `.env` file in the `/backend` directory:
```env
MONGO_URI=your_mongodb_atlas_uri
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=/api/v1/auth/google/callback
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=dev
```

### 2. Installation
```
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd backend && npm install
```

### 3. Initialize Database
```
cd backend
# Fetch data from Overpass API
node scripts/fetchAndSaveCulturalSites.js
# Import to MongoDB
node scripts/importGeojson.js --no-reverse-geocode
```
### 4. Run Servers
```
# Frontend
cd frontend && npm run dev (Runs on http://localhost:3000)

# Backend
cd backend && npm start (Runs on http://localhost:5000)
```
</details>

## 📄 API Specification
The API is documented using OpenAPI (Swagger). When running locally, you can access the interactive docs at:
http://localhost:5000/api-docs/
https://cultural-heritage-map.onrender.com/api-docs/
