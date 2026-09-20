/**
 * Builds the URL slug for a portfolio item from its title.
 *
 * Single source of truth for portfolio slugs: the sitemap, the card links and
 * the detail-page lookup all derive slugs from here, so they cannot drift
 * apart. Kept free of server-only imports so client components can use it.
 *
 * Current titles are alphanumeric + spaces, so this reproduces the URLs
 * already published in the sitemap (e.g. "Maximus IPTV Player" ->
 * "maximus-iptv-player").
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
