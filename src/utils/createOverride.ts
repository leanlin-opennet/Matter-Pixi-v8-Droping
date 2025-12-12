export function createOverride<Target extends {}>(target: Target, property: keyof Target) {
  const descriptor = Object.getOwnPropertyDescriptor(target, property) as PropertyDescriptor;

  return {
    descriptor,
    defineOverride(override: PropertyDescriptor) {
      Object.defineProperty(target, property, {
        ...descriptor,
        ...override,
      });
    },
  };
}
