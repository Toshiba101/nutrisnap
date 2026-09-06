// Consecutive-day scan streak, Cal AI-style (see Phase 0 research) — counts
// backward from today (or yesterday, so a streak isn't lost just because
// today's meal hasn't been scanned yet) as long as each preceding day has
// at least one scan.
export function computeStreak(scanTimestamps: number[]): number {
  if (scanTimestamps.length === 0) return 0;

  const days = new Set(
    scanTimestamps.map((t) => {
      const d = new Date(t);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  let cursor = new Date();
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1); // allow "yesterday" as the streak anchor
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function scansToday(scanTimestamps: number[]): number {
  const today = new Date();
  return scanTimestamps.filter((t) => {
    const d = new Date(t);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;
}
