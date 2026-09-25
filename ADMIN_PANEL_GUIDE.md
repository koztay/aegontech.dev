# Admin Panel Quick Start Guide

## Setup

1. **Set Admin Password**
   ```bash
   echo "ADMIN_PASSWORD=your_secure_password" >> .env
   echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env
   ```
   `SESSION_SECRET` (at least 32 characters) is required for admin login: it signs the session cookie.

2. **Ensure Database is Running**
   - The admin panel uses a Supabase project (Postgres + Storage)
   - Configured via `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_STORAGE_BUCKET` in `.env`

3. **Start Development Server**
   ```bash
   cd frontend
   pnpm dev
   ```

## Access

Navigate to: `http://localhost:3000/admin`

- If not authenticated, you'll be redirected to `/admin/login`
- Enter your admin password
- Session lasts 24 hours

## Features

### Dashboard (`/admin`)
- View portfolio items count
- View blog posts count
- Navigate to management pages
- Logout

### Portfolio Management (`/admin/portfolio`)
- View all portfolio items
- See title, slug, status, and creation date
- Edit button (navigate to edit page - to be implemented)
- View button (preview on public site)
- Create new item button (to be implemented)

### Blog Management (`/admin/blog`)
- View all blog posts
- See title, slug, status, and creation date
- Edit button (navigate to edit page - to be implemented)
- View button (preview on public site)
- Create new post button (to be implemented)

## Security

- All admin routes protected by middleware
- Password stored in environment variable
- Session is a signed (HMAC-SHA256) token in an httpOnly cookie, verified on every admin page and API request
- Admin API routes also require a valid session (or the `x-api-key` / `x-internal-secret` headers)
- Automatic logout after 24 hours
- Secure cookies in production (HTTPS only)

## Development Notes

### Session Management
- Sessions are signed (HMAC-SHA256) tokens; nothing is stored server-side
- A session lasts 24 hours, then expires
- Restarting the server does NOT end sessions; they are invalidated only by rotating `SESSION_SECRET` (or by expiring)
- Logout only removes the cookie in that browser; a copied token stays valid until it expires or `SESSION_SECRET` is rotated

### Database Queries
- Direct PostgreSQL queries via `pg` library
- Tables: `portfolio_items`, `blog_posts`
- Falls back to placeholder data if DB unavailable

### Adding New Admin Pages

1. Create page in `app/admin/[feature]/page.tsx`
2. Add server-side data fetching
3. Use existing UI components from `components/ui/`
4. Middleware automatically protects the route

## Troubleshooting

### "Invalid password" error
- Check `ADMIN_PASSWORD` in `.env` file
- A generic "Login failed" (500) usually means `SESSION_SECRET` is missing or shorter than 32 characters
- Ensure no trailing spaces
- Restart dev server after changing `.env`

### Redirected to login after logging in
- Check browser cookies are enabled
- Check console for errors
- Verify session cookie is set (DevTools > Application > Cookies)

### Can't access database
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Check the Supabase project is reachable
- Test connection: `curl -s "$SUPABASE_URL/rest/v1/blog_posts?select=id&limit=1" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"`

## Next Steps (To Implement)

1. **Create/Edit Forms**
   - Portfolio item form
   - Blog post form
   - Image upload

2. **Delete Functionality**
   - Add delete buttons
   - Confirmation dialogs

3. **Enhanced Auth**
   - Multiple admin users
   - Role-based access
   - Password reset

4. **Rich Content**
   - Markdown editor for blog
   - Image gallery for portfolio
   - Preview mode
