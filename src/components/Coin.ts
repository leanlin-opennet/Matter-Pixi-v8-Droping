import { Container, Graphics, Text, type ContainerOptions, type DestroyOptions } from 'pixi.js';
import Matter from 'matter-js';
import { gsap } from 'gsap';

export class Coin extends Container {
  private graphics: Graphics;
  public isCollected = false;
  value = 10;
  valueText: Text;

  constructor(options: ContainerOptions) {
    super({
      label: 'coin',
      ...options,
    });

    this.graphics = new Graphics();
    this.graphics.circle(0, 0, 15);
    this.graphics.fill(0xffd700); // Gold color
    this.graphics.stroke({ width: 2, color: 0xdaa520 }); // Darker gold outline

    this.valueText = new Text({
      text: this.value.toString(),
      anchor: { x: 0.5, y: 0.5 },
      resolution: 3,
      style: {
        fontSize: 12,
        fill: 0xffffff,
        stroke: {
          color: 0x000000,
          width: 2,
        },
      },
    });
    this.addChild(this.graphics, this.valueText);

    // Create a sensor body
    this.body = Matter.Bodies.circle(this.position.x, this.position.y, 15, {
      isSensor: true,
      isStatic: true,
      label: 'coin',
    });

    // Animate the coin
    this.animate();
  }

  animate() {
    gsap.to(this.scale, {
      x: 0.8,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  }

  collect() {
    if (this.isCollected) return;
    this.isCollected = true;

    // Visual feedback
    gsap.to(this, {
      alpha: 0,
      scale: 1.5,
      duration: 0.2,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  destroy(options?: DestroyOptions) {
    super.destroy(options);
  }
}
