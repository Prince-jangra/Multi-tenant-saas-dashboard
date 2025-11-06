# Multi-Tenant SaaS Dashboard

A multi-tenant SaaS application with React frontend and Node.js/Express backend, featuring strict data isolation and tenant-specific branding.

## Features

- **Multi-tenant support** with data isolation
- **Tenant resolution** via subdomain, path prefix (`/t/:slug`), or header (`X-Tenant-ID`)
- **Runtime theming** - each tenant has custom colors/branding
- **MongoDB** for data storage with tenant-scoped queries

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally (default: `mongodb://127.0.0.1:27017`)

### Setup

1. **Install dependencies:**

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

2. **Seed the database** (creates sample tenants: `acme` and `globex`):

```bash
cd backend
npm run seed
```

3. **Start the backend:**

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:4000`

4. **Start the frontend** (in a new terminal):

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Accessing Tenants

- **Path prefix mode** (recommended): 
  - `http://localhost:5173/t/acme/` - Acme Corp tenant
  - `http://localhost:5173/t/globex/` - Globex tenant

- **Header mode**: Use the tenant switcher in the top-right corner

### Sample Tenants

After seeding, you'll have:
- **acme** - Acme Corp (red theme)
- **globex** - Globex (blue theme)

## Troubleshooting

### "Tenant not found" error

Make sure you've run the seed script:
```bash
cd backend
npm run seed
```

### MongoDB connection error

Ensure MongoDB is running on your machine:
- Default connection: `mongodb://127.0.0.1:27017`
- Or set `MONGODB_URI` in `backend/.env`

## Project Structure

```
ProjectApp/
├── backend/
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   ├── middleware/        # Tenant context middleware
│   │   ├── models/            # MongoDB models
│   │   └── routes/            # API routes
│   └── seed/                  # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   └── styles.css         # Styling
│   └── vite.config.js         # Vite configuration
└── README.md
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/tenants/me` - Get current tenant info
- `GET /api/resources` - Get tenant resources
- `POST /api/resources` - Create resource
- `GET /api/themes/current.css` - Get tenant theme CSS

