# What is Path Prefix?

## Simple Explanation

**Path prefix** means putting the tenant identifier at the beginning of the URL path.

Think of it like this: Instead of having a separate website for each tenant, you put the tenant's name in the URL itself.

## How It Works

### Regular URL Structure

A normal URL looks like this:
```
http://localhost:5173/
```

This is just the base URL with no tenant information.

### Path Prefix URL Structure

With path prefix, you add the tenant name after a forward slash and the letter "t":

```
http://localhost:5173/t/acme/
http://localhost:5173/t/globex/
```

The "t" stands for "tenant", and "acme" or "globex" is the tenant slug (identifier).

## Breaking Down the URL

Let's break down this URL: `http://localhost:5173/t/acme/`

- `http://localhost:5173` - This is the base address of the frontend application
- `/t/` - This is the path prefix marker (t for tenant)
- `acme` - This is the tenant slug (the identifier for Acme Corp)
- `/` - This is just the end of the path

So the full path is: forward slash, letter t, forward slash, tenant slug, forward slash.

## Why It's Called "Prefix"

The word "prefix" means something that comes at the beginning. In this case, the tenant identifier comes at the beginning of the URL path, before any other parts of the path.

For example:
- `/t/acme/` - The tenant "acme" is at the start (prefix) of the path
- `/t/acme/resources` - Even if you had more path after it, "acme" is still the prefix

## Real-World Example

Think of it like apartment numbers in a building:

- Regular URL: `building.com` (which apartment?)
- Path prefix: `building.com/apartment-5/` (apartment 5)

The apartment number (tenant) is part of the address (URL path).

## How the Application Uses It

When you visit `http://localhost:5173/t/acme/`:

1. The frontend application reads the URL
2. It sees `/t/acme/` in the path
3. It extracts "acme" as the tenant identifier
4. It uses "acme" to:
   - Load Acme's theme colors
   - Fetch Acme's data
   - Display Acme's branding
   - Show only Acme's resources

## Comparison with Other Methods

### Path Prefix Method
```
http://localhost:5173/t/acme/
```
- Tenant is in the URL path
- Easy to see which tenant you're viewing
- Works well for web browsers
- User-friendly and readable

### Header Method
```
http://localhost:5173/
```
With header: `X-Tenant-ID: acme`
- Tenant is in a hidden HTTP header
- Not visible in the URL
- Works well for API calls
- Used by the frontend automatically

### Subdomain Method (Production)
```
http://acme.yourdomain.com/
```
- Tenant is in the subdomain
- Each tenant appears to have their own domain
- Professional appearance
- Used in production deployments

## Why Use Path Prefix?

### Advantages:

1. **User-Friendly**: You can see which tenant you're viewing just by looking at the URL

2. **Shareable**: You can copy and share the URL, and it will show the same tenant

3. **Browser-Friendly**: Works naturally with browser navigation, back/forward buttons, and bookmarks

4. **SEO-Friendly**: Search engines can understand the URL structure

5. **Clear Organization**: Makes it obvious that different tenants have different URLs

## Example Flow

1. You type in the browser: `http://localhost:5173/t/acme/`
2. The browser sends a request to that URL
3. The frontend application receives the request
4. The frontend extracts "acme" from the path `/t/acme/`
5. The frontend uses "acme" to make API calls with the header `X-Tenant-ID: acme`
6. The backend returns Acme's data
7. The frontend displays Acme's interface

## In Simple Terms

**Path prefix** = Putting the tenant name in the web address itself, like putting a room number in a building address.

Instead of:
- "Go to the building" (which room?)

You have:
- "Go to the building, room 5" (clear which room)

That's what path prefix does - it makes it clear which tenant you're accessing by putting it right in the URL.

