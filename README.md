# Multi-Tenant SaaS Application

A full-stack multi-tenant SaaS application with authentication and authorization.

## Features

- **Multi-tenant Architecture**: Support for multiple tenants with isolated data
- **Authentication**: JWT-based authentication with secure password hashing
- **Authorization**: Protected routes requiring authentication
- **Beautiful UI**: Dark-themed login page matching modern design standards
- **Tenant Isolation**: Each tenant has their own data, theme, and branding

## Setup

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create `.env` file):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/multitenant_saas
JWT_SECRET=your-secret-key-change-in-production
PORT=4000
HOST=localhost
ALLOWED_ORIGINS=http://localhost:5173
```

4. Seed the database with sample data:
```bash
npm run seed
```

This will create:
- Two tenants: `acme` and `globex`
- Test users:
  - `alice@acme.com` / `password123` (for acme tenant)
  - `gary@globex.com` / `password123` (for globex tenant)

5. Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:4000`

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_BASE=http://localhost:4000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Select a Tenant**: Enter a tenant slug (e.g., `acme` or `globex`) in the tenant switcher
2. **Login**: Use the test credentials:
   - For Acme: `alice@acme.com` / `password123`
   - For Globex: `gary@globex.com` / `password123`
3. **Access Dashboard**: After logging in, you'll have access to the resources dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout

### Resources (Protected)
- `GET /api/resources` - Get all resources for current tenant
- `POST /api/resources` - Create a new resource
- `GET /api/resources/:id` - Get a specific resource

### Tenants
- `GET /api/tenants` - List all tenants
- `GET /api/tenants/me` - Get current tenant info

### Themes
- `GET /api/themes/current.css` - Get current tenant's theme CSS

## Authentication

All resource endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Or the token will be automatically sent via HTTP-only cookies.

## Project Structure

```
ProjectApp/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT authentication middleware
│   │   │   └── tenantContext.js  # Tenant context middleware
│   │   ├── models/
│   │   │   ├── User.js          # User model with password hashing
│   │   │   ├── Tenant.js        # Tenant model
│   │   │   └── Resource.js      # Resource model
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication routes
│   │   │   ├── resources.js    # Resource routes (protected)
│   │   │   ├── tenants.js       # Tenant routes
│   │   │   └── themes.js        # Theme routes
│   │   └── server.js            # Express server
│   └── seed/
│       └── seed.js              # Database seeding script
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx        # Login component
    │   │   └── Login.css        # Login styles
    │   ├── App.jsx              # Main app component
    │   └── styles.css           # Global styles
    └── vite.config.js
```

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- HTTP-only cookies are used for token storage (when supported)
- CORS is configured to restrict origins
- Tenant isolation ensures users can only access their tenant's data

## Development

- Backend uses Express 5 with ES modules
- Frontend uses React 19 with Vite
- Database: MongoDB with Mongoose
- Authentication: JWT with jsonwebtoken
