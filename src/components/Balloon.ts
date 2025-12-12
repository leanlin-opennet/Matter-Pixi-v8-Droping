import { Container, Graphics, type ContainerOptions, type DestroyOptions } from 'pixi.js';
import Matter from 'matter-js';
import { engine } from '../extenstions/Physics/constant';
import { groups } from './groups';

export class Balloon extends Container {
  private graphics: Graphics;

  constructor(options: ContainerOptions) {
    super({
      label: 'balloon',
      ...options,
    });

    const radius = 20;
    const color = Math.floor(Math.random() * 0xffffff);

    this.graphics = new Graphics();
    this.graphics.circle(0, 0, radius);
    this.graphics.fill(color);
    // Add a little shine/reflection
    this.graphics.circle(-radius * 0.3, -radius * 0.3, radius * 0.2);
    this.graphics.fill({ color: 0xffffff, alpha: 0.3 });
    // Add a string
    this.graphics.moveTo(0, radius);
    this.graphics.lineTo(0, radius + 20);
    this.graphics.stroke({ width: 2, color: 0xffffff });

    this.addChild(this.graphics);

    const body = Matter.Bodies.circle(this.position.x, this.position.y, radius, {
      restitution: 0.9, // Bouncy
      friction: 0.001,
      frictionAir: 0.03,
      density: 0.001, // Light
      label: 'balloon',
      collisionFilter: {
        group: groups.sceneObj,
      },
    });
    this.body = body;

    // Custom update logic to reverse the current gravity force
    body.onBeforeUpdate = () => {
      const gravity = engine.gravity;
      Matter.Body.applyForce(body, body.position, {
        x: 0,
        y: (-gravity.y * gravity.scale * body.mass) / 2,
      });
    };
  }

  destroy(options?: DestroyOptions) {
    super.destroy(options);
    if (this.body) {
      this.body.onBeforeUpdate = undefined;
      this.body = undefined;
    }
  }
}
