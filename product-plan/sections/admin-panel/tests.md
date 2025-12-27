# Admin Panel Tests

## Authentication Tests

### Login Success

1. **Valid Credentials**
   - Given: User enters valid email and password
   - When: User clicks "Sign In"
   - Then: Loading state shown, `onLogin` called, redirected to `/admin`

### Login Failure

2. **Invalid Credentials**
   - Given: User enters incorrect email/password
   - When: User clicks "Sign In"
   - Then: Error message displayed: "Invalid login credentials"

3. **Empty Fields**
   - Given: User submits form with empty fields
   - Then: Browser validation prevents submission

### Session Management

4. **Protected Route - No Session**
   - Given: User is not logged in
   - When: User navigates to `/admin`
   - Then: Redirected to `/admin/login`

5. **Protected Route - Valid Session**
   - Given: User is logged in
   - When: User navigates to `/admin`
   - Then: Dashboard loads successfully

6. **Logout**
   - Given: User is logged in
   - When: User clicks "Logout"
   - Then: Session cleared, redirected to `/admin/login`

## Dashboard Tests

7. **Stats Display**
   - Given: Dashboard loads
   - Then: Portfolio count, blog count, and recent activity shown

8. **Recent Items**
   - Given: Dashboard loads
   - Then: Recent portfolio items and blog posts listed

9. **Quick Actions**
   - Given: Dashboard loads
   - When: User clicks "Add Portfolio Item"
   - Then: `onAddPortfolioItem` callback invoked

## Portfolio Management Tests

10. **List Items**
    - Given: User navigates to `/admin/portfolio`
    - Then: All portfolio items displayed in table

11. **Add Item**
    - Given: User clicks "Add Item"
    - When: Form opens, user fills details, submits
    - Then: New item appears in list

12. **Edit Item**
    - Given: User clicks edit button on item
    - When: Form opens with existing data, user modifies, saves
    - Then: Item updated in list

13. **Delete Item**
    - Given: User clicks delete button on item
    - When: Confirmation shown, user confirms
    - Then: Item removed from list

## Blog Management Tests

14. **List Posts**
    - Given: User navigates to `/admin/blog`
    - Then: All posts displayed (drafts + published)

15. **Add Post**
    - Given: User clicks "Add Post"
    - When: Form filled, submitted
    - Then: New post appears (as draft by default)

16. **Edit Post**
    - Given: User clicks edit on post
    - When: Form modified, saved
    - Then: Post updated

17. **Delete Post**
    - Given: User clicks delete on post
    - When: Confirmed
    - Then: Post removed

18. **Publish Post**
    - Given: Post is in draft status
    - When: User publishes
    - Then: Status changes to "published", `published_at` set

19. **Unpublish Post**
    - Given: Post is published
    - When: User unpublishes
    - Then: Status changes to "draft"

## Sample Test Data

```typescript
const mockAdmin = {
  id: "admin-001",
  email: "admin@aegontech.dev",
  name: "Admin User"
}

const mockStats = {
  totalPortfolioItems: 6,
  totalBlogPosts: 6,
  recentActivityCount: 12
}

const mockRecentPortfolio = [
  { id: "dialable", title: "Dialable", type: "saas", updatedAt: "2024-12-20T10:00:00Z" }
]

const mockRecentBlog = [
  { id: "post-1", title: "Building Scalable SaaS", status: "published", updatedAt: "2024-12-20T10:00:00Z" }
]
```
