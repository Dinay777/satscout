// Optional Supabase auth guard for /api/chat.
//
// Disabled by default — server.js only wires this in when REQUIRE_AUTH === 'true'.
// Requires SUPABASE_URL and SUPABASE_ANON_KEY in the backend env. The frontend
// must send the user's Supabase access token as `Authorization: Bearer <token>`.
//
// Uses fetch directly against Supabase /auth/v1/user (same as supabase.auth.getUser)
// to avoid createClient's realtime WebSocket initialization, which crashes Node < 22.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!token || token.length > 2048) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[auth] SUPABASE_URL / SUPABASE_ANON_KEY not configured — cannot verify token');
      return res.status(500).json({ error: 'Auth not configured' });
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey,
      },
    });

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await response.json();
    if (!user?.id) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[auth] verification failed', err.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { requireAuth };
