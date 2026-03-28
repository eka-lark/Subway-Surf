export type GameAction = 'left' | 'right' | 'jump' | 'slide' | 'pause' | 'hoverboard';

const KEY_MAP: Record<string, GameAction> = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
  ArrowDown: 'slide', KeyS: 'slide',
  Escape: 'pause', KeyP: 'pause',
  Enter: 'hoverboard',
};

export class KeyboardHandler {
  private onAction: (action: GameAction) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(onAction: (action: GameAction) => void) {
    this.onAction = onAction;
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  enable(): void { window.addEventListener('keydown', this.boundKeyDown); }
  disable(): void { window.removeEventListener('keydown', this.boundKeyDown); }

  private handleKeyDown(e: KeyboardEvent): void {
    const action = KEY_MAP[e.code];
    if (action) { e.preventDefault(); this.onAction(action); }
  }
}
