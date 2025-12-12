import { Container, type DestroyOptions, Graphics, type ContainerOptions } from 'pixi.js';
import Matter from 'matter-js';

import { groups } from './groups';

const circles = [
  {
    radius: 10,
    x: -30,
    y: 0,
  },
  {
    radius: 10,
    x: -15,
    y: -10,
  },
  {
    radius: 20,
    x: 0,
    y: 0,
  },
  {
    radius: 14,
    x: 8,
    y: -20,
  },
  {
    radius: 14,
    x: 30,
    y: -5,
  },
];

export class SmallCloud extends Container {
  private shape!: Graphics;

  _recoverTimer?: ReturnType<typeof setTimeout>;

  constructor(options: ContainerOptions) {
    super(options);
    this.init();
  }

  init() {
    const bodyParts: Matter.Body[] = [];
    this.shape = new Graphics();
    this.addChild(this.shape);

    for (const circle of circles) {
      const body = Matter.Bodies.circle(circle.x, circle.y, circle.radius);
      bodyParts.push(body);
      this.shape.circle(circle.x, circle.y, circle.radius);
    }
    this.shape.fill(0xffffff);

    this.body = Matter.Body.create({
      restitution: 0.3,
      label: this.label,
      parts: bodyParts,
      isStatic: true,
      collisionFilter: {
        group: groups.sceneObj,
      },
    });
    Matter.Body.setPosition(this.body, this.position);
    Matter.Body.setAngle(this.body, this.rotation);
    Matter.Body.scale(this.body, this.scale.x, this.scale.y);
  }

  onHit() {
    this.tint = 0xcccccc;
    if (this._recoverTimer) {
      clearTimeout(this._recoverTimer);
    }
    this._recoverTimer = setTimeout(() => {
      this.tint = 0xffffff;
    }, 100);
  }

  destroy(options: DestroyOptions) {
    super.destroy(options);
    if (this._recoverTimer) {
      clearTimeout(this._recoverTimer);
    }
  }
}
