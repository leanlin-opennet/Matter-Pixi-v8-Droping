import type Matter from 'matter-js';
import { getPixiTarget } from '@/utils/pixi';
import { Coin } from '@/components/Coin';
import { Character } from '@/components/Character';

import type { IChildCollisionSystem } from './CollisionSystem';

export class CoinSystem implements IChildCollisionSystem {
  onCollisionStart(pair: Matter.Pair) {
    const containerA = getPixiTarget(pair.bodyA);
    const containerB = getPixiTarget(pair.bodyB);

    let coin: Coin | undefined;
    let character: Character | undefined;

    if (containerA instanceof Coin) coin = containerA;
    else if (containerB instanceof Coin) coin = containerB;

    if (containerA instanceof Character) character = containerA;
    else if (containerB instanceof Character) character = containerB;

    if (coin && character && !coin.isCollected) {
      coin.collect();
      // Generate a unique ID for this reward collection event to prevent double counting if physics engine fires multiple times
      character.collectReward(`coin-${coin.uid}`, coin.value);
    }
  }
}
