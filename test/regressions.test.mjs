import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cli } from './cli.mjs';
import { parseVideoId } from '../src/ids.js';
import { selectTrack } from '../src/select.js';

const live = { skip: process.env.NET !== '1' && 'live network case (set NET=1)' };

test('a bare id that starts with a dash is an id, not an option', () => {
  const r = cli(['-abcdefghij', '--json'], { preload: 'fetch-fail' });
  assert.equal(r.status, 2, r.stderr);
  assert.equal(JSON.parse(r.stderr).error.type, 'NETWORK');
});

test('privacy-enhanced embed links parse', () => {
  assert.equal(parseVideoId('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
});

test('language matching ignores case', () => {
  const tracks = [{ languageCode: 'en' }, { languageCode: 'de-DE' }];
  assert.equal(selectTrack(tracks, 'DE', true).languageCode, 'de-DE');
});

test('a second video id (or a pasted em-dash flag) is rejected as the language', () => {
  for (const lang of ['jNQXAC9IVRw', '—json']) {
    const r = cli(['dQw4w9WgXcQ', lang], { preload: 'fetch-fail' });
    assert.equal(r.status, 1, `${lang}: ${r.stderr}`);
    assert.match(r.stderr, /INVALID_INPUT/);
  }
});

test('an HTML caption response is an upstream failure (exit 2), not an empty transcript', () => {
  const r = cli(['dQw4w9WgXcQ', '--json'], { preload: 'yt-timedtext-html' });
  assert.equal(r.status, 2, r.stderr);
  assert.equal(JSON.parse(r.stderr).error.type, 'BAD_RESPONSE');
});

test('a missing language falls back with a note on stderr', live, () => {
  const r = cli(['dQw4w9WgXcQ', 'sw']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /no "sw" captions on this video; returned "en"/);
});
