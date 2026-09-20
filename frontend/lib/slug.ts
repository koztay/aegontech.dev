// Turkish letters transliterated to their ASCII counterparts. Done explicitly
// because `ı` and `İ` do not decompose into an ASCII base character the way
// `ç` or `ö` do, so NFD normalisation alone would drop them.
const TURKISH_TO_ASCII: Record<string, string> = {
  ı: "i",
  ğ: "g",
  ü: "u",
  ş: "s",
  ö: "o",
  ç: "c",
};

/**
 * Builds the URL slug for a portfolio item from its title.
 *
 * Single source of truth for portfolio slugs: the sitemap, the card links and
 * the detail-page lookup all derive slugs from here, so they cannot drift
 * apart. Kept free of server-only imports so client components can use it.
 *
 * Accented and Turkish letters are transliterated rather than treated as
 * separators, so "Çevre Temiz" becomes "cevre-temiz" and not "evre-temiz".
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[ığüşöç]/g, (ch) => TURKISH_TO_ASCII[ch])
    // Strip any remaining diacritics (é -> e, and the combining dot that
    // lowercasing "İ" leaves behind).
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
