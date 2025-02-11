import {
  Cookie, expect as playwrightExpect, Locator, Page,
} from '@playwright/test';
import {
  ClickActionModifiers, ClickActionPosition,
} from '../actions';
import {
  Subject, assertLocator, handleSubject, valueSubject,
} from './subject';

type PageAction<T> = {
  (subject: Subject, action: T, page: Page, aliasMap: Record<string, Subject>): Promise<Subject>,
};

export type SpecialSelector = { modifier: 'first' } | { modifier: 'last' } | {
  modifier: 'contains',
  value: string,
  exact: boolean,
} | {
  modifier: 'nth',
  value: number,
};

export type Selector = Array<string | SpecialSelector>;

function resolveSelectorItem(parent: Locator | Page, selector: Selector[number]): Locator {
  if (typeof selector === 'string') {
    return parent.locator(selector);
  }
  switch (selector.modifier) {
    case 'contains':
      return parent.getByText(selector.value, { exact: selector.exact });
    case 'first':
      return (parent as Locator).first();
    case 'last':
      return (parent as Locator).last();
    case 'nth':
      return (parent as Locator).nth(selector.value);
    default:
      throw new Error(`Unknown selector modifier ${(selector as SpecialSelector).modifier}`);
  }
}

function resolveDomain(page: Page, domain?: string | '__CURRENT_DOMAIN__'): string | undefined {
  if (domain === '__CURRENT_DOMAIN__') {
    return `.${new URL(page.url()).hostname}`;
  }
  return domain;
}

interface BaseAssert {
  type: 'assertion',
  negation?: boolean,
}

function expect<T>(assert: BaseAssert, arg: T) {
  return assert.negation ? playwrightExpect(arg).not : playwrightExpect(arg);
}

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

export class Registry<T = unknown> {
  private map = new Map<string, PageAction<unknown>>();

  private assertions = new Map<string, PageAction<unknown>>();

  action<Payload extends {
    type: string,
  }>(
    type: Payload['type'],
    callback: PageAction<Payload>,
  ): Registry<T extends { type: string } ? (T | Payload) : Payload> {
    this.map.set(type, callback as PageAction<unknown>);
    // @ts-expect-error type safe builder
    return this;
  }

  assertion<Payload extends { name: string }>(
    name: Payload['name'],
    callback: PageAction<Payload & BaseAssert>,
  ): Registry<T extends { type: string } ? (T | (Payload & BaseAssert)) : (Payload & BaseAssert)> {
    this.assertions.set(name, callback as PageAction<unknown>);
    // @ts-expect-error type safe builder
    return this;
  }

  evaluateAction(action: T, ...context: Parameters<PageAction<unknown>>) {
    // @ts-expect-error get action type
    const type = action.type as string;
    const fn = this.map.get(type);
    if (!fn) {
      throw new Error(`Unknown action "${type}"`);
    }

    return fn.call(null, ...context);
  }
}

export type InferActions<T> = T extends Registry<infer T1> ? T1 : never;

export const actionRegistry = new Registry()
  .action<{ type: 'handle', global: 'window' | 'document' }>(
    'handle',
    async (_subject, action, page) => {
      switch (action.global) {
        case 'window':
          return handleSubject(await page.evaluateHandle(() => window));
        case 'document':
          return handleSubject(await page.evaluateHandle(() => window.document));
        default:
          throw new Error(`Unknown global name "${action.global}"`);
      }
    },
  )

  .action<{ type: 'alias', name: string }>(
    'alias',
    async (subject, action, _page, aliasMap) => {
      // eslint-disable-next-line no-param-reassign
      aliasMap[action.name] = subject;
      return subject;
    },
  )

  .action<{ type: 'subject', value: unknown }>(
    'subject',
    async (_subject, action) => {
      if (action.value instanceof Promise) {
        return valueSubject(await action.value);
      }
      return valueSubject(action.value);
    },
  )

  .action<{ type: 'locator', selector: Selector, root: boolean }>(
    'locator',
    async (subject, action, page, aliasMap) => {
      // resolve locator as alias
      if (typeof action.selector[0] === 'string' && action.selector[0].startsWith('@')) {
        return aliasMap[action.selector[0].substring(1)];
      }

      if (subject.value === null || action.root) {
        return { type: 'locator', value: resolveSelectorItem(page, action.selector[0]) };
      }
      if (subject.type === 'locator') {
        return { type: 'locator', value: resolveSelectorItem(subject.value, action.selector[0]) };
      }
      throw new Error('what');
    },
  )

  .action<{ type: 'navigate', url: string }>(
    'navigate',
    async (subject, action, page) => {
      await page.goto(action.url);
      return subject;
    },
  )

  .action<{ type: 'fill', value: string }>(
    'fill',
    async (subject, action) => {
      assertLocator(subject);
      await subject.value.fill(action.value);
      return subject;
    },
  )

  .action<{ type: 'clear' }>(
    'clear',
    async (subject) => {
      assertLocator(subject);
      await subject.value.clear();
      return subject;
    },
  )

  .action<{ type: 'keyboard', action: 'press', key: string }>(
    'keyboard',
    async (subject, action, page) => {
      switch (action.action) {
        case 'press':
          await page.keyboard.press(action.key);
          break;
        default:
          throw new Error(`Keyboard action "${action.action}" is not implemented`);
      }
      return subject;
    },
  )

  .action<{ type: 'check', value: boolean }>(
    'check',
    async (subject, action) => {
      assertLocator(subject);
      await usingLooseMode(subject.value, (el) => el.setChecked(action.value));
      return subject;
    },
  )

  .action<{
    type: 'click',
    position?: ClickActionPosition | {
      x: number,
      y: number,
    },
    force: boolean,
    modifiers: Array<ClickActionModifiers>,
    button: 'left' | 'right',
    double: boolean,
    multiple?: boolean,
  }>('click', async (subject, action) => {
    assertLocator(subject);
    const options = {
      force: action.force,
      button: action.button,
      position: (typeof action.position === 'object') ? action.position : undefined,
      modifiers: action.modifiers,
    };

    if (action.multiple) {
      await usingLooseMode(
        subject.value,
        (el) => (action.double ? el.dblclick(options) : el.click(options)),
      );
    } else if (action.double) {
      await subject.value.dblclick(options);
    } else {
      await subject.value.click(options);
    }
    return subject;
  })

  .action<{ type: 'title' }>(
    'title',
    async (_subject, _action, page) => valueSubject(await page.title()),
  )

  .action<{ type: 'pause' }>(
    'pause',
    async (subject, _action, page) => {
      await page.pause();
      return subject;
    },
  )

  .action<{ type: 'wait', value: number }>(
    'wait',
    async (subject, action, page) => {
      await page.waitForTimeout(action.value);
      return subject;
    },
  )

  .action<{ type: 'scrollIntoView' }>(
    'scrollIntoView',
    async (subject) => {
      assertLocator(subject);
      await subject.value.scrollIntoViewIfNeeded({ timeout: 4000 });
      return subject;
    },
  )

  .action<{ type: 'dispatchEvent', event: string }>(
    'dispatchEvent',
    async (subject, action) => {
      assertLocator(subject);
      await subject.value.dispatchEvent(action.event);
      return subject;
    },
  )

  .action<{ type: 'blur' }>(
    'blur',
    async (subject) => {
      assertLocator(subject);
      await subject.value.blur();
      return subject;
    },
  )

  .action<{ type: 'focus' }>(
    'focus',
    async (subject) => {
      assertLocator(subject);
      await subject.value.focus();
      return subject;
    },
  )

  .action<{ type: 'location', key: keyof URL }>(
    'location',
    async (_subject, action, page) => {
      const url = new URL(page.url());
      if (action.key) {
        return { type: 'value', value: url[action.key] };
      }
      return valueSubject({
        hash: url.hash,
        host: url.host,
        hostname: url.hostname,
        href: url.href,
        origin: url.origin,
        pathname: url.pathname,
        port: url.port,
        protocol: url.protocol,
        search: url.search,
        toString() {
        },
      });
    },
  )

  .action<{ type: 'cookie.clear', filter?: { name: string } }>(
    'cookie.clear',
    async (subject, action, page) => {
      await page.context().clearCookies(action.filter ? {
        name: action.filter.name,
      } : action.filter);
      return subject;
    },
  )

  .action<{ type: 'cookie.get', multiple: boolean, name?: string }>(
    'cookie.get',
    async (_subject, action, page) => {
      const cookies = await page.context().cookies();
      return valueSubject(action.multiple
        ? cookies
        : (cookies.find((cookie) => cookie.name === action.name) ?? null));
    },
  )

  .action<{ type: 'cookie.set', cookie: Omit<Cookie, 'sameSite'> }>(
    'cookie.set',
    async (subject, action, page) => {
      await page.context().addCookies([{ ...action.cookie, domain: resolveDomain(page, action.cookie.domain) }]);
      return subject;
    },
  )

  .action<{ type: 'scrollTo', position: ClickActionPosition | { x: string | number, y: string | number } }>(
    'scrollTo',
    async (subject, action, page) => {
      if (subject.type === 'value' && subject.value === null) {
        await page.evaluate(({ position }) => {
          const el = document.documentElement;
          const options = { top: 0, left: 0 };
          if (typeof position === 'string') {
            switch (position) {
              case 'topLeft':
                options.top = 0;
                options.left = 0;
                break;
              case 'left':
                options.top = (el.scrollHeight - el.clientHeight) / 2;
                options.left = 0;
                break;
              case 'bottomLeft':
                options.top = el.scrollHeight - el.clientHeight;
                options.left = 0;
                break;
              case 'top':
                options.top = 0;
                options.left = (el.scrollWidth - el.clientWidth) / 2;
                break;
              case 'center':
                options.top = (el.scrollHeight - el.clientHeight) / 2;
                options.left = (el.scrollWidth - el.clientWidth) / 2;
                break;
              case 'bottom':
                options.top = el.scrollHeight - el.clientHeight;
                options.left = (el.scrollWidth - el.clientWidth) / 2;
                break;
              case 'topRight':
                options.top = 0;
                options.left = el.scrollWidth - el.clientWidth;
                break;
              case 'right':
                options.top = (el.scrollHeight - el.clientHeight) / 2;
                options.left = el.scrollWidth - el.clientWidth;
                break;
              case 'bottomRight':
                options.top = el.scrollHeight - el.clientHeight;
                options.left = el.scrollWidth - el.clientWidth;
                break;
              default:
                throw new Error(`Unknown position ${position}`);
            }
          } else {
            if (typeof position.x === 'string') {
              const percentage = Number.parseInt(position.x, 10);
              options.left = ((el.scrollWidth - el.clientWidth) / 100) * percentage;
            } else {
              options.left = position.x;
            }

            if (typeof position.y === 'string') {
              const percentage = Number.parseInt(position.y, 10);
              options.top = ((el.scrollHeight - el.clientHeight) / 100) * percentage;
            } else {
              options.top = position.y;
            }
          }
          el.scrollTo(options);
        }, { position: action.position });
        return subject;
      }
      assertLocator(subject);
      await subject.value.evaluate((el, { position }) => {
        const options = { top: 0, left: 0 };
        if (typeof position === 'string') {
          switch (position) {
            case 'topLeft':
              options.top = 0;
              options.left = 0;
              break;
            case 'left':
              options.top = (el.scrollHeight - el.clientHeight) / 2;
              options.left = 0;
              break;
            case 'bottomLeft':
              options.top = el.scrollHeight - el.clientHeight;
              options.left = 0;
              break;
            case 'top':
              options.top = 0;
              options.left = (el.scrollWidth - el.clientWidth) / 2;
              break;
            case 'center':
              options.top = (el.scrollHeight - el.clientHeight) / 2;
              options.left = (el.scrollWidth - el.clientWidth) / 2;
              break;
            case 'bottom':
              options.top = el.scrollHeight - el.clientHeight;
              options.left = (el.scrollWidth - el.clientWidth) / 2;
              break;
            case 'topRight':
              options.top = 0;
              options.left = el.scrollWidth - el.clientWidth;
              break;
            case 'right':
              options.top = (el.scrollHeight - el.clientHeight) / 2;
              options.left = el.scrollWidth - el.clientWidth;
              break;
            case 'bottomRight':
              options.top = el.scrollHeight - el.clientHeight;
              options.left = el.scrollWidth - el.clientWidth;
              break;
            default:
              throw new Error(`Unknown position ${position}`);
          }
        } else {
          if (typeof position.x === 'string') {
            const percentage = Number.parseInt(position.x, 10);
            options.left = ((el.scrollWidth - el.clientWidth) / 100) * percentage;
          } else {
            options.left = position.x;
          }

          if (typeof position.y === 'string') {
            const percentage = Number.parseInt(position.y, 10);
            options.top = ((el.scrollHeight - el.clientHeight) / 100) * percentage;
          } else {
            options.top = position.y;
          }
        }
        el.scrollTo(options);
      }, { position: action.position });
      return subject;
    },
  )

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
