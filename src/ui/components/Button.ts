export function bindButton(id: string, handler: () => void): HTMLButtonElement | null {
  const el = document.getElementById(id) as HTMLButtonElement | null;
  if (el) el.addEventListener('click', (e) => { e.stopPropagation(); handler(); });
  return el;
}
