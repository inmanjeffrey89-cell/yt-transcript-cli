// Pick the best caption track for a language preference. kind === 'asr' means auto-generated.
export function selectTrack(tracks, language, preferManual) {
  if (!tracks?.length) return null;
  const langMatch = (t) => t.languageCode === language || t.languageCode.split('-')[0] === language.split('-')[0];
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
