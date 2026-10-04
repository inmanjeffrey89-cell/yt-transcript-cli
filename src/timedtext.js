// Parse YouTube timedtext XML (format 3 <p t d> or legacy <text start dur>) into segments.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/g, (m, name) => ENTITIES[name] ?? m);
}

function cleanText(inner) {
  return decodeEntities(inner.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

export function parseTimedtext(xml) {
  const segs = [];
  for (const m of xml.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)) {
    const t = /\bt="([\d.]+)"/.exec(m[1]);
    const d = /\bd="([\d.]+)"/.exec(m[1]);
    const text = cleanText(m[2]);
    if (!t || !text) continue;
    segs.push({ start: Number(t[1]) / 1000, dur: d ? Number(d[1]) / 1000 : 0, text });
  }
  if (segs.length) return segs;
  for (const m of xml.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const t = /\bstart="([\d.]+)"/.exec(m[1]);
    const d = /\bdur="([\d.]+)"/.exec(m[1]);
    const text = cleanText(m[2]);
    if (!t || !text) continue;
    segs.push({ start: Number(t[1]), dur: d ? Number(d[1]) : 0, text });
  }
  return segs;
}

export function toText(segs) {
  return segs.map((s) => s.text).join(' ');
}

function stamp(sec) {
  const ms = Math.round(sec * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, '0')}`;
}

export function toSrt(segs) {
  return segs.map((s, i) => `${i + 1}\n${stamp(s.start)} --> ${stamp(s.start + s.dur)}\n${s.text}\n`).join('\n');
}
