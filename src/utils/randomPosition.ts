import gsap from 'gsap';

export function getRandomRectPosition(x: number, y: number, width: number, height: number) {
  return {
    x: gsap.utils.random(x, x + width),
    y: gsap.utils.random(y, y + height),
  };
}

export function getRandomTrianglePosition(x: number, y: number, width: number, height: number) {
  const a = { x: x + width / 2, y: y };
  const b = { x: x + width, y: y + height };
  const c = { x: x, y: y + height };
  const r1 = Math.random();
  const r2 = Math.random();
  const s1 = Math.sqrt(r1);
  return {
    x: a.x * (1 - s1) + b.x * (1 - r2) * s1 + c.x * r2 * s1,
    y: a.y * (1 - s1) + c.y * (1 - r2) * s1 + b.y * r2 * s1,
  };
}
