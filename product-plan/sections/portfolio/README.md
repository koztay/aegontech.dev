# Portfolio Section

The public portfolio page displaying all AEGONTECH projects.

## Components

| Component | Description |
|-----------|-------------|
| `PortfolioGrid.tsx` | Page layout with responsive grid |
| `PortfolioCard.tsx` | Project card with screenshot, badge, and links |

## Props

See `types.ts` for complete TypeScript interfaces.

Main props:
- `items` — Array of portfolio items
- `onExternalLink` — Optional callback when external link clicked

## PortfolioItem Structure

```typescript
interface PortfolioItem {
  id: string
  title: string
  description: string
  type: 'saas' | 'mobile'
  screenshot: string
  links: {
    website?: string
    appStore?: string
    playStore?: string
  }
}
```

## Sample Data

See `sample-data.json` for realistic test data with 6 projects.

## Integration Notes

- Card buttons open external links in new tabs
- Type badge shows SaaS (indigo) or Mobile (cyan)
- Grid is responsive: 3 cols (desktop) → 2 cols (tablet) → 1 col (mobile)
- Screenshots use `object-cover` for consistent aspect ratio
