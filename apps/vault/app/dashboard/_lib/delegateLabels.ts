/**
 * Client-side label cache.
 * Labels are fetched from the DB via server actions and cached here
 * so synchronous reads in render still work (DelegateCard).
 */

let labelCache: Record<string, string> = {};

export function getDelegateLabel(delegatePda: string): string | null {
  return labelCache[delegatePda] ?? null;
}

export function setLabelCache(labels: Record<string, string>): void {
  labelCache = { ...labelCache, ...labels };
}

export function setSingleLabelCache(delegatePda: string, label: string): void {
  labelCache[delegatePda] = label;
}
