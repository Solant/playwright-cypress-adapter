import { test } from '@playwright/test';

import {
  resetQueue, cloneQueue, evaluateAction, Subject,
} from './actions';
import { cy, Cypress } from './cy';

export const { describe } = test;
export const context = test.describe;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const beforeEach = (testBody: any) => {
  resetQueue();
  testBody();
  const localQueue = cloneQueue();

  test.beforeEach(async ({ page }) => {
    let subject: Subject = { type: 'value', value: null };
    const aliasMap: Record<string, Subject> = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const action of localQueue) {
      // eslint-disable-next-line no-await-in-loop
      subject = await evaluateAction(page, action, subject, aliasMap);
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function it(name: string, testBody: any) {
  resetQueue();
  testBody();
  const localQueue = cloneQueue();

  test(name, async ({ page }) => {
    let subject: Subject = { type: 'value', value: null };
    const aliasMap: Record<string, Subject> = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const action of localQueue) {
      // eslint-disable-next-line no-await-in-loop
      subject = await evaluateAction(page, action, subject, aliasMap);
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
  // @ts-expect-error global this injection
  global.Cypress = Cypress;
}
