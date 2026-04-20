import { GameManager } from '@core/GameManager';

const game = new GameManager();
game.init().catch(err => {
  console.error('Failed to initialize game:', err);
});
// test sonarqube
