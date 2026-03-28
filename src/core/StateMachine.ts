export class StateMachine<S extends string> {
  private _current: S;
  private transitions: Record<string, S[]>;
  private enterCallbacks = new Map<S, ((from: S) => void)[]>();
  private exitCallbacks = new Map<S, ((to: S) => void)[]>();
  private changeCallbacks: ((to: S, from: S) => void)[] = [];

  constructor(initial: S, transitions: Record<string, S[]>) {
    this._current = initial;
    this.transitions = transitions;
  }

  get current(): S { return this._current; }

  is(state: S): boolean { return this._current === state; }

  canTransitionTo(state: S): boolean {
    const allowed = this.transitions[this._current];
    return allowed ? allowed.includes(state) : false;
  }

  transition(to: S): boolean {
    if (!this.canTransitionTo(to)) return false;
    const from = this._current;
    const exitCbs = this.exitCallbacks.get(from);
    if (exitCbs) exitCbs.forEach(cb => cb(to));
    this._current = to;
    const enterCbs = this.enterCallbacks.get(to);
    if (enterCbs) enterCbs.forEach(cb => cb(from));
    this.changeCallbacks.forEach(cb => cb(to, from));
    return true;
  }

  onEnter(state: S, callback: (from: S) => void): void {
    if (!this.enterCallbacks.has(state)) this.enterCallbacks.set(state, []);
    this.enterCallbacks.get(state)!.push(callback);
  }

  onExit(state: S, callback: (to: S) => void): void {
    if (!this.exitCallbacks.has(state)) this.exitCallbacks.set(state, []);
    this.exitCallbacks.get(state)!.push(callback);
  }

  onChange(callback: (to: S, from: S) => void): void {
    this.changeCallbacks.push(callback);
  }
}
