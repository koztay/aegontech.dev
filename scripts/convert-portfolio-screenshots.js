#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load env from frontend/.env if present
const envPath = path.resolve(__dirname, '../frontend/.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL in env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const bucket = process.env.MINIO_S3_BUCKET_NAME || process.env.MINIO_BUCKET || 'aegontech';

async function run() {
  console.log('Scanning portfolio_items.screenshot entries...');
  const res = await pool.query('SELECT id, screenshot FROM portfolio_items WHERE screenshot IS NOT NULL');
  console.log(`Found ${res.rows.length} rows with screenshot`);

  let converted = 0;
  for (const row of res.rows) {
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
      await pool.query('UPDATE portfolio_items SET screenshot = $1 WHERE id = $2', [storagePath, id]);
      console.log(`Updated id=${id} -> ${storagePath}`);
      converted++;
    } catch (err) {
      console.warn(`Error processing id=${id}:`, err.message || err);
    }
  }

  console.log(`Conversion complete. Updated ${converted} rows.`);
  await pool.end();
}

run().catch((err) => { console.error(err); process.exit(1); });
