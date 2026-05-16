// Generates 2-3 sentence plain-language narrative connecting overlay entries to domain history.

export function generateNarrative(domain, events, overlayEntries) {
  if (!overlayEntries || overlayEntries.length === 0) {
    return `Add ${
      domain.default_overlay_label?.toLowerCase() || 'overlay'
    } entries to generate a personalized narrative connecting your story to this domain's history.`;
  }

  const sorted = [...overlayEntries].sort((a, b) => a.date - b.date);
  const firstEntry = sorted[0];
  const lastEntry = sorted[sorted.length - 1];

  const spanStart = firstEntry.date;
  const spanEnd = lastEntry.date;

  const eventsInSpan = events.filter(
    (e) => e.date >= spanStart && e.date <= spanEnd
  );

  const expandsCount = eventsInSpan.filter((e) => e.direction === 'expands').length;
  const restrictsCount = eventsInSpan.filter((e) => e.direction === 'restricts').length;

  if (domain.id === 'financial-markets') {
    const firstTitle = firstEntry.title;
    const entryNoun = sorted.length === 1 ? 'milestone' : `${sorted.length} milestones`;

    let sentence1 = `From ${spanStart} to ${spanEnd}, this overlay captures ${entryNoun} across ${spanEnd - spanStart} years of market history.`;
    let sentence2 =
      eventsInSpan.length > 0
        ? `During this span, markets experienced ${expandsCount} major expansion${expandsCount !== 1 ? 's' : ''} and ${restrictsCount} significant contraction${restrictsCount !== 1 ? 's' : ''}.`
        : `No major market events are recorded during this exact span.`;

    const highMag = eventsInSpan
      .filter((e) => e.magnitude >= 8)
      .sort((a, b) => b.magnitude - a.magnitude)[0];
    let sentence3 = highMag
      ? `The most impactful event in range was the ${highMag.title} (${highMag.date}), a magnitude-${highMag.magnitude} ${domain.direction_labels[highMag.direction]?.toLowerCase() || 'event'}.`
      : '';

    return [sentence1, sentence2, sentence3].filter(Boolean).join(' ');
  }

  if (domain.id === 'voting-rights') {
    const entryNoun = sorted.length === 1 ? 'community milestone' : `${sorted.length} community milestones`;
    let sentence1 = `From ${spanStart} to ${spanEnd}, this overlay places ${entryNoun} against ${eventsInSpan.length} recorded voting rights decision${eventsInSpan.length !== 1 ? 's' : ''}.`;

    let sentence2 =
      eventsInSpan.length > 0
        ? `In that window, ${expandsCount} decision${expandsCount !== 1 ? 's' : ''} expanded voting access and ${restrictsCount} restricted it.`
        : '';

    const highMag = eventsInSpan
      .filter((e) => e.magnitude >= 9)
      .sort((a, b) => b.magnitude - a.magnitude)[0];
    let sentence3 = highMag
      ? `The ${highMag.title} (${highMag.date}) stands as a magnitude-${highMag.magnitude} event that ${highMag.direction === 'expands' ? 'expanded' : 'restricted'} access.`
      : '';

    return [sentence1, sentence2, sentence3].filter(Boolean).join(' ');
  }

  // Generic fallback
  const entryNoun = sorted.length === 1 ? 'entry' : `${sorted.length} entries`;
  return `This overlay contains ${entryNoun} spanning ${spanStart} to ${spanEnd}, alongside ${eventsInSpan.length} domain event${eventsInSpan.length !== 1 ? 's' : ''} in that range.`;
}
