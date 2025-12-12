import '@esotericsoftware/spine-pixi-v8';
import './mixins/ContainerMixin';
import './Physics/PhysicsSystem';
import './PathGenerator/PathGeneratorSystem';

import type { PathGeneratorSystem } from './PathGenerator/PathGeneratorSystem';

declare global {
  namespace PixiMixins {
    interface Container {
      _body?: Matter.Body;
      get body(): Matter.Body | undefined;
      set body(body: Matter.Body | undefined);
      syncBodyProperty(): void;
      updateBodyProperty(data: { position?: import('pixi.js').PointData; rotation?: number }): void;

      /* use for recording thing */
      _beforeData?: Record<string, any>;
    }

    interface RendererSystems {
      pathGenerator?: PathGeneratorSystem;
    }
  }
  namespace Matter {
    interface Body {
      container?: import('pixi.js').Container;
      onBeforeUpdate?(): void;
      onAfterUpdate?(): void;
    }
  }
}
