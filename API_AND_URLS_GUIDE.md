# API and URLs Guide - Complete Reference

## Application URLs

### Frontend Application

The main user interface runs on port 5173. This is where users interact with the multi-tenant dashboard.

**Base URL**: http://localhost:5173

**Main Entry Points**:

When you first visit the base URL without any tenant specified, you'll see a generic multi-tenant SaaS interface. You'll need to select a tenant to see tenant-specific data.

**Tenant-Specific URLs**:

To access a specific tenant's dashboard, you use the path prefix method. The URL format is: forward slash, the letter t, forward slash, then the tenant slug, then another forward slash.

For example, to access the Acme Corp tenant, you would visit: http://localhost:5173/t/acme/

To access the Globex tenant, you would visit: http://localhost:5173/t/globex/

When you visit these URLs, the application automatically:

- Extracts the tenant slug from the URL path
- Loads that tenant's theme colors
- Fetches that tenant's data
- Displays only that tenant's resources

**How Tenant Switching Works**:

You can switch tenants in two ways:

First method: Use the tenant switcher in the top-right corner of the interface. Type a tenant slug like "acme" or "globex" in the input field, then click the "Apply" button. This will navigate you to the path prefix URL for that tenant.

Second method: Click the "Use path prefix" link next to the Apply button. This directly navigates to the path prefix URL format.

**What Happens When You Visit a Tenant URL**:

When you visit a tenant-specific URL like /t/acme/, the frontend application:

1. Reads the tenant slug from the URL path
2. Sends API requests with the tenant identifier in the header
3. Loads the tenant's custom theme CSS
4. Displays the tenant's name and branding
5. Shows only that tenant's resources

---

## Backend API

### Base URL

The backend API server runs on port 4000.

**Base URL**: http://localhost:4000

All API endpoints are prefixed with /api/

---

## API Endpoints

### Root Endpoint

**URL**: http://localhost:4000/

**Method**: GET

**Description**: This is the root endpoint that provides information about the API.

**Response**: Returns a JSON object containing:

- A message identifying this as the Multi-tenant SaaS API
- The API version number
- A list of available endpoints
- Usage instructions

**No Authentication Required**: This endpoint is public and doesn't require a tenant context.

---

### Health Check Endpoint

**URL**: http://localhost:4000/api/health

**Method**: GET

**Description**: This endpoint checks if the API server is running and optionally shows the current tenant context.

**Response**: Returns a JSON object with:

- A status field set to "ok" if the server is running
- A tenant field showing the current tenant slug if one is resolved, or null if no tenant is specified

**No Authentication Required**: This endpoint works without a tenant, but will show tenant information if one is provided via header or path.

**Example Response**: If you access this with a tenant header, you'll see the tenant slug. Without a tenant, the tenant field will be null.

---

### List All Tenants Endpoint

**URL**: http://localhost:4000/api/tenants

**Method**: GET

**Description**: This endpoint returns a list of all tenants in the system. This is useful for administrative purposes or debugging.

**Response**: Returns a JSON array of tenant objects. Each tenant object contains:

- The tenant's name
- The tenant's slug
- The tenant's brand information (tagline, logo URL)

**No Authentication Required**: This endpoint is public and doesn't require tenant context.

**Use Case**: This endpoint helps verify that tenants exist in the database, which is useful when troubleshooting "tenant not found" errors.

---

### Get Current Tenant Information Endpoint

**URL**: http://localhost:4000/api/tenants/me

**Method**: GET

**Description**: This endpoint returns information about the currently active tenant based on the tenant context.

**Tenant Context Required**: Yes, you must provide a tenant identifier via one of these methods:

- Header method: Include X-Tenant-ID header with the tenant slug
- Path method: Access via /t/:slug/api/tenants/me (though this is less common)

**Response**: Returns a JSON object containing:

- The tenant's name
- The tenant's slug
- The tenant's brand information (tagline and logo URL)
- The tenant's theme colors (primary, background, text)

**Error Response**: If no tenant is resolved, returns a 404 error with a message saying "Tenant not resolved".

**Use Case**: The frontend uses this endpoint to display the tenant name and branding in the header, and to get theme information.

---

### Get Tenant Resources Endpoint

**URL**: http://localhost:4000/api/resources

**Method**: GET

**Description**: This endpoint returns all resources belonging to the current tenant.

**Tenant Context Required**: Yes, you must provide a tenant identifier. The endpoint will only return resources that belong to that specific tenant.

**Response**: Returns a JSON array of resource objects. Each resource object contains:

- A unique ID
- The resource title
- The resource content
- Timestamps for when it was created and last updated

**Data Isolation**: This endpoint strictly enforces data isolation. If you request resources for tenant "acme", you will only see resources created for Acme. Resources from other tenants like "globex" will never appear in the response.

**Error Response**: If no tenant is provided, returns a 400 error with a message saying "Tenant required".

**Use Case**: The frontend uses this endpoint to display the list of resources in the main content area.

---

### Create Resource Endpoint

**URL**: http://localhost:4000/api/resources

**Method**: POST

**Description**: This endpoint creates a new resource for the current tenant.

**Tenant Context Required**: Yes, you must provide a tenant identifier. The new resource will be automatically associated with that tenant.

**Request Body**: You must send a JSON object in the request body containing:

- A title field (required) - the title of the resource
- A content field (optional) - the description or content of the resource

**Response**: Returns the newly created resource object with:

- A unique ID assigned by the database
- The title and content you provided
- The tenant ID it's associated with
- Timestamps for creation and update

**Data Isolation**: The resource is automatically scoped to the tenant you specified. It will only be visible when querying resources for that specific tenant.

**Error Response**: If no tenant is provided, returns a 400 error. If the title is missing, returns a validation error.

**Use Case**: The frontend uses this endpoint when users fill out the "Add Resource" form and click the submit button.

---

### Get Specific Resource Endpoint

**URL**: http://localhost:4000/api/resources/:id

**Method**: GET

**Description**: This endpoint returns a specific resource by its ID, but only if it belongs to the current tenant.

**Tenant Context Required**: Yes, you must provide a tenant identifier.

**URL Parameter**: Replace :id with the actual resource ID you want to retrieve.

**Response**: Returns a single resource object if found and if it belongs to the current tenant.

**Data Isolation**: Even if you know a resource ID from another tenant, you cannot access it. The endpoint verifies that the resource belongs to the current tenant before returning it.

**Error Response**: Returns 404 if the resource doesn't exist or doesn't belong to the current tenant.

**Use Case**: Useful for viewing details of a specific resource, though the current frontend doesn't use this endpoint yet.

---

### Get Tenant Theme CSS Endpoint

**URL**: http://localhost:4000/api/themes/current.css

**Method**: GET

**Description**: This endpoint returns CSS code that defines the color scheme for the current tenant.

**Tenant Context Required**: Yes, you must provide a tenant identifier via the X-Tenant-ID header.

**Response**: Returns plain CSS text (not JSON) containing CSS custom properties (variables) that define:

- The primary color (used for buttons, links, logo background)
- The background color (used for the page background)
- The text color (used for all text)

**Response Format**: The CSS uses the :root selector to define CSS variables like --color-primary, --color-bg, and --color-text.

**Caching**: The response includes headers to prevent caching, ensuring you always get the latest theme when switching tenants.

**Use Case**: The frontend dynamically loads this CSS when switching tenants. The CSS variables are then used throughout the interface to apply the tenant's colors.

**How It Works**: When you switch from Acme to Globex, the frontend fetches this endpoint with the Globex tenant header, receives Globex's blue theme CSS, injects it into the page, and all UI elements instantly update to use Globex's colors.

---

## Tenant Resolution Methods

The backend supports three different methods to identify which tenant a request belongs to. These methods are checked in priority order.

### Method 1: HTTP Header (Highest Priority)

**How It Works**: Include a custom HTTP header named X-Tenant-ID with the tenant slug as the value.

**When to Use**: This is the preferred method for API clients, Postman, mobile applications, or any programmatic access.

**Example**: When making a request, include a header like:
Header name: X-Tenant-ID
Header value: acme

**Advantages**:

- Works with any URL path
- Clean and explicit
- Easy to use in API testing tools
- Standard practice for API authentication/context

**How Frontend Uses It**: The frontend automatically includes this header in all API requests when a tenant is selected.

---

### Method 2: Path Prefix (Medium Priority)

**How It Works**: Include the tenant slug in the URL path using the format /t/:slug/ or /tenant/:slug/

**When to Use**: This is the preferred method for web browsers and user-facing URLs.

**Example**: To access Acme's resources, use a URL like: /t/acme/api/resources

**Advantages**:

- SEO-friendly URLs
- User-friendly and readable
- Works well with browser navigation
- Makes it clear which tenant you're viewing

**How Frontend Uses It**: When you visit /t/acme/, the frontend extracts "acme" from the URL and uses it for tenant resolution.

**Note**: The backend middleware can extract the tenant from the path even for API endpoints if they follow the /t/:slug/api/... pattern.

---

### Method 3: Subdomain (Lowest Priority)

**How It Works**: Extract the tenant slug from the subdomain of the hostname.

**When to Use**: This is typically used in production deployments where each tenant gets their own subdomain.

**Example**: If you access acme.yourdomain.com, the backend extracts "acme" from the subdomain.

**Advantages**:

- Professional appearance
- Each tenant appears to have their own domain
- Good for white-label solutions
- Clear separation in production

**Current Status**: This method is implemented but not actively used in local development since localhost doesn't support subdomains easily.

**How It Works**: The backend checks the host header, extracts the first part before the first dot, and uses that as the tenant slug. It ignores "localhost" and IP addresses.

---

## Priority Order

When a request comes in, the backend checks these methods in this exact order:

1. First, check for X-Tenant-ID header
2. If not found, check for path prefix like /t/:slug/
3. If not found, check for subdomain

The first method that provides a tenant slug is used. If none provide a tenant slug, the request proceeds without a tenant context (which may result in errors for tenant-specific endpoints).

---

## Sample Tenant Slugs

After running the seed script, you have two tenants available:

**Acme Corp**:

- Slug: acme
- Theme: Red (#e11d48) with warm background
- Tagline: "Roadrunner Ready"
- Logo: Red square with white diamond shape

**Globex**:

- Slug: globex
- Theme: Blue (#0ea5e9) with dark background
- Tagline: "Future Proof"
- Logo: Blue square with white circle/target shape

---

## Complete Request Examples

### Example 1: Get Acme's Resources Using Header

**URL**: http://localhost:4000/api/resources

**Method**: GET

**Headers**:

- X-Tenant-ID: acme

**Response**: JSON array containing only Acme's resources

---

### Example 2: Get Globex's Resources Using Path

**URL**: http://localhost:4000/api/resources

**Method**: GET

**Headers**:

- X-Tenant-ID: globex

**Or access via**: http://localhost:4000/t/globex/api/resources (if backend supports path extraction for API routes)

**Response**: JSON array containing only Globex's resources

---

### Example 3: Create a Resource for Acme

**URL**: http://localhost:4000/api/resources

**Method**: POST

**Headers**:

- X-Tenant-ID: acme
- Content-Type: application/json

**Body**:

- title: "New Project"
- content: "This is a new project for Acme"

**Response**: The newly created resource object with an ID

---

### Example 4: Get Acme's Theme CSS

**URL**: http://localhost:4000/api/themes/current.css

**Method**: GET

**Headers**:

- X-Tenant-ID: acme

**Response**: CSS text with Acme's red color variables

---

### Example 5: Get Current Tenant Info

**URL**: http://localhost:4000/api/tenants/me

**Method**: GET

**Headers**:

- X-Tenant-ID: acme

**Response**: JSON object with Acme's name, slug, brand, and theme information

---

## Frontend to Backend Communication Flow

When you visit http://localhost:5173/t/acme/, here's what happens:

1. **Frontend loads**: The React application starts
2. **Extract tenant**: Frontend reads "acme" from the URL path /t/acme/
3. **Load theme**: Frontend makes a GET request to http://localhost:4000/api/themes/current.css with header X-Tenant-ID: acme
4. **Get tenant info**: Frontend makes a GET request to http://localhost:4000/api/tenants/me with header X-Tenant-ID: acme
5. **Get resources**: Frontend makes a GET request to http://localhost:4000/api/resources with header X-Tenant-ID: acme
6. **Display data**: Frontend displays Acme's name, logo, theme colors, and resources

All API requests include the X-Tenant-ID header automatically, ensuring the backend knows which tenant's data to return.

---

## Data Isolation Guarantee

Every tenant-specific endpoint enforces strict data isolation:

- Resources endpoint only returns resources where the tenantId matches the current tenant
- Creating resources automatically associates them with the current tenant
- You cannot access another tenant's data even if you know the resource ID
- The middleware ensures every request is scoped to a single tenant

This means:

- Acme users can only see Acme's resources
- Globex users can only see Globex's resources
- There is no way to accidentally or intentionally access another tenant's data
- Each tenant's data is completely isolated from others

---

## Error Responses

### Tenant Not Found (404)

**When it occurs**: When you provide a tenant slug that doesn't exist in the database

**Response**: JSON object with an error field containing "Tenant not found" and the slug you tried to use

**Solution**: Make sure you've run the seed script to create the sample tenants (acme and globex)

---

### Tenant Required (400)

**When it occurs**: When you try to access a tenant-specific endpoint without providing a tenant identifier

**Response**: JSON object with an error field containing "Tenant required"

**Solution**: Include the X-Tenant-ID header or use a path prefix URL

---

### Tenant Not Resolved (404)

**When it occurs**: When the /api/tenants/me endpoint is called but no tenant context is available

**Response**: JSON object with an error field containing "Tenant not resolved"

**Solution**: Make sure you're providing a tenant identifier via header or path

---

## Summary

The application uses a multi-tenant architecture where:

- **Frontend URLs** use path prefixes like /t/acme/ to identify tenants
- **Backend APIs** use headers like X-Tenant-ID to identify tenants
- **All tenant-specific data** is strictly isolated
- **Each tenant** has their own branding, theme, and resources
- **The system** supports multiple methods of tenant identification with priority ordering

The URLs and APIs work together to provide a secure, isolated experience for each tenant while sharing the same application infrastructure.
