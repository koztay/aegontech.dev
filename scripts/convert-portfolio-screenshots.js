#!/usr/bin/env node
/**
 * One-off: rewrite portfolio_items.screenshot from a full storage URL to a bucket-relative
 * storage path (e.g. "portfolio/abc-file.png"). Uses Supabase (service role) via supabase-js.
 *
 * Usage (from the repo root; needs `npm install` in frontend/ for @supabase/supabase-js and Node >= 20.12):
 *   node scripts/convert-portfolio-screenshots.js
 * Env (read from frontend/.env, then the process env): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * SUPABASE_STORAGE_BUCKET (bucket name used to find the path inside the URL).
 */
const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

// Load env from frontend/.env if present (Node's built-in loader; no dotenv dependency)
const envPath = path.resolve(__dirname, '../frontend/.env');
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envPath);
}

const { createClient } = createRequire(path.resolve(__dirname, '../frontend/package.json'))('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}
const bucket = process.env.SUPABASE_STORAGE_BUCKET;
if (!bucket) {
  console.error('Missing SUPABASE_STORAGE_BUCKET in env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function run() {
  console.log('Scanning portfolio_items.screenshot entries...');
  const sel = await supabase.from('portfolio_items').select('id, screenshot').not('screenshot', 'is', null);
  if (sel.error) throw new Error(sel.error.message);
  const rows = sel.data;
  console.log(`Found ${rows.length} rows with screenshot`);

  let converted = 0;
  for (const row of rows) {
    const { id, screenshot } = row;
    if (!screenshot) continue;
    // Skip if already a storage path (no http scheme)
    if (!screenshot.startsWith('http')) continue;

    try {
      const url = new URL(screenshot);
      const pathname = decodeURIComponent(url.pathname || '');
      // Try to extract path after /{bucket}/
      const bucketMarker = `/${bucket}/`;
      let storagePath = null;
      if (pathname.includes(bucketMarker)) {
        storagePath = pathname.split(bucketMarker)[1];
      } else {
        // fallback: if pathname starts with /{bucket}
        if (pathname.startsWith(`/${bucket}`)) {
          storagePath = pathname.replace(`/${bucket}/`, '').replace(`/${bucket}`, '');
        } else {
          // try to find last occurrence of /<bucket-name>/ in full url string
          const m = screenshot.match(new RegExp(`/${bucket}/(.+?)(\\?|$)`));
          if (m && m[1]) storagePath = m[1];
        }
      }

      if (!storagePath) {
        console.log(`Skipping id=${id}: could not extract storage path from ${screenshot}`);
        continue;
      }

      // Update DB with storage path (no leading slash)
      const upd = await supabase.from('portfolio_items').update({ screenshot: storagePath }).eq('id', id);
      if (upd.error) throw new Error(upd.error.message);
      console.log(`Updated id=${id} -> ${storagePath}`);
      converted++;
    } catch (err) {
      console.warn(`Error processing id=${id}:`, err.message || err);
    }
  }

  console.log(`Conversion complete. Updated ${converted} rows.`);
}

run().catch((err) => { console.error(err); process.exit(1); });
