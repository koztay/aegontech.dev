# Portfolio Tests

## User Flow Tests

### Success Paths

1. **View Portfolio Grid**
   - Given: User navigates to `/portfolio`
   - When: Page loads
   - Then: All portfolio items displayed in grid

2. **Click Website Link**
   - Given: Portfolio item has website URL
   - When: User clicks "Visit Website"
   - Then: Opens URL in new tab, `onExternalLink` callback invoked

3. **Click App Store Link**
   - Given: Portfolio item has App Store URL
   - When: User clicks "App Store"
   - Then: Opens URL in new tab

4. **Click Play Store Link**
   - Given: Portfolio item has Play Store URL
   - When: User clicks "Play Store"
   - Then: Opens URL in new tab

### Optional: Type Filtering

5. **Filter by SaaS**
   - Given: Portfolio page with mixed items
   - When: User selects "SaaS" filter
   - Then: Only SaaS items displayed

6. **Filter by Mobile**
   - Given: Portfolio page with mixed items
   - When: User selects "Mobile" filter
   - Then: Only Mobile items displayed

## Empty State Tests

7. **No Portfolio Items**
   - Given: Empty items array
   - Then: Show empty state message or placeholder

8. **No Links for Item**
   - Given: Portfolio item with no external links
   - Then: No link buttons shown (graceful handling)

## Component Interaction Tests

9. **Card Hover Effect**
   - Given: User hovers over portfolio card
   - Then: Shadow increases, slight translate-y animation

10. **Image Loading**
    - Given: Screenshot URL is valid
    - Then: Image loads with cover fit

11. **Image Fallback**
    - Given: Screenshot URL fails to load
    - Then: Placeholder or skeleton shown

## Responsive Tests

12. **Desktop Grid**
    - Given: Viewport > 1024px
    - Then: 3-column grid layout

13. **Tablet Grid**
    - Given: Viewport 768px - 1024px
    - Then: 2-column grid layout

14. **Mobile Grid**
    - Given: Viewport < 768px
    - Then: 1-column stacked layout

## Sample Test Data

```typescript
const mockPortfolioItems = [
  {
    id: "dialable",
    title: "Dialable",
    description: "International calling platform...",
    type: "saas",
    screenshot: "https://picsum.photos/seed/dialable/800/600",
    links: { website: "https://dialable.io" }
  },
  {
    id: "maximus-iptv",
    title: "Maximus IPTV Player",
    description: "Feature-rich IPTV player...",
    type: "mobile",
    screenshot: "https://picsum.photos/seed/maximus/800/600",
    links: {
      appStore: "https://apps.apple.com/app/maximus-iptv",
      playStore: "https://play.google.com/store/apps/details?id=com.maximus.iptv"
    }
  }
]
```
