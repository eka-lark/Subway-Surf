import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '@core/EventBus';

describe('EventBus', () => {
  let bus: EventBus;
  beforeEach(() => { bus = new EventBus(); });

  it('calls listener when event is emitted', () => {
    const fn = vi.fn();
    bus.on('test', fn);
    bus.emit('test', { value: 42 });
    expect(fn).toHaveBeenCalledWith({ value: 42 });
  });

  it('supports multiple listeners on same event', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    bus.on('test', fn1);
    bus.on('test', fn2);
    bus.emit('test', null);
    expect(fn1).toHaveBeenCalledOnce();
    expect(fn2).toHaveBeenCalledOnce();
  });

  it('removes listener with off()', () => {
    const fn = vi.fn();
    bus.on('test', fn);
    bus.off('test', fn);
    bus.emit('test', null);
    expect(fn).not.toHaveBeenCalled();
  });

  it('once() fires only once', () => {
    const fn = vi.fn();
    bus.once('test', fn);
    bus.emit('test', null);
    bus.emit('test', null);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('does not throw when emitting event with no listeners', () => {
    expect(() => bus.emit('nonexistent', null)).not.toThrow();
  });

  it('clear() removes all listeners', () => {
    const fn = vi.fn();
    bus.on('a', fn);
    bus.on('b', fn);
    bus.clear();
    bus.emit('a', null);
    bus.emit('b', null);
    expect(fn).not.toHaveBeenCalled();
  });
});
