import { test } from '@playwright/test';

import { resetQueue, cloneQueue, evaluateAction } from './actions';
import { cy } from './cy';

export const { describe } = test;
export const context = test.describe;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const beforeEach = (testBody: any) => {
  resetQueue();
  testBody();
  const localQueue = cloneQueue();

  test.beforeEach(async ({ page }) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const action of localQueue) {
      // eslint-disable-next-line no-await-in-loop
      await evaluateAction(page, action);
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function it(name: string, testBody: any) {
  resetQueue();
  testBody();
  const localQueue = cloneQueue();

  test(name, async ({ page }) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const action of localQueue) {
      // eslint-disable-next-line no-await-in-loop
      await evaluateAction(page, action);
    }
  });
}

export { cy } from './cy';

export function setup() {
  // @ts-expect-error global this injection
  global.it = it;
  // @ts-expect-error global this injection
  global.beforeEach = beforeEach;
  // @ts-expect-error global this injection
  global.cy = cy;
  // @ts-expect-error global this injection
  global.describe = describe;
  // @ts-expect-error global this injection
  global.context = context;
}
