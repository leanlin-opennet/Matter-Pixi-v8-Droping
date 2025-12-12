import { extensions, Container } from 'pixi.js';
import Matter from 'matter-js';

import { engine } from '../Physics/constant';

import { createOverride } from '@/utils/createOverride';

interface PrivateContainer extends Omit<Container, '_didLocalTransformChangeId'> {
  _didLocalTransformChangeId: number;
  syncBodyProperty: () => void;
}

const { descriptor: visibility, defineOverride: overrideVisibility } = createOverride(
  Container.prototype,
  'visible',
);

const mixin: Partial<PrivateContainer> = {
  _body: undefined,
  get body(): Matter.Body | undefined {
    return this._body;
  },
  set body(body: Matter.Body | undefined) {
    if (this._body === body || this.destroyed) return;

    if (this._body) {
      this._body.container = undefined;
      Matter.World.remove(engine.world, this._body);
    }
    this._body = body;
    if (body) {
      body.container = this as unknown as Container;
      Matter.World.add(engine.world, body);
      this.on?.('destroyed', () => {
        body.container = undefined;
        Matter.World.remove(engine.world, body);
      });

      // this.position?.set(body.position.x, body.position.y);
      // this.rotation = body.angle;
      // toggle sleeping status as the visibility changes
      overrideVisibility({
        set(visibleValue: boolean) {
          visibility.set?.call(this, visibleValue);
          const container = this as PrivateContainer;
          if (container.body) {
            Matter.Sleeping.set(container.body, !visibleValue);
          }
        },
      });
    }
  },
};

extensions.mixin(Container, mixin);
