import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cli } from './cli.mjs';

const live = { skip: process.env.NET !== '1' && 'live network case (set NET=1)' };

test('--srt before or after the language is a flag, never the language', live, () => {
  for (const args of [['dQw4w9WgXcQ', '--srt'], ['dQw4w9WgXcQ', '--srt', 'en'], ['--srt', 'dQw4w9WgXcQ']]) {
    const r = cli(args);
    assert.equal(r.status, 0, `${args.join(' ')}: ${r.stderr}`);
    assert.match(r.stdout, /^1\n\d\d:\d\d:\d\d,\d{3} --> /, args.join(' '));
  }
});
