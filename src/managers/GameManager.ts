import { type Application, Container, Graphics, Text, Assets, type Texture } from 'pixi.js';
import gsap from 'gsap';
import Matter from 'matter-js';
import { Character } from '../components/Character';
import { Coin } from '../components/Coin';
import { Balloon } from '../components/Balloon';
import { SmallCloud } from '../components/SmallCloud';
import type { Camera } from '../components/Camera';
import { GameOverScreen } from '../components/ui/GameOverScreen';

import { getRandomTrianglePosition } from '@/utils/randomPosition';

import bunnyImage from '@/assets/bunny.png';

export class GameManager {
  private static _instance: GameManager;
  public app!: Application;
  public viewport!: Camera;
  public character?: Character;

  private mapWidth = 6000;
  private mapHeight = 8000;
  private spawnCount = {
    coins: 80,
    balloons: 100,
    clouds: 200,
  };

  private entities: Container[] = [];
  private bunnyTexture?: Texture;

  private gameOverScreen?: GameOverScreen;
  private startButton?: Container;
  private isGameOver = false;

  private constructor() {}

  public static get instance(): GameManager {
    if (!GameManager._instance) {
      GameManager._instance = new GameManager();
    }
    return GameManager._instance;
  }

  public async init(app: Application, viewport: Camera) {
    this.app = app;
    this.viewport = viewport;

    // this.viewport.clamp({
    //   left: -this.mapWidth,
    //   right: this.mapWidth,
    //   top: -this.mapHeight * 2,
    //   bottom: this.mapHeight * 2,
    // });
    this.viewport.clampZoom({
      maxWidth: this.mapWidth * 2,
      maxHeight: this.mapHeight * 2,
      minScale: 0.1,
    });

    // Load assets
    this.bunnyTexture = await Assets.load({
      alias: 'bunny',
      src: bunnyImage,
    });

    this.createWalls();

    // Init UI
    this.gameOverScreen = new GameOverScreen();
    this.gameOverScreen.on('restart', () => {
      this.restartGame();
    });
    this.app.stage.addChild(this.gameOverScreen);

    this.showStartScreen();
  }

  private createWalls() {
    const { height } = this.app.screen;
    // Ground
    this.createWall(0, height - 25, 10000, 50);
  }

  private createWall(x: number, y: number, w: number, h: number) {
    const wall = new Graphics();
    wall.rect(-w / 2, -h / 2, w, h);
    wall.fill(0x222222);
    wall.position.set(x, y);

    // biome-ignore lint/suspicious/noExplicitAny: mixin injects body property
    (wall as any).body = Matter.Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      density: 1,
      restitution: 0,
    });

    this.viewport.addChild(wall);
  }

  private spawnEntities() {
    const { height } = this.app.screen;

    const startPoition = {
      x: -this.mapWidth / 2,
      y: height - this.mapHeight - 100,
    };

    const coinCount = this.spawnCount.coins;
    for (let i = 0; i < coinCount; i++) {
      const position = getRandomTrianglePosition(
        startPoition.x,
        startPoition.y,
        this.mapWidth,
        this.mapHeight,
      );
      const coin = new Coin({
        x: position.x,
        y: position.y,
      });
      this.viewport.addChild(coin);
      this.entities.push(coin);
    }

    const balloonCount = this.spawnCount.balloons;
    for (let i = 0; i < balloonCount; i++) {
      const position = getRandomTrianglePosition(
        startPoition.x,
        startPoition.y,
        this.mapWidth,
        this.mapHeight,
      );
      const balloon = new Balloon({
        x: position.x,
        y: position.y,
        scale: gsap.utils.random(0.8, 1.8, 0.01),
      });
      this.viewport.addChild(balloon);
      this.entities.push(balloon);
    }

    const cloudCount = this.spawnCount.clouds;
    for (let i = 0; i < cloudCount; i++) {
      const position = getRandomTrianglePosition(
        startPoition.x,
        startPoition.y,
        this.mapWidth,
        this.mapHeight,
      );
      const cloud = new SmallCloud({
        label: 'cloud',
        x: position.x,
        y: position.y,
        scale: { x: gsap.utils.random(1, 1.5), y: gsap.utils.random(0.8, 1.5) },
      });
      this.viewport.addChild(cloud);
      this.entities.push(cloud);
    }
  }

  private spawnCharacter() {
    if (!this.bunnyTexture) return;

    const { height } = this.app.screen;
    const spawnX = 0;
    const spawnY = height - this.mapHeight - 100;

    this.character = new Character(
      {
        label: 'character',
        x: spawnX,
        y: spawnY,
      },
      this.bunnyTexture,
    );

    this.viewport.addChild(this.character);

    // Bind camera
    this.viewport.setViewTarget(this.character);
    this.character.bindCamera(this.viewport);

    this.viewport.setZoom(0.8);

    this.character.on('stopped', () => {
      this.onGameOver();
    });
  }

  private startGame() {
    this.isGameOver = false;
    this.spawnEntities();
    this.spawnCharacter();
  }

  private showStartScreen() {
    if (this.startButton) {
      this.startButton.visible = true;
      this.app.stage.addChild(this.startButton);
      return;
    }

    const btn = new Container({ label: 'start-button' });

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, 200, 60, 10);
    bg.fill(0x00aa00);
    bg.stroke({ width: 4, color: 0xffffff });

    // Text
    const text = new Text({
      text: 'Start Game',
      style: {
        fontSize: 30,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.position.set(100, 30);

    btn.addChild(bg, text);

    // Position center screen
    btn.pivot.set(100, 30);
    btn.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

    // Interactive
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', (e) => {
      e.stopPropagation();
      btn.visible = false;
      this.startGame();
    });

    this.app.stage.addChild(btn);
    this.startButton = btn;
  }

  private onGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    if (this.gameOverScreen) {
      this.gameOverScreen.setInfo({
        score: this.character?.score ?? 0,
      });
      this.gameOverScreen.resize(this.app.screen.width, this.app.screen.height);
      this.gameOverScreen.visible = true;
      this.app.stage.addChild(this.gameOverScreen);
    }
  }

  private restartGame() {
    if (this.gameOverScreen) {
      this.gameOverScreen.visible = false;
    }

    // Clear entities
    this.entities.forEach((e) => {
      e.destroy();
    });
    this.entities = [];

    if (this.character) {
      this.character.destroy({ children: true });
      this.character = undefined;
    }

    // Restart logic
    this.startGame();
  }
}
