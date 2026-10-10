# yt-transcript

Fetch a YouTube video's transcript from the command line: clean text, SRT, or JSON with timestamped segments. **No API key, no cookies, no browser.**

```bash
npx yt-transcript-cli "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
# → the full transcript as plain text

npx yt-transcript-cli dQw4w9WgXcQ es --srt > captions.srt
# → Spanish captions as a ready-to-save .srt file

npx yt-transcript-cli dQw4w9WgXcQ --json | jq '.results[0].segments[:3]'
# → timestamped segments, title, channel, language, available tracks
```

Accepts watch URLs, `youtu.be` links, Shorts, live, embed URLs, or a bare 11-character video ID. Args: `<video-url-or-id>` `[lang]` `[--srt]` `[--json]`.

## How it works

It calls YouTube's internal player API to list the caption tracks, picks the best one for your language (human-made over auto-generated), and parses the timed text into clean text + SRT. No dependencies, MIT. The interesting part is in [`src/transcript.js`](src/transcript.js): the ANDROID → iOS → WEB client fallback that gets past the per-video "confirm you're not a bot" wall.

## Output contract

Identical across every tool in this family, so they chain cleanly from shell scripts and AI agents:

- **stdout** is data only: the plain format above, or one JSON envelope with `--json`
- **stderr** is diagnostics only: errors, warnings, summaries
- **exit codes**

| code | meaning |
|---|---|
| `0` | complete |
| `1` | usage error or invalid input |
| `2` | the upstream source failed. If some results arrived first they're still on stdout, and the envelope says `"complete": false` |
| `3` | the source answered, but had no data for this input |

With `--json`, success is one line on stdout:

```json
{"tool":"yt-transcript","version":"2.0.0","input":{...},"complete":true,"count":42,"results":[...]}
```

and a failure is one line on stderr:

```json
{"tool":"yt-transcript","version":"2.0.0","exitCode":2,"error":{"type":"BLOCKED","message":"HTTP 429","retryable":true}}
```

Branch on the exit code; log `error.type`: `USAGE`, `INVALID_INPUT` and `INVALID_REQUEST` (the source rejected the input) exit `1`; `NETWORK`, `BLOCKED` and `BAD_RESPONSE` (a captcha or consent page instead of data) exit `2` with `retryable` set; `NOT_FOUND` and `NO_DATA` exit `3`.

`--json --help` prints `{"tool","version","usage"}`. `--` ends option parsing, for inputs that start with a dash. Extra arguments are an error rather than silently dropped, so quote inputs that contain spaces.

## Doing this in bulk?

This repo is the single-video core. For **hundreds of videos or whole channels**, with rotating proxies, retries, and nothing charged for videos without captions, I run hosted versions on Apify:

- **[YouTube Transcript Scraper](https://apify.com/beacondata/youtube-transcript-scraper)**: a list of videos → text + segments + SRT
- **[YouTube Channel Transcript Scraper](https://apify.com/beacondata/youtube-channel-transcript-scraper)**: point it at a channel or playlist

Ready-made n8n workflows that use them (channel → Google Sheets, video → AI summary by email): [n8n workflows](https://inmanjeffrey89-cell.github.io/data-tools/n8n-workflows).

## The family

Five no-key data CLIs, one output contract:
[yt-transcript-cli](https://github.com/inmanjeffrey89-cell/yt-transcript-cli) ·
[keyword-ideas-cli](https://github.com/inmanjeffrey89-cell/keyword-ideas-cli) ·
[gtrends-cli](https://github.com/inmanjeffrey89-cell/gtrends-cli) ·
[play-reviews-cli](https://github.com/inmanjeffrey89-cell/play-reviews-cli) ·
[app-store-reviews-cli](https://github.com/inmanjeffrey89-cell/app-store-reviews-cli)

## Changelog

**2.0.0** — shared output contract across the family: data on stdout, diagnostics on stderr, exit codes `0/1/2/3`, and a `--json` envelope. Breaking: "no data" now exits `3` (was `2`), and network failures are reported instead of being swallowed. `ID --srt` no longer reads `--srt` as the language; language codes are case-insensitive and a fallback to another language is reported on stderr; `youtube-nocookie.com` embeds parse. Thanks to u/Tariq9977 on r/SideProject for the suggestion.

## License

MIT
