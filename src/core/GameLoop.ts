import { GAME } from './Constants';

export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = () => void;

export class GameLoop {
  private lastTime = 0;
  private running = false;
  private rafId = 0;
  private updateFn: UpdateCallback;
  private renderFn: RenderCallback;

  constructor(updateFn: UpdateCallback, renderFn: RenderCallback) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.tick = this.tick.bind(this);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = 0; }
  }

  private tick(currentTime: number): void {
    if (!this.running) return;
    const rawDelta = (currentTime - this.lastTime) / 1000;
    const deltaTime = Math.min(rawDelta, GAME.MAX_DELTA_TIME);
    this.lastTime = currentTime;
    this.updateFn(deltaTime);
    this.renderFn();
    this.rafId = requestAnimationFrame(this.tick);
  }
}
