# HotelEase — Web-Based Hotel Reservation System

> **Team:** Code Alchemists | **Project ID:** P-2024-28-FW-128

##  Overview

HotelEase is a full-stack web application for hotel reservation management. It enables guests to browse rooms, book stays, make secure payments via Razorpay, and receive QR codes for contactless check-in. Admins can manage bookings, rooms, and view analytics through a real-time dashboard.

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS v4 |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite (dev) / MySQL (prod) via Sequelize ORM |
| **Auth** | JWT + bcrypt |
| **Payment** | Razorpay (sandbox/test mode) |
| **QR Code** | `qrcode` npm package |
| **AI Chatbot** | Google Gemini API (with fallback) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Start the Backend
```bash
cd server
npm install
npm run seed    # Seeds database with sample data
npm run dev     # Starts on http://localhost:5000
```

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev     # Starts on http://localhost:5173
```

### 3. Open the App
Navigate to **http://localhost:5173** in your browser.

##  Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@hotelease.com | Admin@123 |
| **Guest 1** | guest1@gmail.com | Guest@123 |
| **Guest 2** | guest2@gmail.com | Guest@123 |

##  Features

### Guest Features
-  Browse & filter rooms by type, price, dates
-  Date-based booking with availability check
-  Razorpay payment integration (test mode)
-  QR code for contactless check-in
-  AI chatbot concierge
-  Booking history management

### Admin Features
-  Real-time dashboard with stats
-  Room management (CRUD + availability toggle)
-  Check-in / Check-out management
-  Full booking management with search & filters
-  Role-based access control

### Security
- JWT authentication with bcrypt password hashing
- HMAC SHA256 Razorpay signature verification
- Role-based middleware for admin routes
- Input validation with express-validator
- Helmet security headers

##  Project Structure
```
Hotel-Management-System/
├── server/                    # Backend
│   ├── config/db.js          # Database config (SQLite/MySQL)
│   ├── models/               # Sequelize models
│   ├── routes/               # API route handlers
│   ├── middleware/            # Auth & admin middleware
│   ├── utils/                # QR generator
│   ├── seed/                 # Database seeder
│   └── server.js             # Entry point
├── client/                    # Frontend
│   ├── src/
│   │   ├── components/       # Navbar, Footer, ChatBot
│   │   ├── context/          # Auth context
│   │   ├── pages/            # All page components
│   │   ├── services/         # API service
│   │   └── App.jsx           # Router setup
│   └── index.html
└── README.md
```

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/rooms` | List all rooms (with filters) |
| GET | `/api/rooms/:id` | Room details |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | User's bookings |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/qr/:bookingId` | Get QR code |
| POST | `/api/chatbot/message` | Chat with AI |
| GET | `/api/admin/stats` | Dashboard stats |
| PUT | `/api/admin/bookings/:id/checkin` | Admin check-in |
| PUT | `/api/admin/bookings/:id/checkout` | Admin check-out |

##  Seed Data

**10 Rooms:**
- 101–104: Standard @ ₹1,500/night
- 201–204: Deluxe @ ₹2,500/night
- 301–302: Suite @ ₹4,000/night

##  Environment Variables

### Server (`server/.env`)
```
PORT=5000
DB_DIALECT=sqlite
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
GEMINI_API_KEY=xxx
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
```
