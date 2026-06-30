# EcoHub - E-Commerce Platform

A full-stack e-commerce platform built with Node.js/Express backend and HTML/CSS/JavaScript frontend. Features user authentication, product management, shopping cart, and order processing with Supabase PostgreSQL database.

## Features

**Backend:**
- User authentication with JWT and bcrypt
- RESTful API for products, orders, and user management
- Secure middleware and error handling
- Database integration with Supabase

**Frontend:**
- Responsive design for desktop and mobile
- User signup and login flow
- Product catalog and shopping cart
- Order history and user profile management

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT + bcrypt

## Project Structure

```
EcoHub/
├── backend/
│   ├── config/          # Database configuration
│   ├── db/              # Database queries
│   ├── middleware/      # Authentication and error handling
│   ├── routes/          # API routes (auth, products, orders)
│   ├── .env.example     # Environment variables template
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── index.html
    ├── styles.css
    └── script.js
```

## Installation

### Prerequisites
- Node.js (v14+)
- Supabase account
- Live Server (for frontend)

### Backend Setup

```bash
cd backend
npm install

# Create .env file with:
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_secret_key

npm start
```

Server runs on `http://localhost:3000`

### Frontend Setup

Open `frontend/index.html` with Live Server (right-click → Open with Live Server)

Frontend runs on `http://127.0.0.1:5500`

## Usage

1. Signup with email and password
2. Login to access your dashboard
3. Browse and add products to cart
4. Place orders and view order history

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get user orders |

## Database Schema

**Users:** id, email, password (hashed), full_name, created_at

**Products:** id, name, description, price, category, image_url

**Orders:** id, user_id, total_amount, status, created_at

## Environment Variables

Create `.env` in the backend directory:

```
PORT=3000
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
JWT_SECRET=your_secret_key
```

Note: `.env` is excluded from Git for security.

## Testing

1. Start backend: `npm start` (in backend folder)
2. Open frontend with Live Server
3. Signup → Login → Browse products → Add to cart → Place order

---

**Author:** Shinjini (CodeAlpha Internship)
