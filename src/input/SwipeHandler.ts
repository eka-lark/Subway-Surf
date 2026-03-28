import { INPUT } from '@core/Constants';
import type { GameAction } from './KeyboardHandler';

export class SwipeHandler {
  private onAction: (action: GameAction) => void;
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;

  constructor(onAction: (action: GameAction) => void) {
    this.onAction = onAction;
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
  }

  enable(): void {
    window.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    window.addEventListener('touchend', this.boundTouchEnd, { passive: false });
  }

  disable(): void {
    window.removeEventListener('touchstart', this.boundTouchStart);
    window.removeEventListener('touchend', this.boundTouchEnd);
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = performance.now();
  }

  private handleTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;
    const elapsed = performance.now() - this.startTime;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < INPUT.MIN_SWIPE_DISTANCE && elapsed < INPUT.MAX_SWIPE_TIME) {
      this.onAction('hoverboard');
      return;
    }
    if (distance < INPUT.MIN_SWIPE_DISTANCE) return;
    if (elapsed > INPUT.MAX_SWIPE_TIME) return;

    const angle = Math.atan2(-dy, dx) * (180 / Math.PI);
    const dz = INPUT.DEAD_ZONE_ANGLE;

    if (angle > -dz && angle < dz) this.onAction('right');
    else if (angle > 90 - dz && angle < 90 + dz) this.onAction('jump');
    else if (angle > 180 - dz || angle < -180 + dz) this.onAction('left');
    else if (angle > -90 - dz && angle < -90 + dz) this.onAction('slide');
  }
}
