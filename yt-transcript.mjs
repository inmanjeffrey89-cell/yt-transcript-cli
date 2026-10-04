#!/usr/bin/env node
// yt-transcript — fetch a YouTube transcript from the command line. No API key, no cookies.
import { parseVideoId } from './src/ids.js';
import { fetchTranscript } from './src/transcript.js';

const input = process.argv[2];
const lang = process.argv[3] || 'en';
const asSrt = process.argv.includes('--srt');
if (!input || input.startsWith('--')) { console.error('Usage: node yt-transcript.mjs <video-url-or-id> [lang] [--srt]'); process.exit(1); }
const id = parseVideoId(input);
if (!id) { console.error('Not a recognizable YouTube video URL or id.'); process.exit(1); }
try {
  const t = await fetchTranscript(id, { language: lang });
  process.stdout.write(asSrt ? t.srt : t.text + '\n');
} catch (e) {
  console.error(`No transcript: ${e.errorType || 'ERROR'} — ${e.message}`);
  process.exit(2);
}
