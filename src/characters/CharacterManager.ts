import { SaveManager } from '@persistence/SaveManager';
import { CHARACTERS, type CharacterConfig } from './CharacterData';
import { eventBus } from '@core/EventBus';

export class CharacterManager {
  private unlocked: Set<string>;
  private _equipped: string;

  constructor() {
    const data = SaveManager.load();
    this.unlocked = new Set(data.characters.unlocked);
    this._equipped = data.characters.equipped;
  }

  get equippedId(): string { return this._equipped; }
  get equippedConfig(): CharacterConfig { return CHARACTERS.find(c => c.id === this._equipped) ?? CHARACTERS[0]; }
  get allCharacters(): CharacterConfig[] { return CHARACTERS; }

  isUnlocked(id: string): boolean { return this.unlocked.has(id); }

  unlock(id: string): void { this.unlocked.add(id); eventBus.emit('character:unlocked', { id }); }

  equip(id: string): void {
    if (!this.unlocked.has(id)) return;
    this._equipped = id;
    eventBus.emit('character:equipped', { id });
  }

  persist(): void {
    const data = SaveManager.load();
    data.characters.unlocked = [...this.unlocked];
    data.characters.equipped = this._equipped;
    SaveManager.save(data);
  }
}
