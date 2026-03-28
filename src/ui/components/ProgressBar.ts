export function setProgressBar(barId: string, progress: number): void {
  const el = document.getElementById(barId);
  if (el) el.style.width = `${Math.max(0, Math.min(100, progress * 100))}%`;
}
