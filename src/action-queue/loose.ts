import type { Locator } from '@playwright/test';

/**
 * Apply callback ignoring playwright "strict mode"
 */
export async function usingLooseMode(elements: Locator, cb: (element: Locator) => Promise<void>) {
  const count = await elements.count();
  if (count > 1) {
    for (let index = 0; index < count; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await cb(elements.nth(index));
    }
  } else {
    await cb(elements);
  }
}
