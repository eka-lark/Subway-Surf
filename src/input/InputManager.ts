import { INPUT } from '@core/Constants';
import { KeyboardHandler, type GameAction } from './KeyboardHandler';
import { SwipeHandler } from './SwipeHandler';
import { eventBus } from '@core/EventBus';

export class InputManager {
  private keyboard: KeyboardHandler;
  private swipe: SwipeHandler;
  private buffer: GameAction[] = [];
  private enabled = false;

  constructor() {
    const onAction = (action: GameAction) => this.enqueue(action);
    this.keyboard = new KeyboardHandler(onAction);
    this.swipe = new SwipeHandler(onAction);
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.keyboard.enable();
    this.swipe.enable();
  }

  disable(): void {
    this.enabled = false;
    this.keyboard.disable();
    this.swipe.disable();
  }

  private enqueue(action: GameAction): void {
    if (action === 'pause') { eventBus.emit('input:pause', null); return; }
    if (action === 'hoverboard') { eventBus.emit('input:hoverboard', null); return; }
    if (this.buffer.length >= INPUT.BUFFER_SIZE) this.buffer.shift();
    this.buffer.push(action);
  }

  dequeue(): GameAction | null { return this.buffer.shift() ?? null; }
  flush(): void { this.buffer.length = 0; }
}
