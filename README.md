# yt-transcript

Fetch a YouTube video's transcript from the command line — clean text or SRT, **no API key, no cookies, no browser**.

```bash
node yt-transcript.mjs "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
# → the full transcript as plain text

node yt-transcript.mjs dQw4w9WgXcQ en --srt > captions.srt
# → a ready-to-save .srt file
```

Accepts watch URLs, `youtu.be` links, Shorts, live, embed URLs, or a bare 11-character video ID.

## How it works

It calls YouTube's internal player API to list the caption tracks, picks the best one for your language (human-made over auto-generated), and parses the timed text into clean text + SRT. No dependencies, ~150 lines, MIT licensed. Read [`src/transcript.js`](src/transcript.js) — the interesting part is the ANDROID → iOS → WEB client fallback that gets past the per-video "confirm you're not a bot" wall.

## Doing this in bulk?

This repo is the single-video core. If you need transcripts for **hundreds of videos or whole channels** — with rotating proxies, automatic retries, and failures that don't cost you anything — I run a hosted version on Apify that handles all of that:

- **[YouTube Transcript Scraper](https://apify.com/beacondata/youtube-transcript-scraper)** — a list of videos → text + segments + SRT
- **[YouTube Channel Transcript Scraper](https://apify.com/beacondata/youtube-channel-transcript-scraper)** — point it at a channel or playlist, it does the rest

Both are pay-per-transcript and charge nothing for videos that have no captions.

## License

MIT — do whatever you want with it.
