import { ExtensionType, type Container, Ticker, type System, extensions } from 'pixi.js';
import Matter from 'matter-js';

import { engine } from './constant';

export class PhysicsSystem implements System {
  public static extension = {
    type: [ExtensionType.WebGLSystem, ExtensionType.WebGPUSystem],
    name: 'physics',
  } as const;

  init() {}

  public update(_: Container) {
    const bodies = Matter.Composite.allBodies(engine.world);
    // sync back to matter before doing simulation
    for (const body of bodies) {
      body?.onBeforeUpdate?.();

      if (body.onBeforeUpdate) {
        body.onBeforeUpdate();
      } else {
        const container = (body as any).container as Container;

        if (container && !container.destroyed) {
          Matter.Body.setPosition(body, container.position);
          Matter.Body.setAngle(body, container.rotation);
          // Matter.Body.scale(body, container.scale.x, container.scale.y);
        }
      }
    }
    Matter.Engine.update(engine, Ticker.shared.deltaMS);
    for (const body of bodies) {
      if (body.onAfterUpdate) {
        body.onAfterUpdate();
      } else {
        const container = (body as any).container as Container;
        if (container && !container.destroyed) {
          container.position.copyFrom(body.position);
          container.rotation = body.angle;
        }
      }
    }
  }

  public prerender({ container }: { container: Container }) {
    this.update(container);
  }

  destroy() {
    Matter.World.clear(engine.world, false);
    Matter.Engine.clear(engine);
  }
}

extensions.add(PhysicsSystem);
