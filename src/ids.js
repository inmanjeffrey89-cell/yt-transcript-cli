// Extract an 11-char YouTube video id from a URL or bare id; null if none.
const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function parseVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim();
  if (ID_RE.test(s)) return s;
  let u;
  try { u = new URL(s.includes('://') ? s : 'https://' + s); } catch { return null; }
  const host = u.hostname.replace(/^(www|m)\./, '');
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0];
    return ID_RE.test(id) ? id : null;
  }
  const nocookie = host === 'youtube-nocookie.com';
  if (!nocookie && host !== 'youtube.com' && !host.endsWith('.youtube.com')) return null;
  const v = u.searchParams.get('v');
  if (v && ID_RE.test(v)) return v;
  const m = u.pathname.match(/^\/(?:shorts|live|embed|v)\/([A-Za-z0-9_-]{11})(?:[/?]|$)/);
  return m ? m[1] : null;
}
