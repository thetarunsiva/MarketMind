/**
 * Utility for formatting large numbers into human-readable strings for metrics.
 * Example: 12400 -> 12.4K, 380000 -> 3.8L
 */
export function formatStat(value: number): string {
  if (value >= 100_000) {
    const lValue = value / 100_000;
    return `${lValue % 1 === 0 ? lValue : lValue.toFixed(1)}L`;
  }
  if (value >= 1_000) {
    const kValue = value / 1_000;
    return `${kValue % 1 === 0 ? kValue : kValue.toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Normalizes counts to a believable demo scale.
 */
export function scaleMetric(count: number, base: number = 1000): number {
  return (count * base) + Math.floor(Math.random() * 50);
}
