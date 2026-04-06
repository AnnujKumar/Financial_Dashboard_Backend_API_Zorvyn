# Finance Dashboard Backend - API Documentation

## Document Purpose
This is a standalone, production-grade API reference designed for reviewers and integrators.
It includes endpoint behavior, validation constraints, auth model, and sample payloads.

## API Basics
- Base URL: `http://localhost:3000`
- API Prefix: `/api`
- Content Type: `application/json`
- Auth Scheme: `Bearer <JWT>`

## Authentication and Authorization
- JWT required for all protected endpoints.
- Role rules:
  - `viewer`: dashboard summary only
  - `analyst`: dashboard summary + records read
  - `admin`: full access (records write + user management)
- Inactive users are blocked from protected endpoints.

## Validation and Security
- Strong Joi validation for body/query/params.
- Unknown fields are stripped.
- Suspicious payloads are rejected (`__proto__`, `constructor`, `$`-prefixed keys, null-bytes).
- SQL queries are parameterized (`$1`, `$2`, ...).

## Endpoints

### 1) Register User
- Method: `POST`
- Path: `/api/auth/register`
- Auth: No

Request:
```json
{
  "username": "analyst_user",
  "password": "Finance123",
  "role": "analyst"
}
```

Response `201`:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "analyst_user",
    "role": "analyst",
    "status": "active"
  }
}
```

### 2) Login
- Method: `POST`
- Path: `/api/auth/login`
- Auth: No

Request:
```json
{
  "username": "analyst_user",
  "password": "Finance123"
}
```

Response `200`:
```json
{
  "message": "Logged in successfully",
  "token": "<jwt-token>"
}
```

### 3) List Users (Admin)
- Method: `GET`
- Path: `/api/auth/users`
- Auth: Yes (Admin)

Response `200`:
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin_user",
      "role": "admin",
      "status": "active",
      "created_at": "2026-04-06T09:42:13.000Z"
    }
  ]
}
```

### 4) Update User Status (Admin)
- Method: `PATCH`
- Path: `/api/auth/users/:id/status`
- Auth: Yes (Admin)

Request:
```json
{
  "status": "inactive"
}
```

Response `200`:
```json
{
  "message": "User status updated",
  "user": {
    "id": 2,
    "username": "analyst_user",
    "status": "inactive"
  }
}
```

### 5) Update User Role (Admin)
- Method: `PATCH`
- Path: `/api/auth/users/:id/role`
- Auth: Yes (Admin)

Request:
```json
{
  "role": "viewer"
}
```

Response `200`:
```json
{
  "message": "User role updated",
  "user": {
    "id": 2,
    "username": "analyst_user",
    "role": "viewer",
    "status": "active"
  }
}
```

### 6) Get Records (Analyst/Admin)
- Method: `GET`
- Path: `/api/records`
- Auth: Yes (Analyst/Admin)
- Query: `type`, `category`, `startDate`, `endDate`, `limit`, `offset`

Response `200`:
```json
{
  "data": [
    {
      "id": 10,
      "amount": "1200.50",
      "type": "income",
      "category": "Salary",
      "date": "2026-04-01",
      "notes": "April salary payout",
      "created_by": 1,
      "created_at": "2026-04-06T10:05:11.000Z"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

### 7) Create Record (Admin)
- Method: `POST`
- Path: `/api/records`
- Auth: Yes (Admin)

Request:
```json
{
  "amount": 1200.5,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "April salary payout"
}
```

Response `201`:
```json
{
  "message": "Record created",
  "data": {
    "id": 11,
    "amount": "1200.50",
    "type": "income",
    "category": "Salary",
    "date": "2026-04-01",
    "notes": "April salary payout",
    "created_by": 1,
    "created_at": "2026-04-06T10:20:00.000Z"
  }
}
```

### 8) Update Record (Admin)
- Method: `PUT`
- Path: `/api/records/:id`
- Auth: Yes (Admin)

Request:
```json
{
  "amount": 1300,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "Updated amount"
}
```

Response `200`:
```json
{
  "message": "Record updated",
  "data": {
    "id": 11,
    "amount": "1300.00",
    "type": "income",
    "category": "Salary",
    "date": "2026-04-01",
    "notes": "Updated amount",
    "created_by": 1,
    "created_at": "2026-04-06T10:20:00.000Z"
  }
}
```

### 9) Delete Record (Admin)
- Method: `DELETE`
- Path: `/api/records/:id`
- Auth: Yes (Admin)

Response `200`:
```json
{
  "message": "Record deleted",
  "id": "11"
}
```

### 10) Dashboard Summary
- Method: `GET`
- Path: `/api/dashboard/summary`
- Auth: Yes (Viewer/Analyst/Admin)

Response `200`:
```json
{
  "totals": {
    "income": 6500.75,
    "expenses": 2430.15,
    "netBalance": 4070.6
  },
  "categories": [
    {
      "category": "Groceries",
      "type": "expense",
      "total": "340.40"
    }
  ],
  "recentActivity": [
    {
      "id": 8,
      "amount": "79.99",
      "type": "expense",
      "category": "Groceries",
      "date": "2026-04-05",
      "notes": "Weekly supermarket"
    }
  ],
  "monthlyTrends": [
    {
      "month": "2026-04-01",
      "income": "6000.00",
      "expenses": "2100.00"
    }
  ]
}
```

## Standard Error Shapes
Validation errors:
```json
{
  "error": "Validation failed",
  "details": [
    "\"password\" length must be at least 8 characters long"
  ]
}
```

Authorization/business errors:
```json
{
  "error": "Forbidden. You do not have permission to perform this action."
}
```

Unhandled server errors:
```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

## Companion Artifacts
- OpenAPI 3.1 spec: [docs/api/openapi.yaml](api/openapi.yaml)
- Existing API guide: [docs/api/API.md](api/API.md)
- Postman collection: [docs/postman/Finance-Dashboard-Backend.postman_collection.json](postman/Finance-Dashboard-Backend.postman_collection.json)
