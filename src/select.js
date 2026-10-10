// Pick the best caption track for a language preference. kind === 'asr' means auto-generated.
export function selectTrack(tracks, language, preferManual) {
  if (!tracks?.length) return null;
  // Language tags are case-insensitive (BCP 47): "DE" matches "de-DE".
  const want = language.toLowerCase();
  const langMatch = (t) => {
    const have = t.languageCode.toLowerCase();
    return have === want || have.split('-')[0] === want.split('-')[0];
  };
  const manual = (t) => t.kind !== 'asr';
  const order = preferManual
    ? [(t) => manual(t) && langMatch(t), (t) => langMatch(t), manual]
    : [(t) => !manual(t) && langMatch(t), (t) => langMatch(t), (t) => !manual(t)];
  for (const pred of order) {
    const hit = tracks.find(pred);
    if (hit) return hit;
  }
  return tracks[0];
}
