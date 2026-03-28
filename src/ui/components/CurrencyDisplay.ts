import { formatNumber } from '@utils/MathUtils';

export function updateCurrencyDisplay(elementId: string, emoji: string, amount: number): void {
  const el = document.getElementById(elementId);
  if (el) el.textContent = `${emoji} ${formatNumber(amount)}`;
}
