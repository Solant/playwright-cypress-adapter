import { test as playwrightTest } from '@playwright/test';

import {
  resetQueue, cloneQueue, evaluateAction, type Subject,
} from './action-queue';
import { cy, Cypress } from './cy';

export const { describe } = playwrightTest;
export const context = playwrightTest.describe;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const beforeEach = (testBody: any) => {
  resetQueue();
  testBody();
  const localQueue = cloneQueue();

  playwrightTest.beforeEach(async ({ page }) => {
    let subject: Subject = { type: 'value', value: null };
    const aliasMap: Record<string, Subject> = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const action of localQueue) {
      // eslint-disable-next-line no-await-in-loop
      subject = await evaluateAction(action, subject, page, aliasMap);
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function it(name: string, testBody: any) {
  resetQueue();
  testBody();
  const localQueue = cloneQueue();

  playwrightTest(name, async ({ page }) => {
    let subject: Subject = { type: 'value', value: null };
    const aliasMap: Record<string, Subject> = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const action of localQueue) {
      // eslint-disable-next-line no-await-in-loop
      subject = await evaluateAction(action, subject, page, aliasMap);
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
