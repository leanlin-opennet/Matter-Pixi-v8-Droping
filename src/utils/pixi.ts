import type Matter from 'matter-js';

export function getPixiTarget(target: Matter.Body) {
  let body = target;
  while (body) {
    if (body.container) {
      return body.container;
    }
    body = body.parent;
  }
  return undefined;
}
