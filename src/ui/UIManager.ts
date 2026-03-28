import { gsap } from 'gsap';
import { UI } from '@core/Constants';

type ScreenId = 'screen-loading' | 'screen-menu' | 'screen-hud' | 'screen-pause'
  | 'screen-revive' | 'screen-gameover' | 'screen-shop' | 'screen-missions';

export class UIManager {
  private currentScreen: ScreenId | null = null;

  show(screenId: ScreenId): void {
    if (this.currentScreen && this.currentScreen !== screenId) this.hide(this.currentScreen);
    const el = document.getElementById(screenId);
    if (!el) return;
    el.classList.remove('hidden');
    el.style.display = 'flex';
    el.style.opacity = '0';
    gsap.to(el, { opacity: 1, duration: UI.TRANSITION_DURATION });
    this.currentScreen = screenId;
  }

  hide(screenId: ScreenId): void {
    const el = document.getElementById(screenId);
    if (!el) return;
    gsap.to(el, { opacity: 0, duration: UI.TRANSITION_DURATION, onComplete: () => { el.classList.add('hidden'); el.style.display = 'none'; } });
  }

  showOverlay(screenId: ScreenId): void {
    const el = document.getElementById(screenId);
    if (!el) return;
    el.classList.remove('hidden');
    el.style.display = 'flex';
    el.style.opacity = '0';
    gsap.to(el, { opacity: 1, duration: UI.TRANSITION_DURATION });
  }

  hideAll(): void {
    const screens: ScreenId[] = ['screen-loading', 'screen-menu', 'screen-hud', 'screen-pause', 'screen-revive', 'screen-gameover', 'screen-shop', 'screen-missions'];
    for (const id of screens) {
      const el = document.getElementById(id);
      if (el) { el.classList.add('hidden'); el.style.display = 'none'; el.style.opacity = '0'; }
    }
    this.currentScreen = null;
  }

  setText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  setDisplay(id: string, show: boolean): void {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
  }
}
