# Finance Dashboard Backend

A Node.js/Express backend built for a finance dashboard system demonstrating access control, financial record processing, and dashboard analytics. This project uses **Neon (Serverless Postgres)** for data persistence.

## 🚀 Features & Architecture

*   **User & Role Management**: Register, login, and robust role-based access control (RBAC). Supported roles: `viewer`, `analyst`, `admin`.
*   **Records Management**: Full CRUD operations with detailed filtering and validation on financial transactions.
*   **Dashboard Apis**: Real-time aggregated summaries including expense/income totals, category breakdowns, and recent activity.
*   **Authentication**: Secure stateless JWT-based authentication.
*   **Data Validation**: Strict input validation using Joi.
*   **Centralized Error Handling**: Unified and structured error responses.

## 📋 Prerequisites

*   Node.js (v16+)
*   Neon PostgreSQL database URL

## 🛠️ Setup Instructions

1.  **Clone / Download Repository**
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file referencing `.env.example`:
    ```ini
    PORT=3000
    DATABASE_URL=postgres://[user]:[password]@[neon-host].neon.tech/dbname?sslmode=require
    JWT_SECRET=your_jwt_secret
    ```
4.  **Database Migration**:
    Run the SQL commands provided in `src/config/schema.sql` directly in your Neon console SQL editor (or any Postgres client) to setup the required tables.
5.  **Start Application**:
    ```bash
    npm run dev  # for development with live reload
    npm start    # for production
    ```

## 🔐 Access Control Logic

-   **Viewer**: Can only view dashboard summary (`GET /api/dashboard/summary`).
-   **Analyst**: Can view records and dashboard insights (`GET /api/records`, `GET /api/dashboard/summary`).
-   **Admin**: Full management access for records and user administration.

## 📍 API Endpoints

### Auth
*   `POST /api/auth/register` - Create new user (body: `username`, `password`, `role`)
*   `POST /api/auth/login` - Authenticate user, get JWT
*   `GET /api/auth/users` - (Admin only) List users for management
*   `PATCH /api/auth/users/:id/status` - (Admin only) Enable/disable a user account
*   `PATCH /api/auth/users/:id/role` - (Admin only) Change user role

### Records
*   `GET /api/records` - List fields with query params (`type`, `category`, `startDate`, `endDate`, `limit`, `offset`)
*   `POST /api/records` - (Admin only) Create transaction (body: `amount`, `type`, `category`, `date`, `notes`)
*   `PUT /api/records/:id` - (Admin only) Update transaction
*   `DELETE /api/records/:id` - (Admin only) Delete transaction

### Dashboard
*   `GET /api/dashboard/summary` - Provides `totals`, category-wise spending/income, recent activity, and monthly trends.

## 📘 API Documentation

- Human-readable API guide: [docs/api/API.md](docs/api/API.md)
- OpenAPI 3.1 spec: [docs/api/openapi.yaml](docs/api/openapi.yaml)
- Standalone submission doc: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- Postman collection: [docs/postman/Finance-Dashboard-Backend.postman_collection.json](docs/postman/Finance-Dashboard-Backend.postman_collection.json)

The OpenAPI file includes production-grade request/response schemas, auth requirements, role-based access expectations, validation constraints, and error contracts for every route.

## 🖥️ Frontend API Tester (Included)

The repository includes a React frontend in `frontend/` that exercises all backend APIs:

- Register/Login flow
- Role-based route access (viewer/analyst/admin)
- Dashboard summary and trends
- Records filter + CRUD testing
- Admin user management (list users, change role, change status)

Run frontend:

```bash
cd frontend
npm install
npm run dev
```

Optional frontend env file:

```ini
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📦 Tech Stack Decisions
-   **Node.js/Express**: Unopinonated, lean framework for highly customizable REST APIs.
-   **Neon (Postgres)**: Serverless edge Postgres which provides lightning-fast spinups and scale-to-zero—perfect for dashboard prototypes.
-   **pg (node-postgres)**: Native PostgreSQL client.
-   **Joi**: Robust and clean validation layer avoiding excessive manual if/else checks.
-   **Bcrypt & JWT**: Industry-standard pairing for strong encryption of passwords and tokenized stateless session management.
