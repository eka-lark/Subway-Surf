export interface PoolConfig {
  initial: number;
  max: number;
}

export class ObjectPool<T> {
  private pool: T[] = [];
  private active = new Set<T>();
  private factory: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(factory: () => T, resetFn: (obj: T) => void, config: PoolConfig) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.maxSize = config.max;
    for (let i = 0; i < config.initial; i++) {
      this.pool.push(this.factory());
    }
  }

  get available(): number { return this.pool.length; }
  get inUse(): number { return this.active.size; }

  get(): T | null {
    let obj: T;
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else if (this.active.size < this.maxSize) {
      obj = this.factory();
    } else {
      return null;
    }
    this.active.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (!this.active.has(obj)) return;
    this.active.delete(obj);
    this.resetFn(obj);
    this.pool.push(obj);
  }

  releaseAll(): void {
    for (const obj of this.active) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
    this.active.clear();
  }

  forEach(fn: (obj: T) => void): void {
    for (const obj of this.active) { fn(obj); }
  }
}
