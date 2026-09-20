// Lightweight product analytics wrapper around PostHog.
//
// Fully gated on REACT_APP_POSTHOG_KEY: with no key set, every function here is a
// no-op, so the app runs identically in dev / preview / before you configure it.
// Configured privacy-first (no session recording, no autocapture, profiles only for
// identified users) because our audience is mostly minors — we send explicit funnel
// events and a pageview, nothing more.
//
// To enable: set REACT_APP_POSTHOG_KEY (and optionally REACT_APP_POSTHOG_HOST) in
// Vercel env vars, create a free PostHog project, then redeploy.
import posthog from 'posthog-js';

const KEY  = process.env.REACT_APP_POSTHOG_KEY;
const HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

let enabled = false;

export function initAnalytics() {
  if (enabled || !KEY || typeof window === 'undefined') return;
  try {
    posthog.init(KEY, {
      api_host: HOST,
      capture_pageview: true,
      autocapture: false,
      disable_session_recording: true,
      person_profiles: 'identified_only',
    });
    enabled = true;
  } catch (_) { /* never let analytics break the app */ }
}

export function identify(userId, props) {
  if (!enabled || !userId) return;
  try { posthog.identify(userId, props); } catch (_) {}
}

export function track(event, props) {
  if (!enabled) return;
  try { posthog.capture(event, props); } catch (_) {}
}

export function resetAnalytics() {
  if (!enabled) return;
  try { posthog.reset(); } catch (_) {}
}
