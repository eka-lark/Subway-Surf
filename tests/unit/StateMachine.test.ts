import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateMachine } from '@core/StateMachine';

describe('StateMachine', () => {
  let sm: StateMachine<string>;
  beforeEach(() => {
    sm = new StateMachine('idle', {
      idle: ['running', 'paused'],
      running: ['paused', 'dead'],
      paused: ['running', 'idle'],
      dead: ['idle'],
    });
  });

  it('starts in initial state', () => { expect(sm.current).toBe('idle'); });
  it('transitions to valid state', () => { expect(sm.transition('running')).toBe(true); expect(sm.current).toBe('running'); });
  it('rejects invalid transition', () => { expect(sm.transition('dead')).toBe(false); expect(sm.current).toBe('idle'); });
  it('calls onEnter callback', () => { const fn = vi.fn(); sm.onEnter('running', fn); sm.transition('running'); expect(fn).toHaveBeenCalledWith('idle'); });
  it('calls onExit callback', () => { const fn = vi.fn(); sm.onExit('idle', fn); sm.transition('running'); expect(fn).toHaveBeenCalledWith('running'); });
  it('calls onChange callback', () => { const fn = vi.fn(); sm.onChange(fn); sm.transition('running'); expect(fn).toHaveBeenCalledWith('running', 'idle'); });
  it('is() checks current state', () => { expect(sm.is('idle')).toBe(true); expect(sm.is('running')).toBe(false); });
  it('canTransitionTo() checks allowed transitions', () => { expect(sm.canTransitionTo('running')).toBe(true); expect(sm.canTransitionTo('dead')).toBe(false); });
});
