const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../.env'),
  override: false
});

const rawConnectionString = (process.env.DATABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');

if (!rawConnectionString) {
  throw new Error('DATABASE_URL is missing. Set it in project root .env');
}

function resolveSslOption(connectionString) {
  const sslMode = (process.env.DATABASE_SSL || 'auto').toLowerCase();

  if (sslMode === 'true') {
    return { rejectUnauthorized: false };
  }

  if (sslMode === 'false') {
    return false;
  }

  try {
    const host = new URL(connectionString).hostname.toLowerCase();
    if (host.includes('neon.tech') || host.includes('amazonaws.com')) {
      return { rejectUnauthorized: false };
    }
  } catch {
    // Fall through to non-SSL for invalid or non-standard URLs.
  }

  return false;
}

const pool = new Pool({
  connectionString: rawConnectionString,
  ssl: resolveSslOption(rawConnectionString)
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};