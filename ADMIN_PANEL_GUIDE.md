# Admin Panel Quick Start Guide

## Setup

1. **Set Admin Password**
   ```bash
   echo "ADMIN_PASSWORD=your_secure_password" >> .env
   ```

2. **Ensure Database is Running**
   - The admin panel requires a PostgreSQL database
   - Connection configured via `DATABASE_URL` in `.env`

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
- Session stored in httpOnly cookie
- Automatic logout after 24 hours
- Secure cookies in production (HTTPS only)

## Development Notes

### Session Management
- Sessions are simple cookie-based tokens
- No database persistence for sessions
- Server restart = all sessions invalidated

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
- Ensure no trailing spaces
- Restart dev server after changing `.env`

### Redirected to login after logging in
- Check browser cookies are enabled
- Check console for errors
- Verify session cookie is set (DevTools > Application > Cookies)

### Can't access database
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

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
