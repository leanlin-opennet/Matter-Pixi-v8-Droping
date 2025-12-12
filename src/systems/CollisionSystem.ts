import Matter from 'matter-js';

import type { ISystem } from './type';

export interface IChildCollisionSystem {
  onCollisionStart?(pair: Matter.Pair): void;
  onCollisionEnd?(pair: Matter.Pair): void;
}

export class CollisionSystem implements ISystem {
  private engine: Matter.Engine;

  systems: IChildCollisionSystem[] = [];

  constructor(engine: Matter.Engine) {
    this.engine = engine;
    Matter.Events.on(engine, 'collisionStart', this.collisionStart);
    Matter.Events.on(engine, 'collisionEnd', this.collisionEnd);
  }
  collisionStart = (event: Matter.IEventCollision<Matter.Engine>) => {
    for (const pair of event.pairs) {
      for (const system of this.systems) {
        system.onCollisionStart?.(pair);
      }
    }
  };
  collisionEnd = (event: Matter.IEventCollision<Matter.Engine>) => {
    for (const pair of event.pairs) {
      for (const system of this.systems) {
        system.onCollisionEnd?.(pair);
      }
    }
  };
  addSystem(system: IChildCollisionSystem) {
    this.systems.push(system);
  }
  removeSystem(system: IChildCollisionSystem) {
    this.systems = this.systems.filter((s) => s !== system);
  }
  destroy() {
    Matter.Events.off(this.engine, 'collisionStart', this.collisionStart);
    Matter.Events.off(this.engine, 'collisionEnd', this.collisionEnd);
    /* @ts-expect-error */
    this.engine = undefined;
    this.systems = [];
  }
}
