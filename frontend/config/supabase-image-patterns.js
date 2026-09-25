/**
 * Derive the next/image remotePatterns entry for Supabase Storage from SUPABASE_URL.
 * Plain CommonJS so next.config.js can require it (and vitest can import it).
 *
 * In a production build a missing/invalid SUPABASE_URL is a hard error: most blog and
 * portfolio images are absolute Supabase Storage URLs, and without the pattern every
 * next/image would fail at runtime with no build-time signal. In dev/tests we fall back
 * to "no pattern".
 */
function supabaseImagePatterns(env, isProductionBuild) {
  const raw = env.SUPABASE_URL;
  const fail = (why) => {
    if (isProductionBuild) {
      throw new Error(
        `SUPABASE_URL ${why}: it is required at build time (next/image remotePatterns for Supabase Storage). ` +
          "Set SUPABASE_URL to the project URL, e.g. https://supabase.aegontech.dev"
      );
    }
    return [];
  };
  if (!raw) return fail("is not set");
  let u;
  try {
    u = new URL(raw);
  } catch {
    return fail(`is not a valid URL (${JSON.stringify(raw)})`);
  }
  return [
    {
      protocol: u.protocol.replace(':', ''),
      hostname: u.hostname,
      port: u.port,
      pathname: '/storage/v1/object/public/**',
    },
  ];
}

module.exports = { supabaseImagePatterns };
