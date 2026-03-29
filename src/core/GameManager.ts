import { gsap } from 'gsap';
import { GAME, ECONOMY } from './Constants';
import { StateMachine } from './StateMachine';
import { eventBus } from './EventBus';
import { GameLoop } from './GameLoop';
import { createSceneContext, type SceneContext } from '@rendering/SceneSetup';
import { CameraController } from '@rendering/CameraController';
import { VFXManager } from '@rendering/VFXManager';
import { InputManager } from '@input/InputManager';
import { PlayerController } from '@player/PlayerController';
import { PoliceChaser } from '@player/PoliceChaser';
import { TrackGenerator } from '@track/TrackGenerator';
import { ObstacleManager } from '@obstacles/ObstacleManager';
import { CoinManager } from '@collectibles/CoinManager';
import { PowerUpManager } from '@powerups/PowerUpManager';
import { WalletManager } from '@economy/WalletManager';
import { ShopManager } from '@economy/ShopManager';
import { ScoreManager } from '@scoring/ScoreManager';
import { MultiplierTracker } from '@scoring/MultiplierTracker';
import { MissionManager } from '@missions/MissionManager';
import { AchievementTracker } from '@missions/AchievementTracker';
import { CharacterManager } from '@characters/CharacterManager';
import { AudioManager } from '@audio/AudioManager';
import { SaveManager } from '@persistence/SaveManager';
import { UIManager } from '@ui/UIManager';
import { LoadingScreen } from '@ui/screens/LoadingScreen';
import { MainMenuScreen } from '@ui/screens/MainMenuScreen';
import { GameplayHUD } from '@ui/screens/GameplayHUD';
import { PauseScreen } from '@ui/screens/PauseScreen';
import { GameOverScreen } from '@ui/screens/GameOverScreen';
import { ShopScreen } from '@ui/screens/ShopScreen';
import { MissionsScreen } from '@ui/screens/MissionsScreen';
import { clamp } from '@utils/MathUtils';
import type { GameAction } from '@input/KeyboardHandler';

type GameState = 'loading' | 'menu' | 'countdown' | 'playing' | 'paused' | 'crash' | 'revive' | 'gameover';

export class GameManager {
  private ctx!: SceneContext;
  private gameLoop!: GameLoop;
  private state!: StateMachine<GameState>;
  private input!: InputManager;
  private camera!: CameraController;

  private player!: PlayerController;
  private policeChaser!: PoliceChaser;
  private track!: TrackGenerator;
  private obstacles!: ObstacleManager;
  private coins!: CoinManager;
  private powerUps!: PowerUpManager;
  private vfx!: VFXManager;

  private wallet!: WalletManager;
  private shop!: ShopManager;
  private score!: ScoreManager;
  private multiplier!: MultiplierTracker;
  private missions!: MissionManager;
  private achievements!: AchievementTracker;
  private characters!: CharacterManager;
  private audio!: AudioManager;

  private ui!: UIManager;
  private loadingScreen!: LoadingScreen;
  private menuScreen!: MainMenuScreen;
  private hud!: GameplayHUD;
  private pauseScreen!: PauseScreen;
  private gameOverScreen!: GameOverScreen;
  private shopScreen!: ShopScreen;
  private missionsScreen!: MissionsScreen;

  private currentSpeed: number = GAME.BASE_SPEED;
  private reviveCount = 0;
  private reviveTimer = 0;
  private reviveInterval: ReturnType<typeof setInterval> | null = null;
  private runStats = { jumps: 0, slides: 0, powerUpsUsed: 0, obstaclesDodged: 0 };

  async init(): Promise<void> {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas not found');

    this.loadingScreen = new LoadingScreen();
    this.loadingScreen.setProgress(0);
    this.loadingScreen.setText('Initializing...');

    this.ctx = createSceneContext(canvas);
    this.loadingScreen.setProgress(0.2);

    this.camera = new CameraController(this.ctx.camera);
    this.loadingScreen.setProgress(0.3);

    this.input = new InputManager();
    this.player = new PlayerController();
    this.policeChaser = new PoliceChaser();
    this.track = new TrackGenerator(this.ctx.scene);
    this.obstacles = new ObstacleManager(this.ctx.scene);
    this.coins = new CoinManager(this.ctx.scene);
    this.vfx = new VFXManager(this.ctx.scene);

    const saveData = SaveManager.load();
    this.powerUps = new PowerUpManager(this.ctx.scene, saveData.powerUpLevels);
    this.loadingScreen.setProgress(0.5);

    this.wallet = new WalletManager();
    this.score = new ScoreManager();
    this.multiplier = new MultiplierTracker();
    this.missions = new MissionManager();
    this.achievements = new AchievementTracker();
    this.characters = new CharacterManager();
    this.audio = new AudioManager();
    this.shop = new ShopManager(this.wallet, this.characters);
    this.loadingScreen.setProgress(0.7);

    this.state = new StateMachine<GameState>('loading', {
      loading: ['menu'],
      menu: ['countdown'],
      countdown: ['playing'],
      playing: ['paused', 'crash'],
      paused: ['playing', 'menu'],
      crash: ['revive', 'gameover'],
      revive: ['playing', 'gameover'],
      gameover: ['menu', 'countdown'],
    });

    this.ui = new UIManager();
    this.menuScreen = new MainMenuScreen();
    this.hud = new GameplayHUD();
    this.pauseScreen = new PauseScreen();
    this.gameOverScreen = new GameOverScreen();
    this.shopScreen = new ShopScreen();
    this.missionsScreen = new MissionsScreen();

    this.initUI();
    this.initEvents();
    this.loadingScreen.setProgress(0.9);

    this.ctx.scene.add(this.player.model.group);
    this.ctx.scene.add(this.policeChaser.group);

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );

    const initAudio = () => {
      this.audio.init();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);

    this.loadingScreen.setProgress(1.0);
    this.loadingScreen.setText('Ready!');

    setTimeout(() => this.goToMenu(), 500);
    this.gameLoop.start();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state.is('playing')) this.pauseGame();
    });
  }

  private initUI(): void {
    this.menuScreen.init({ onPlay: () => this.startRun(), onShop: () => this.openShop(), onMissions: () => this.openMissions() });
    this.hud.init({ onPause: () => this.pauseGame() });
    this.pauseScreen.init({ onResume: () => this.resumeGame(), onMenu: () => this.goToMenu() });
    this.gameOverScreen.init({ onMenu: () => this.goToMenu(), onRestart: () => this.startRun() });
    this.shopScreen.init({ onClose: () => this.closeShop(), onPurchase: (id) => this.purchaseCharacter(id), onEquip: (id) => this.equipCharacter(id) });
    this.missionsScreen.init({ onClose: () => this.closeMissions() });

    const reviveBtn = document.getElementById('btn-revive');
    const noReviveBtn = document.getElementById('btn-no-revive');
    if (reviveBtn) reviveBtn.addEventListener('click', () => this.doRevive());
    if (noReviveBtn) noReviveBtn.addEventListener('click', () => this.declineRevive());
  }

  private initEvents(): void {
    eventBus.on('input:pause', () => {
      if (this.state.is('playing')) this.pauseGame();
      else if (this.state.is('paused')) this.resumeGame();
    });
    eventBus.on('player:jump', () => { this.runStats.jumps++; this.audio.playSFX('jump'); });
    eventBus.on('player:slide', () => { this.runStats.slides++; this.audio.playSFX('slide'); });
    eventBus.on('player:crash', () => { this.audio.playSFX('crash'); this.vfx.spawnCrash(this.player.x, this.player.y + 0.9, this.player.z); });
    eventBus.on('coin:collected', () => { this.audio.playSFX('coin'); });
    eventBus.on('powerup:pickup', () => { this.audio.playSFX('powerup'); this.runStats.powerUpsUsed++; });
    eventBus.on('achievement:unlocked', () => { this.audio.playSFX('achievement'); });
  }

  private goToMenu(): void {
    this.state.transition('menu');
    this.ui.hideAll();
    this.ui.show('screen-menu');
    this.input.disable();
    this.audio.stopMusic();
    this.audio.startMenuMusic();
    this.missions.ensureMissions();
    this.menuScreen.update({ coins: this.wallet.coins, keys: this.wallet.keys, highScore: this.score.highScore });
    this.resetGameplay();
    this.track.init();
    this.camera.reset(0);
  }

  private startRun(): void {
    this.state.transition('countdown');
    this.resetGameplay();
    this.track.init();
    this.camera.reset(0);
    this.ui.hideAll();
    this.ui.show('screen-hud');
    this.hud.updateScore(0);
    this.hud.updateCoins(0);
    this.hud.updateMultiplier(this.multiplier.level);
    this.hud.hidePowerUp();
    this.doCountdown().then(() => {
      this.state.transition('playing');
      this.input.enable();
      this.audio.startMusic();
      this.policeChaser.startChase(this.player.z);
    });
  }

  private async doCountdown(): Promise<void> {
    const overlay = document.getElementById('countdown-overlay')!;
    const text = document.getElementById('countdown-text')!;
    overlay.style.display = 'flex';
    for (const label of ['3', '2', '1', 'GO!']) {
      text.textContent = label;
      text.style.opacity = '0';
      text.style.transform = 'scale(2)';
      await new Promise<void>(resolve => {
        gsap.to(text, { opacity: 1, scale: 1, duration: 0.3, onComplete: () => {
          gsap.to(text, { opacity: 0, scale: 0.5, duration: 0.4, delay: 0.2, onComplete: resolve });
        }});
      });
    }
    overlay.style.display = 'none';
  }

  private pauseGame(): void {
    if (!this.state.transition('paused')) return;
    this.input.disable();
    this.ui.showOverlay('screen-pause');
  }

  private resumeGame(): void {
    if (!this.state.transition('playing')) return;
    this.ui.hide('screen-pause');
    this.input.enable();
  }

  private handleCrash(): void {
    if (!this.state.transition('crash')) return;
    this.input.disable();
    this.input.flush();

    // Police rushes to catch the runner — when caught, show revive or game over
    this.policeChaser.onPlayerCrash(() => {
      // Police has caught the runner!
      if (this.reviveCount < ECONOMY.MAX_REVIVES_PER_RUN) {
        this.showRevivePrompt();
      } else {
        this.endRun();
      }
    });
  }

  private showRevivePrompt(): void {
    this.state.transition('revive');
    const cost = this.reviveCount === 0 ? ECONOMY.REVIVE_COST_1 : ECONOMY.REVIVE_COST_2;
    const costEl = document.getElementById('revive-cost');
    if (costEl) costEl.textContent = `Cost: ${cost} coins`;
    const timerEl = document.getElementById('revive-timer');
    this.reviveTimer = 5;
    if (timerEl) timerEl.textContent = '5';
    this.ui.showOverlay('screen-revive');
    this.reviveInterval = setInterval(() => {
      this.reviveTimer--;
      if (timerEl) timerEl.textContent = String(Math.max(0, Math.ceil(this.reviveTimer)));
      if (this.reviveTimer <= 0) {
        if (this.reviveInterval) clearInterval(this.reviveInterval);
        this.reviveInterval = null;
        if (this.state.is('revive')) this.declineRevive();
      }
    }, 1000);
  }

  private doRevive(): void {
    if (this.reviveInterval) { clearInterval(this.reviveInterval); this.reviveInterval = null; }
    const cost = this.reviveCount === 0 ? ECONOMY.REVIVE_COST_1 : ECONOMY.REVIVE_COST_2;
    if (!this.wallet.spendCoins(cost)) { this.declineRevive(); return; }
    this.reviveCount++;
    this.ui.hide('screen-revive');
    this.player.revive();
    this.policeChaser.onPlayerRevive();
    this.state.transition('playing');
    this.input.enable();
  }

  private declineRevive(): void {
    if (this.reviveInterval) { clearInterval(this.reviveInterval); this.reviveInterval = null; }
    this.ui.hide('screen-revive');
    this.endRun();
  }

  private endRun(): void {
    this.state.transition('gameover');
    this.input.disable();
    this.audio.stopMusic();
    this.score.finalizeRun();
    this.wallet.addCoins(this.score.coinsCollected);

    const data = SaveManager.load();
    data.statistics.totalCoinsCollected += this.score.coinsCollected;
    data.statistics.totalDistanceRun += this.score.distance;
    data.statistics.totalRuns++;
    data.statistics.totalJumps += this.runStats.jumps;
    data.statistics.totalSlides += this.runStats.slides;
    SaveManager.save(data);

    this.missions.setProgress('collect_coins', this.score.coinsCollected);
    this.missions.setProgress('run_distance', this.score.distance);
    this.missions.setProgress('jump_count', this.runStats.jumps);
    this.missions.trackProgress('use_powerup', this.runStats.powerUpsUsed);
    this.missions.setProgress('score_points', this.score.current);

    const stats = SaveManager.load().statistics;
    this.achievements.check({
      totalRuns: stats.totalRuns, totalCoinsCollected: stats.totalCoinsCollected,
      totalDistanceRun: stats.totalDistanceRun, highScore: this.score.highScore,
      singleRunDistance: this.score.distance,
    });

    if (this.missions.isSetComplete()) this.missions.advanceSet();

    this.wallet.persist();
    this.missions.persist();
    this.achievements.persist();

    this.ui.hideAll();
    this.ui.show('screen-gameover');
    this.gameOverScreen.update({
      score: this.score.current, highScore: this.score.highScore,
      isNewHighScore: this.score.isNewHighScore, coins: this.score.coinsCollected,
      distance: this.score.distance, missions: this.missions.activeMissions,
    });
  }

  private openShop(): void { this.ui.showOverlay('screen-shop'); this.refreshShop(); }
  private closeShop(): void { this.ui.hide('screen-shop'); }
  private purchaseCharacter(id: string): void {
    if (this.shop.purchase(id)) {
      this.audio.playSFX('click'); this.refreshShop();
      this.menuScreen.update({ coins: this.wallet.coins, keys: this.wallet.keys, highScore: this.score.highScore });
    }
  }
  private equipCharacter(id: string): void { this.shop.equipCharacter(id); this.audio.playSFX('click'); this.refreshShop(); }
  private refreshShop(): void { this.shopScreen.update(this.shop.getShopItems(), this.wallet.coins, this.wallet.keys); }
  private openMissions(): void { this.missions.ensureMissions(); this.ui.showOverlay('screen-missions'); this.missionsScreen.update(this.missions.activeMissions); }
  private closeMissions(): void { this.ui.hide('screen-missions'); }

  private resetGameplay(): void {
    this.player.reset(); this.track.reset(); this.obstacles.reset(); this.coins.reset();
    this.powerUps.reset(); this.vfx.reset(); this.score.reset();
    this.policeChaser.reset(this.player.z);
    this.currentSpeed = GAME.BASE_SPEED; this.reviveCount = 0;
    this.runStats = { jumps: 0, slides: 0, powerUpsUsed: 0, obstaclesDodged: 0 };
    if (this.reviveInterval) { clearInterval(this.reviveInterval); this.reviveInterval = null; }
  }

  private update(deltaTime: number): void {
    if (this.state.is('playing')) this.updateGameplay(deltaTime);
    this.vfx.update(deltaTime);
    if (this.state.is('playing') || this.state.is('countdown')) this.camera.update(this.player.z, deltaTime);
    // Always update police chaser during active gameplay states (so catch animation plays during crash)
    if (this.state.is('crash') || this.state.is('revive')) {
      this.policeChaser.update(deltaTime, this.player.x, this.player.y, this.player.z, 0);
    }
  }

  private updateGameplay(deltaTime: number): void {
    const action = this.input.dequeue();
    if (action) this.processAction(action);

    this.currentSpeed = clamp(GAME.BASE_SPEED + this.score.distance * GAME.ACCELERATION_RATE, GAME.BASE_SPEED, GAME.MAX_SPEED);

    const isFlying = this.powerUps.jetpackActive;

    // Apply jetpack flight to player
    if (isFlying && !this.player.isFlying) {
      this.player.setFlying(true, 4.5); // Fly above obstacles but stay visible
    } else if (!isFlying && this.player.isFlying) {
      this.player.setFlying(false, 0); // Land back down
    }

    this.player.update(deltaTime, this.currentSpeed);
    this.track.update(this.player.z);
    this.obstacles.update(this.player.z, this.currentSpeed, this.score.distance, deltaTime);
    this.coins.update(this.player.z, deltaTime, this.player.x, this.player.y);
    this.powerUps.update(this.player.z, this.score.distance, deltaTime);

    if (!this.player.isImmune && !isFlying) {
      const playerAABB = this.player.getAABB();
      const hitObs = this.obstacles.checkCollision(playerAABB);
      if (hitObs) { this.player.hit(); this.handleCrash(); return; }
      const coinsCollected = this.coins.checkCollisions(playerAABB);
      for (let i = 0; i < coinsCollected; i++) {
        this.score.addCoinScore(this.multiplier.level);
      }
      this.powerUps.checkCollisions(playerAABB);
    }

    if (this.powerUps.magnetRadius > 0) {
      const magnetCollected = this.coins.collectAllInRange(this.player.z, this.powerUps.magnetRadius);
      for (let i = 0; i < magnetCollected; i++) this.score.addCoinScore(this.multiplier.level);
    }

    if (isFlying) {
      const collected = this.coins.collectAllInRange(this.player.z, 10);
      for (let i = 0; i < collected; i++) this.score.addCoinScore(this.multiplier.level);
    }

    const distanceDelta = this.currentSpeed * deltaTime;
    this.score.addDistance(distanceDelta, this.multiplier.level);

    const activePU = this.powerUps.current;
    this.score.setActiveMultiplier(activePU?.active && activePU.id === 'multiplier' ? 2 : 1);

    this.policeChaser.update(deltaTime, this.player.x, this.player.y, this.player.z, this.currentSpeed);

    this.hud.updateScore(this.score.current);
    this.hud.updateCoins(this.score.coinsCollected);
    if (activePU?.active) this.hud.showPowerUp(activePU.id, activePU.progress);
    else this.hud.hidePowerUp();
  }

  private processAction(action: GameAction): void {
    switch (action) {
      case 'left': this.player.moveRight(); break;
      case 'right': this.player.moveLeft(); break;
      case 'jump': this.player.jump(); break;
      case 'slide': this.player.slide(); break;
    }
  }

  private render(): void { this.ctx.renderer.render(this.ctx.scene, this.ctx.camera); }
}
