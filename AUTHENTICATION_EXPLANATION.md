# Authentication System Explanation

This document explains how the authentication system is implemented in this Multi-Tenant SaaS application.

## Overview

The authentication system uses **JWT (JSON Web Tokens)** with **bcrypt** for password hashing. It's designed to work with multi-tenant architecture where each user belongs to a specific tenant.

## Architecture

### 1. **User Model** (`backend/src/models/User.js`)

The User model stores user information with password hashing:

```javascript
- tenantId: Links user to a specific tenant
- email: User's email (lowercased and trimmed)
- name: User's full name
- password: Hashed password (never stored in plain text)
- role: 'user' or 'admin'
```

**Key Features:**

- **Password Hashing**: Uses `bcrypt` with 10 salt rounds
- **Pre-save Hook**: Automatically hashes password before saving to database
- **Password Comparison**: Method to compare plain password with hashed password

```javascript
// Password is automatically hashed when user is created
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to verify password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

### 2. **Authentication Middleware** (`backend/src/middleware/auth.js`)

This middleware protects routes by verifying JWT tokens:

**How it works:**

1. Extracts token from `Authorization` header or cookie
2. Verifies token using JWT_SECRET
3. Fetches user from database
4. Validates tenant match (security check)
5. Attaches user to request object

```javascript
// Token can come from:
// 1. Authorization header: "Bearer <token>"
// 2. HTTP-only cookie: req.cookies.token

// After verification, req.user contains the authenticated user
```

**Security Features:**

- Token expiration (7 days)
- Tenant isolation (users can only access their tenant's data)
- Invalid token handling

### 3. **Auth Routes** (`backend/src/routes/auth.js`)

#### **POST /api/auth/register**

Creates a new user account:

1. Validates tenant exists
2. Checks if email already exists in tenant
3. Creates user (password auto-hashed)
4. Generates JWT token
5. Sets token in HTTP-only cookie
6. Returns user data and token

#### **POST /api/auth/login**

Authenticates existing user:

1. Validates tenant exists
2. Finds user by email and tenant
3. Compares password using bcrypt
4. Generates JWT token
5. Sets token in HTTP-only cookie
6. Returns user data and token

#### **GET /api/auth/me**

Gets current authenticated user (requires token):

- Uses `authMiddleware` to verify token
- Returns user information

#### **POST /api/auth/logout**

Logs out user:

- Clears the token cookie

### 4. **Frontend Authentication** (`frontend/src/components/Login.jsx`)

**Login Flow:**

1. User enters email and password
2. Frontend sends POST request to `/api/auth/login`
3. Includes `X-Tenant-ID` header with tenant slug
4. Backend validates and returns token
5. Token stored in:
   - `localStorage` (for frontend access)
   - HTTP-only cookie (for automatic requests)
6. User data stored in React state
7. Redirects to dashboard

**Registration Flow:**

- Similar to login, but also requires name
- Creates new user account

### 5. **Protected Routes**

Routes that require authentication use `authMiddleware`:

```javascript
// Example: Resources route
router.use(authMiddleware); // All routes below require auth

router.get("/", async (req, res) => {
  // req.user is available here (set by authMiddleware)
  // Can access: req.user._id, req.user.email, req.user.role, etc.
});
```

### 6. **Token Generation** (`backend/src/middleware/auth.js`)

```javascript
// JWT token contains:
{
  userId: user._id,
  // Automatically includes: iat (issued at), exp (expiration)
}

// Token expires in 7 days
// Signed with JWT_SECRET from environment variables
```

## Security Features

### 1. **Password Security**

- ✅ Passwords never stored in plain text
- ✅ bcrypt hashing with 10 salt rounds
- ✅ Passwords cannot be retrieved (only compared)

### 2. **Token Security**

- ✅ Tokens expire after 7 days
- ✅ Signed with secret key
- ✅ Stored in HTTP-only cookies (prevents XSS)
- ✅ Also available in localStorage for frontend use

### 3. **Tenant Isolation**

- ✅ Users can only access their tenant's data
- ✅ Tenant validation on every request
- ✅ Prevents cross-tenant access

### 4. **Role-Based Access**

- ✅ Admin and User roles
- ✅ Admin middleware for admin-only routes
- ✅ Role checks in frontend and backend

## Authentication Flow Diagram

```
1. User selects tenant
   ↓
2. User enters credentials on login page
   ↓
3. Frontend sends: POST /api/auth/login
   - Headers: X-Tenant-ID, Content-Type
   - Body: { email, password }
   ↓
4. Backend validates:
   - Tenant exists?
   - User exists in tenant?
   - Password matches?
   ↓
5. Backend generates JWT token
   ↓
6. Backend responds:
   - Sets HTTP-only cookie with token
   - Returns { user, token }
   ↓
7. Frontend stores token in localStorage
   ↓
8. Frontend stores user in state
   ↓
9. User redirected to dashboard
   ↓
10. Subsequent requests include token:
    - Authorization: Bearer <token>
    - Or automatically via cookie
```

## Usage Examples

### Backend: Protect a Route

```javascript
import { authMiddleware } from "../middleware/auth.js";

router.get("/protected", authMiddleware, async (req, res) => {
  // req.user is available
  res.json({ message: `Hello ${req.user.name}` });
});
```

### Frontend: Make Authenticated Request

```javascript
const token = localStorage.getItem("token");
const response = await fetch(`${API_BASE}/api/resources`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "X-Tenant-ID": tenant,
  },
  credentials: "include",
});
```

### Frontend: Check Authentication

```javascript
// In App.jsx
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    // Verify token is still valid
    fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Tenant-ID": tenant,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {
        // Token invalid, clear it
        localStorage.removeItem("token");
        setUser(null);
      });
  }
}, [tenant]);
```

## Test Credentials

After running `npm run seed` in the backend:

**Acme Tenant:**

- Email: `alice@acme.com`
- Password: `password123`
- Role: Admin

**Globex Tenant:**

- Email: `gary@globex.com`
- Password: `password123`
- Role: User

## Key Technologies

- **JWT (jsonwebtoken)**: For token-based authentication
- **bcryptjs**: For password hashing
- **HTTP-only cookies**: For secure token storage
- **localStorage**: For frontend token access
- **Express middleware**: For route protection

## Security Best Practices Implemented

1. ✅ Passwords hashed with bcrypt
2. ✅ JWT tokens with expiration
3. ✅ HTTP-only cookies
4. ✅ Tenant isolation
5. ✅ Input validation
6. ✅ Error handling without exposing sensitive info
7. ✅ Role-based access control
