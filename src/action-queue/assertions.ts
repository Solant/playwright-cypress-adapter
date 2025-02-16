import { expect as playwrightExpect } from '@playwright/test';

import { Registry } from './registry';
import { assertLocator } from './subject';
import { usingLooseMode } from './loose';

export interface BaseAssert {
  type: 'assertion',
  name: string,
  negation?: boolean,
}

function expect<T>(assert: BaseAssert, arg: T) {
  return assert.negation ? playwrightExpect(arg).not : playwrightExpect(arg);
}

export const assertionRegistry = new Registry()
  .assertion<{ name: 'dom.length', value: number }>(
    'dom.length',
    async (subject, assertion) => {
      if (subject.type === 'locator') {
        await expect(assertion, subject.value).toHaveCount(assertion.value);
      } else {
        expect(assertion, subject.value).toHaveLength(assertion.value);
      }
      return subject;
    },
  )

  .assertion<{ name: 'dom.text', value: string }>(
    'dom.text',
    async (subject, assertion) => {
      assertLocator(subject);
      await expect(assertion, subject.value).toHaveText(assertion.value);
      return subject;
    },
  )

  .assertion<{ name: 'dom.class', value: string }>(
    'dom.class',
    async (subject, assertion) => {
      assertLocator(subject);
      expect(assertion, subject.value).toHaveClass(new RegExp(assertion.value));
      return subject;
    },
  )

  .assertion<{ name: 'dom.attr', attribute: string, value: string }>(
    'dom.attr',
    async (subject, assertion) => {
      assertLocator(subject);
      await expect(assertion, subject.value).toHaveAttribute(assertion.attribute, assertion.value);
      return subject;
    },
  )

  .assertion<{ name: 'dom.exist' }>(
    'dom.exist',
    async (subject, assertion) => {
      assertLocator(subject);
      await expect(assertion, subject.value).toBeVisible();
      return subject;
    },
  )

  .assertion<{ name: 'dom.value', value: string }>(
    'dom.value',
    async (subject, assertion) => {
      assertLocator(subject);
      await expect(assertion, subject.value).toHaveValue(assertion.value);
      return subject;
    },
  )

  .assertion<{ name: 'include', value: string }>(
    'include',
    async (subject, assertion) => {
      if (subject.type === 'value') {
        expect(assertion, subject.value).toContain(assertion.value);
        return subject;
      }
      if (subject.type === 'locator') {
        await expect(assertion, subject.value).toContainText(assertion.value);
        return subject;
      }
      throw new Error('Handle subject is not implemented');
    },
  )

  .assertion<{ name: 'property', value: string }>(
    'property',
    async (subject, assertion, page) => {
      if (subject.type === 'handle') {
        const result = await page.evaluate(
          (ctx) => Object.prototype.hasOwnProperty.call(ctx.subject, ctx.property),
          { subject: subject.value, property: assertion.value },
        );
        expect(assertion, result).toBe(true);
        return subject;
      }

      expect(assertion, subject.value).toHaveProperty(assertion.value);
      return subject;
    },
  )

  .assertion<{ name: 'empty' }>(
    'empty',
    async (subject, assertion) => {
      if (subject.type === 'value') {
        if (typeof subject.value === 'string' || Array.isArray(subject.value)) {
          expect(assertion, subject.value).toHaveLength(0);
          return subject;
        }
        expect(assertion, Object.keys(subject.value as object)).toHaveLength(0);
        return subject;
      }
      if (subject.type === 'locator') {
        await expect(assertion, subject.value).toBeEmpty();
        return subject;
      }
      throw new Error('Handle subject is not implemented');
    },
  )

  .assertion<{ name: 'equal', value: unknown }>(
    'equal',
    async (subject, assertion) => {
      expect(assertion, subject.value).toBe(assertion.value);
      return subject;
    },
  )

  .assertion<{ name: 'dom.checked' }>(
    'dom.checked',
    async (subject, assertion) => {
      assertLocator(subject);
      await usingLooseMode(subject.value, (el) => expect(assertion, el).toBeChecked());
      return subject;
    },
  )

  .assertion<{ name: 'dom.visible' }>(
    'dom.visible',
    async (subject, assertion) => {
      assertLocator(subject);
      await expect(assertion, subject.value).toBeVisible();
      return subject;
    },
  )

  .assertion<{ name: 'null' }>(
    'null',
    async (subject, assertion) => {
      expect(assertion, subject.value).toBe(null);
      return subject;
    },
  );
