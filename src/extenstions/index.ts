import './mixins/ContainerMixin';
import './Physics/PhysicsSystem';

declare global {
  namespace PixiMixins {
    interface Container {
      _body?: Matter.Body;
      get body(): Matter.Body | undefined;
      set body(body: Matter.Body | undefined);
      syncBodyProperty(): void;
      updateBodyProperty(data: { position?: import('pixi.js').PointData; rotation?: number }): void;
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
