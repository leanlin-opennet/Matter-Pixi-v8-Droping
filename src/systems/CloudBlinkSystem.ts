import type Matter from 'matter-js';

import { getPixiTarget } from '@/utils/pixi';
import { SmallCloud } from '@/components/SmallCloud';

import type { IChildCollisionSystem } from './CollisionSystem';

export class CloudBlinkSystem implements IChildCollisionSystem {
  onCollisionStart(pair: Matter.Pair) {
    const containerA = getPixiTarget(pair.bodyA);
    const containerB = getPixiTarget(pair.bodyB);
    const cloud = containerA?.label === 'cloud' ? containerA : containerB;
    if (cloud instanceof SmallCloud) {
      cloud.onHit();
    }
  }
  destroy() {
    /* @ts-expect-error */
    this.engine = undefined;
  }
}
