// Optional Supabase auth guard for /api/chat.
//
// Disabled by default — server.js only wires this in when REQUIRE_AUTH === 'true',
// so the running site's behaviour is unchanged until you flip that flag.
//
// Requires SUPABASE_URL and SUPABASE_ANON_KEY in the backend .env. The frontend
// must send the user's Supabase access token as `Authorization: Bearer <token>`.
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Lazily share one lightweight client; getUser(token) is stateless per call.
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!token || token.length > 2048) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }
    if (!supabase) {
      console.error('[auth] SUPABASE_URL / SUPABASE_ANON_KEY not configured — cannot verify token');
      return res.status(500).json({ error: 'Auth not configured' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error('[auth] verification failed', err.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { requireAuth };
