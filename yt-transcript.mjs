#!/usr/bin/env node
// yt-transcript — fetch a YouTube transcript from the command line. No API key, no cookies.
import { run, CliError } from './src/cli.js';
import { parseVideoId } from './src/ids.js';
import { fetchTranscript } from './src/transcript.js';

const usage = `Usage: yt-transcript <video-url-or-id> [lang] [--srt] [--json]

  lang    preferred caption language, e.g. en, es, pt-BR (default: en); if the video has no
          track in it, the best available track is returned and stderr says so
  --srt   print SRT subtitles instead of plain text
  --json  print one JSON envelope (text, segments and srt included)

Exit: 0 ok · 1 bad input · 2 YouTube request failed · 3 no transcript for this video
Ids that start with a dash work as-is; put -- before anything else dash-shaped.`;

run({
  tool: 'yt-transcript',
  usage,
  flags: ['--srt'],
  positionals: 2,
  async main(args) {
    const [ref, language = 'en'] = args.positional;
    if (!ref) throw new CliError('USAGE', 'missing <video-url-or-id>');
    const videoId = parseVideoId(ref);
    if (!videoId) throw new CliError('INVALID_INPUT', `not a YouTube video URL or id: ${ref}`);
    if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(language)) throw new CliError('INVALID_INPUT', `not a language code: "${language}" (e.g. en, es, pt-BR)`);
    const t = await fetchTranscript(videoId, { language });
    if (!t.text?.trim()) throw new CliError('EMPTY_TRANSCRIPT', 'the caption track is empty');
    const base = (code) => code.toLowerCase().split('-')[0];
    const substituted = base(t.language) !== base(language);
    return {
      input: { videoId, language },
      results: [t],
      note: substituted ? `no "${language}" captions on this video; returned "${t.language}" (available: ${t.availableLanguages.join(', ')})` : undefined,
      human: () => (args.has('--srt') ? t.srt : t.text + '\n'),
    };
  },
});
