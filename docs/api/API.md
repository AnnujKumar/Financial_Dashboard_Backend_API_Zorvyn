# Finance Dashboard API Documentation

## Overview
This document provides a production-oriented summary of all backend API endpoints.

- Base URL: `http://localhost:3000`
- Prefix: `/api`
- Auth: Bearer JWT (header: `Authorization: Bearer <token>`)
- Full machine-readable spec: [openapi.yaml](openapi.yaml)

## Roles and Access Matrix

| Route Group | Viewer | Analyst | Admin |
|---|---|---|---|
| Dashboard summary | Yes | Yes | Yes |
| Records list/filter | No | Yes | Yes |
| Records create/update/delete | No | No | Yes |
| Users list/update status/update role | No | No | Yes |

## Error Contract
Most errors are returned as JSON with one of these formats:

1. Validation middleware errors
```json
{
  "error": "Validation failed",
  "details": [
    "\"password\" length must be at least 8 characters long"
  ]
}
```

2. Business/auth errors
```json
{
  "error": "Forbidden. You do not have permission to perform this action."
}
```

3. Unexpected server errors
```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

## Endpoint Reference

### Auth

#### POST /api/auth/register
Creates a new user account.

Request body:
- username: string, 3-50, pattern `^[a-zA-Z0-9_]+$`
- password: string, 8-72, must contain at least one letter and one number
- role: optional enum (`viewer`, `analyst`, `admin`), defaults to `viewer`

Success response (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "analyst_user",
    "role": "analyst",
    "status": "active"
  }
}
```

#### POST /api/auth/login
Authenticates user and returns JWT.

Request body:
- username: string
- password: string

Success response (200):
```json
{
  "message": "Logged in successfully",
  "token": "<jwt-token>"
}
```

#### GET /api/auth/users (Admin)
Returns all users.

Success response (200):
```json
{
  "data": [
    {
      "id": 1,
      "username": "finance_admin",
      "role": "admin",
      "status": "active",
      "created_at": "2026-04-06T09:42:13.000Z"
    }
  ]
}
```

#### PATCH /api/auth/users/:id/status (Admin)
Activates or deactivates a user.

Path params:
- id: positive integer

Request body:
- status: enum (`active`, `inactive`)

Success response (200):
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

#### PATCH /api/auth/users/:id/role (Admin)
Changes a user's role.

Path params:
- id: positive integer

Request body:
- role: enum (`viewer`, `analyst`, `admin`)

Success response (200):
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

### Records

#### GET /api/records (Analyst/Admin)
Lists records with filtering and pagination.

Query params:
- type: optional enum (`income`, `expense`)
- category: optional string (max 50)
- startDate: optional ISO date
- endDate: optional ISO date
- limit: optional int (1-100), default 50
- offset: optional int (>=0), default 0

Success response (200):
```json
{
  "data": [
    {
      "id": 10,
      "amount": "1200.50",
      "type": "income",
      "category": "Salary",
      "date": "2026-04-01",
      "notes": "April payout",
      "created_by": 1,
      "created_at": "2026-04-06T10:05:11.000Z"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

#### POST /api/records (Admin)
Creates a new financial record.

Request body:
- amount: positive number
- type: enum (`income`, `expense`)
- category: string (2-50)
- date: ISO date
- notes: optional string (max 500)

Success response (201):
```json
{
  "message": "Record created",
  "data": {
    "id": 11,
    "amount": "500.00",
    "type": "expense",
    "category": "Rent",
    "date": "2026-04-02",
    "notes": "April rent",
    "created_by": 1,
    "created_at": "2026-04-06T10:20:00.000Z"
  }
}
```

#### PUT /api/records/:id (Admin)
Updates a record by id.

Path params:
- id: positive integer

Request body:
- same schema as POST /api/records

Success response (200):
```json
{
  "message": "Record updated",
  "data": {
    "id": 11,
    "amount": "550.00",
    "type": "expense",
    "category": "Rent",
    "date": "2026-04-02",
    "notes": "Updated amount",
    "created_by": 1,
    "created_at": "2026-04-06T10:20:00.000Z"
  }
}
```

#### DELETE /api/records/:id (Admin)
Deletes a record by id.

Path params:
- id: positive integer

Success response (200):
```json
{
  "message": "Record deleted",
  "id": "11"
}
```

### Dashboard

#### GET /api/dashboard/summary (Viewer/Analyst/Admin)
Returns aggregated finance analytics.

Success response (200):
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

## Security and Validation Notes
- All SQL calls are parameterized.
- Input is validated at route boundaries with strict schemas.
- Unknown fields are stripped by validation middleware.
- Suspicious payload structures are rejected before controller execution.
- JWT auth checks live user status and role from database.

## Suggested Tooling for API Consumers
- Swagger UI: import [openapi.yaml](openapi.yaml)
- Postman: import OpenAPI spec directly
- CI validation: use Spectral or openapi-cli against [openapi.yaml](openapi.yaml)
