export interface CharacterConfig {
  id: string; name: string; description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCurrency: 'coins' | 'keys' | 'free';
  unlockCost: number; bodyColor: number; accentColor: number;
}

export const CHARACTERS: CharacterConfig[] = [
  { id: 'default', name: 'Runner', description: 'The classic runner', rarity: 'common', unlockCurrency: 'free', unlockCost: 0, bodyColor: 0x2196f3, accentColor: 0x1976d2 },
  { id: 'skater', name: 'Skater', description: 'Cool and collected', rarity: 'common', unlockCurrency: 'coins', unlockCost: 100, bodyColor: 0x4caf50, accentColor: 0x388e3c },
  { id: 'ninja', name: 'Ninja', description: 'Silent and swift', rarity: 'rare', unlockCurrency: 'coins', unlockCost: 200, bodyColor: 0x212121, accentColor: 0xf44336 },
];
