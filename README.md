# 💸 Expense Tracker — MERN Stack Web Application

![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![ExpressJS](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)

A full-stack financial dashboard web application built using the **MERN** stack. Track income, expenses, monthly budgets, and recurring schedules, analyze 6-month cashflow trends with interactive charts, customize currencies, and export records directly to Excel.

---

### 🌐 Live Demo & Deployment
👉 **Live Frontend Application**: [https://somesh-expense-tracker.vercel.app/](https://somesh-expense-tracker.vercel.app/)  
⚙️ **Production Backend API**: [https://expensetracker-4dxe.onrender.com](https://expensetracker-4dxe.onrender.com)  
🗄️ **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 📊 Performance & Benchmarks

| Metric | Service | Value |
| :--- | :--- | :--- |
| **Frontend Load Time** | Vercel Edge | `176 ms` |
| **Backend API Latency** | Render Server | `248 ms` |

> ⚡ **Concurrency Stress Test**: 100% success rate under 30 parallel users (0 dropped requests, 27.22 req/sec throughput).

---

## ✨ Features

- 🔐 **User Authentication & Account Settings**: Secure JWT-based registration, login, profile photo upload, multi-currency selection (`USD`, `INR`, `EUR`, `GBP`), and password updates.
- 📊 **Interactive Financial Dashboard**: Real-time all-time and current-month summaries (income, expenses, net savings, savings rate), quick-add modals, 6-month Income vs Expense chart, and monthly category breakdown.
- 💰 **Full Transaction CRUD & Filtering**: Add, edit, view, search, sort, and filter Income and Expense records by source/category, payment method, notes, and custom date ranges.
- 🎯 **Monthly Budgets & Spending Alerts**: Set monthly `"Overall"` or category-specific spending caps with live progress bars (`On Track`, `Near Limit`, `Exceeded`).
- 🔁 **Recurring Transactions**: Schedule weekly, monthly, or yearly recurring income and expenses that automatically log when due, with pause/resume and manual sync controls.
- 📥 **Excel Data Export**: Export formatted income and expense spreadsheets (`.xlsx`) directly from memory.
- 📱 **Responsive Dashboard UI**: Adaptive sidebar and mobile drawer built with React, Tailwind CSS, and Recharts.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, React Icons, React Hot Toast, Axios |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, Multer, XLSX |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Directory Structure

```text
ExpenseTracker/
├── backend/                  # Node.js + Express + MongoDB REST API
│   ├── config/               # Database connection setup
│   ├── controllers/          # Route logic (Auth, Dashboard, Income, Expense, Budgets, Recurring)
│   ├── middleware/           # JWT auth & file upload middleware
│   ├── models/               # Mongoose schemas (User, Income, Expense, Budget, RecurringTransaction)
│   ├── routes/               # API endpoint routing definitions
│   ├── uploads/              # Storage directory for user profile avatars
│   ├── .env.example          # Template for backend environment variables
│   ├── package.json          # Node.js backend dependencies
│   └── server.js             # Express server entry point
│
└── frontend/                 # React + Vite Client Application
    ├── public/               # Static assets
    ├── src/
    │   ├── assets/           # UI images & icons
    │   ├── components/       # Reusable cards, charts, filters, modals & layout components
    │   ├── context/          # React User Context provider
    │   ├── hooks/            # Custom authentication & state hooks
    │   ├── pages/            # Routes (Login, SignUp, Dashboard, Income, Expense, Budgets, Recurring, Settings)
    │   └── utils/            # Currency/date helpers, API paths & Axios instance
    ├── package.json          # Frontend dependencies
    └── vite.config.js        # Vite configuration
```

---

## 🚀 Local Installation & Setup

Follow these steps to run the project locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Somesh27062005/ExpenseTracker.git
cd ExpenseTracker
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_jwt_key
PORT=8000
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to view the app!

---

## 🔑 Environment Variables

| Variable | Location | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | Backend (`.env`) | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend (`.env`) | Secret key used for signing JWT tokens |
| `PORT` | Backend (`.env`) | Port for Express backend server (Default: `8000`) |
| `VITE_API_BASE_URL` | Frontend (Vercel) | Production backend API endpoint URL |

---

## 📡 Key API Endpoints

```text
POST   /api/v1/auth/register        # Register new user
POST   /api/v1/auth/login           # Login user
GET    /api/v1/auth/getUser         # Fetch logged-in user profile
PUT    /api/v1/auth/profile         # Update profile, photo, or preferred currency
PUT    /api/v1/auth/change-password # Update account password
GET    /api/v1/dashboard            # Fetch consolidated analytics, budgets & sync status

POST   /api/v1/income/add           # Add new income item
GET    /api/v1/income/get           # Get income transactions (supports search/date/source filters)
PUT    /api/v1/income/:id           # Update an income transaction
DELETE /api/v1/income/:id           # Delete an income transaction
GET    /api/v1/income/downloadexcel # Export income transactions to Excel

POST   /api/v1/expense/add          # Add new expense item
GET    /api/v1/expense/get          # Get expense transactions (supports search/date/category filters)
PUT    /api/v1/expense/:id          # Update an expense transaction
DELETE /api/v1/expense/:id          # Delete an expense transaction
GET    /api/v1/expense/downloadexcel# Export expense transactions to Excel

GET    /api/v1/budgets              # Get monthly budget summary & spending breakdown
POST   /api/v1/budgets              # Create or update a monthly budget limit
DELETE /api/v1/budgets/:id          # Delete a budget limit

GET    /api/v1/recurring            # Get recurring rules (auto-syncs due occurrences)
POST   /api/v1/recurring            # Create a recurring income/expense schedule
POST   /api/v1/recurring/sync       # Manually trigger due recurring transaction sync
PUT    /api/v1/recurring/:id        # Update or pause/resume a recurring schedule
DELETE /api/v1/recurring/:id        # Delete a recurring schedule
```
