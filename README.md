# TECH FEST '26 — Official Technical Symposium Portal
**V V College of Engineering | Department of Computer Science and Engineering**

---

## Overview
TECH FEST '26 is a full-stack web application for the annual technical symposium of V V College of Engineering (Department of CSE). Built with React.js, Node.js, Express, and MongoDB.

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| QR Code | qrcode.react |
| Pass Export | html2canvas + jsPDF |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer |

---

## Project Structure
```
Symposium/
├── backend/               # Node.js + Express API
│   ├── config/            # MongoDB connection
│   ├── controllers/       # API business logic
│   ├── middleware/        # JWT auth, Multer upload, Error handler
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route definitions
│   ├── uploads/           # File uploads (papers, gallery, winners)
│   ├── utils/             # ID generator, CSV exporter, Seed script
│   ├── .env               # Environment variables
│   └── server.js          # Express app entry
└── frontend/              # React.js + Vite frontend
    ├── src/
    │   ├── components/    # Navbar, Footer, EventCard, AdminSidebar, Modal, etc.
    │   ├── context/       # AuthContext, ToastContext
    │   ├── pages/         # Public pages + Admin pages
    │   ├── services/      # Axios API client
    │   ├── App.jsx        # React Router config
    │   └── main.jsx       # Entry point
    ├── index.html         # SEO-optimized HTML
    ├── tailwind.config.js # VVCOE red theme
    └── vite.config.js     # Dev server + proxy config
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm v9+

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/techfest26
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin user**: `username: admin, password: techfest2026`
- **All 6 events** (3 Technical + 2 Non-Technical + 1 Coming Soon)
- **Default settings**

### 4. Start the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Public website |
| http://localhost:5173/admin/login | Admin login |
| http://localhost:5000/api/health | API health check |

---

## Admin Dashboard

Login at `/admin/login` with:
- **Username**: `admin`
- **Password**: `techfest2026`

> ⚠️ **Change the password after first login via Settings**

### Admin Features
- 📊 Dashboard with registration stats
- 👥 Registration management (search, filter, status update, CSV export, delete)
- 📅 Event management (toggle registration open/closed, active/hidden)
- 📄 Paper submissions (view, download, select/reject)
- 🏆 Winners management (add 1st/2nd/3rd per event with photos)
- 📸 Gallery management (upload, categorize, delete)
- ⚙️ Settings (countdown date, contact info, social media links)

---

## Public Events

| Event | Type | Category |
|-------|------|----------|
| 📢 Paper Presentation | Individual / Team (1-3) | Technical |
| 🚀 Dev & Deploy | Individual | Technical |
| 🐞 Bug Buster | Individual | Technical |
| 🔍 Treasure Hunt 2.0 | Team (2) | Non-Technical |
| 🎨 Connect & Sketch | Team (2) | Non-Technical |
| 🎵 Adaptune | Team (2) | Non-Technical |
| ⏳ Coming Soon | — | Placeholder |

---

## API Endpoints

### Public
- `GET /api/events` — List all active events
- `GET /api/events/:slug` — Get event by slug
- `POST /api/registrations` — Register for an event
- `GET /api/registrations/:registrationId` — Get registration by ID
- `POST /api/submissions` — Submit a paper
- `GET /api/winners` — Get all winners
- `GET /api/gallery` — Get gallery images
- `GET /api/settings` — Get public settings

### Auth
- `POST /api/auth/login` — Admin login
- `GET /api/auth/me` — Get current admin
- `PUT /api/auth/change-password` — Change password

### Admin (JWT Required)
- `GET /api/admin/stats` — Dashboard statistics
- `GET|PUT|DELETE /api/admin/registrations` — Manage registrations
- `GET /api/admin/registrations/export/csv` — Export CSV
- `GET|PUT|DELETE /api/admin/submissions` — Manage papers
- `GET|POST|PUT|DELETE /api/admin/winners` — Manage winners
- `GET|POST|DELETE /api/admin/gallery` — Manage gallery
- `GET|PUT /api/admin/settings` — Manage settings
- `GET|PUT|DELETE /api/admin/events` — Manage events

---

## College Information
**V V COLLEGE OF ENGINEERING**
*(Approved By AICTE, New Delhi and Affiliated To Anna University Chennai)*

V V Nagar, Arasoor, Tisaiyanvilai, Sathankulam Taluk, Tuticorin District - 628 656

**Department of Computer Science and Engineering**

---

© 2026 V V College of Engineering. All Rights Reserved.
