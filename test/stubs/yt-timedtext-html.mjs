// Player says there's an English track; the caption request returns an HTML interstitial.
globalThis.fetch = async (url) => String(url).includes('/player')
  ? Response.json({ playabilityStatus: { status: 'OK' }, videoDetails: { title: 't', author: 'a' }, captions: { playerCaptionsTracklistRenderer: { captionTracks: [{ languageCode: 'en', baseUrl: 'https://x.test/tt' }] } } })
  : new Response('<!doctype html><title>Before you continue to YouTube</title>');
