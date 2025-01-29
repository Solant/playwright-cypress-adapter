import {
  type Cookie,
  expect, JSHandle, Locator, Page,
} from '@playwright/test';

export type SpecialSelector = { modifier: 'first' } | { modifier: 'last' } | {
  modifier: 'contains',
  value: string,
  exact: boolean,
} | {
  modifier: 'nth',
  value: number,
};

export type Selector = Array<string | SpecialSelector>;

type AssertActions = {
  type: 'assertion',
  name: 'dom.length',
  value: number,
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'dom.text',
  value: string,
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'dom.class',
  value: string,
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'include',
  value: string,
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'dom.exist',
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'property',
  value: string,
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'empty',
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'equal',
  value: unknown,
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'null',
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'dom.checked',
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'dom.value',
  value: string,
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'dom.visible',
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'dom.attr',
  attribute: string,
  value: string,
  negation?: boolean,
};

export type ClickActionPosition =
  'topLeft'
  | 'top'
  | 'topRight'
  | 'left'
  | 'center'
  | 'right'
  | 'bottomLeft'
  | 'bottom'
  | 'bottomRight';

export type ClickActionModifiers = 'Control' | 'Alt' | 'Shift' | 'Meta';

export type Action = AssertActions | {
  type: 'navigate',
  url: string,
} | {
  type: 'locator',
  selector: Selector,
  root: boolean,
} | {
  type: 'fill',
  value: string,
} | {
  type: 'clear',
} | {
  type: 'check',
  value: boolean,
} | {
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
} | {
  type: 'keyboard',
  action: 'press',
  key: string,
} | {
  type: 'title',
} | {
  type: 'pause',
} | {
  type: 'subject',
  value: unknown,
} | {
  type: 'wait',
  value: number,
} | {
  type: 'alias',
  name: string,
} | {
  type: 'location',
  key?: 'hash'
    | 'host'
    | 'hostname'
    | 'href'
    | 'origin'
    | 'pathname'
    | 'port'
    | 'protocol'
    | 'search',
} | {
  type: 'handle',
  global: 'window' | 'document',
} | {
  type: 'scrollIntoView',
} | {
  type: 'scrollTo',
  position: ClickActionPosition | { x: string | number, y: string | number },
} | {
  type: 'dispatchEvent',
  event: string,
} | {
  type: 'select',
  value: string | string[],
} | {
  type: 'blur',
} | {
  type: 'focus',
} | {
  type: 'cookie.clear',
  filter?: {
    name?: string | RegExp,
    domain?: string | RegExp,
  },
} | {
  type: 'cookie.get',
  name: string,
  domain?: string,
  multiple: false,
} | {
  type: 'cookie.get',
  domain?: string,
  multiple: true,
} | {
  type: 'cookie.set',
  cookie: Omit<Cookie, 'sameSite'>,
};

function resolveDomain(page: Page, domain?: string | '__CURRENT_DOMAIN__'): string | undefined {
  if (domain === '__CURRENT_DOMAIN__') {
    return `.${new URL(page.url()).hostname}`;
  }
  return domain;
}

let queue: Array<Action> = [];

/**
 * Apply callback ignoring playwright "strict mode"
 */
async function usingLooseMode(elements: Locator, cb: (element: Locator) => Promise<void>) {
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

function expectWrapper<T>(arg: T, negation?: boolean) {
  return negation ? expect(arg).not : expect(arg);
}

type LocatorSubject = { type: 'locator', value: Locator };

export type Subject =
  LocatorSubject
  | { type: 'value', value: unknown }
  | { type: 'handle', value: JSHandle };

function assertLocator(arg: Subject): asserts arg is LocatorSubject {
  if (arg.type !== 'locator') {
    throw new Error(`Expected Locator subject, got ${arg.type}`);
  }
}

export async function evaluateAction(
  page: Page,
  action: Action,
  subject: Subject,
  aliasMap: Record<string, Subject>,
): Promise<Subject> {
  switch (action.type) {
    case 'handle': {
      switch (action.global) {
        case 'window':
          return { type: 'handle', value: await page.evaluateHandle(() => window) };
        case 'document':
          return { type: 'handle', value: await page.evaluateHandle(() => window.document) };
        default:
          throw new Error('Unknown handle value');
      }
    }
    case 'alias': {
      // eslint-disable-next-line no-param-reassign
      aliasMap[action.name] = subject;
      return subject;
    }
    case 'subject': {
      if (action.value instanceof Promise) {
        return { type: 'value', value: await action.value };
      }
      return { type: 'value', value: action.value };
    }
    case 'locator': {
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
    }
    case 'navigate':
      await page.goto(action.url);
      break;
    case 'assertion':
      switch (action.name) {
        case 'dom.length':
          if (subject.type === 'locator') {
            await expectWrapper(subject.value, action.negation).toHaveCount(action.value);
          } else {
            expectWrapper(subject.value, action.negation).toHaveLength(action.value);
          }
          break;
        case 'dom.text':
          assertLocator(subject);
          await expectWrapper(subject.value, action.negation).toHaveText(action.value);
          break;
        case 'dom.class':
          assertLocator(subject);
          await expectWrapper(subject.value, action.negation).toHaveClass(new RegExp(action.value));
          break;
        case 'dom.attr':
          assertLocator(subject);
          await expectWrapper(subject.value, action.negation).toHaveAttribute(action.attribute, action.value);
          break;
        case 'dom.exist':
          assertLocator(subject);
          await expectWrapper(subject.value, action.negation).toBeVisible();
          break;
        case 'dom.value':
          assertLocator(subject);
          await expectWrapper(subject.value, action.negation).toHaveValue(action.value);
          break;
        case 'include':
          if (subject.type === 'value') {
            expectWrapper(subject.value, action.negation).toContain(action.value);
            break;
          }
          if (subject.type === 'locator') {
            await expectWrapper(subject.value, action.negation).toContainText(action.value);
            break;
          }
          throw new Error('Handle subject is not implemented');
        case 'property':
          if (subject.type === 'handle') {
            const result = await page.evaluate(
              (ctx) => Object.prototype.hasOwnProperty.call(ctx.subject, ctx.property),
              { subject: subject.value, property: action.value },
            );
            expectWrapper(result, action.negation).toBe(true);
            break;
          }

          expectWrapper(subject.value, action.negation).toHaveProperty(action.value);
          break;
        case 'empty':
          if (subject.type === 'value') {
            if (typeof subject.value === 'string' || Array.isArray(subject.value)) {
              if (action.negation) {
                expect(subject.value).not.toHaveLength(0);
                break;
              }

              expect(subject.value).toHaveLength(0);
              break;
            } else {
              if (action.negation) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect(Object.keys(subject.value as any)).not.toHaveLength(0);
                break;
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              expect(Object.keys(subject.value as any)).not.toHaveLength(0);
              break;
            }
          }
          if (subject.type === 'locator') {
            await expectWrapper(subject.value, action.negation).toBeEmpty();
            break;
          }
          throw new Error('Handle subject is not implemented');
        case 'equal':
          expectWrapper(subject.value, action.negation).toBe(action.value);
          break;
        case 'dom.checked':
          assertLocator(subject);
          if (action.negation) {
            await usingLooseMode(subject.value, (el) => expect(el).not.toBeChecked());
          } else {
            await usingLooseMode(subject.value, (el) => expect(el).toBeChecked());
          }
          break;
        case 'dom.visible':
          assertLocator(subject);
          await expectWrapper(subject.value, action.negation).toBeVisible();
          break;
        case 'null':
          expectWrapper(subject.value, action.negation).toBe(null);
          break;
        default:
          throw new Error(`Unknown assertion type "${(action as Record<string, unknown>).name}"`);
      }
      break;
    case 'fill':
      assertLocator(subject);
      await subject.value.fill(action.value);
      break;
    case 'clear':
      assertLocator(subject);
      await subject.value.clear();
      break;
    case 'keyboard':
      switch (action.action) {
        case 'press':
          await page.keyboard.press(action.key);
          break;
        default:
          throw new Error(`Keyboard action "${action.action}" is not implemented`);
      }
      break;
    case 'check': {
      assertLocator(subject);
      await usingLooseMode(subject.value, (el) => el.setChecked(action.value));
      break;
    }
    case 'click': {
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

      break;
    }
    case 'title':
      return { type: 'value', value: await page.title() };
    case 'pause':
      await page.pause();
      break;
    case 'wait':
      await page.waitForTimeout(action.value);
      break;
    case 'scrollIntoView':
      assertLocator(subject);
      await subject.value.scrollIntoViewIfNeeded({ timeout: 4000 });
      break;
    case 'scrollTo':
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
        break;
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
      break;
    case 'location': {
      const url = new URL(page.url());
      if (action.key) {
        return { type: 'value', value: url[action.key] };
      }
      return {
        type: 'value',
        value: {
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
        },
      };
    }
    case 'dispatchEvent':
      assertLocator(subject);
      await subject.value.dispatchEvent(action.event);
      break;
    case 'select':
      assertLocator(subject);
      await subject.value.selectOption(action.value);
      break;
    case 'blur':
      assertLocator(subject);
      await subject.value.blur();
      break;
    case 'focus':
      assertLocator(subject);
      await subject.value.focus();
      break;
    case 'cookie.clear':
      await page.context().clearCookies(action.filter ? {
        name: action.filter.name,
      } : action.filter);
      break;
    case 'cookie.get': {
      const cookies = await page.context().cookies();
      return {
        type: 'value',
        value: action.multiple
          ? cookies
          : (cookies.find((cookie) => cookie.name === action.name) ?? null),
      };
    }
    case 'cookie.set':
      await page.context().addCookies([{ ...action.cookie, domain: resolveDomain(page, action.cookie.domain) }]);
      break;
    default:
      throw new Error(`Action type "${(action as Record<string, unknown>).type}" is not implemented`);
  }

  return subject;
}

export function resetQueue() {
  queue = [];
}

export function cloneQueue(): Array<Action> {
  return [...queue];
}

export function pushQueue(action: Action) {
  queue.push(action);
}

export function inspectQueue(index: number): Action | undefined {
  if (index >= 0) {
    return queue[index];
  }
  return queue[queue.length + index];
}

export function replaceQueue(index: number, action: Action) {
  if (index >= 0) {
    queue[index] = action;
  } else {
    queue[queue.length + index] = action;
  }
}

type PageAction = {
  (subject: Subject, page: Page, aliasMap: Record<string, Subject>): Promise<Subject>,
};

class ActionRegistry<T = unknown> {
  private map = new Map<string, PageAction>();

  action<Payload extends {
    type: string,
  }>(type: Payload['type'], callback: PageAction): ActionRegistry<T extends unknown ? Payload : (T | Payload)> {
    this.map.set(type, callback);
    // @ts-expect-error type safe builder
    return this;
  }

  evaluateAction(action: T, ...context: Parameters<PageAction>) {
    // @ts-expect-error get action type
    const type = action.type as string;
    const fn = this.map.get(type);
    if (!fn) {
      throw new Error(`Unknown action "${type}"`);
    }

    return fn.call(null, ...context);
  }
}

let a = new ActionRegistry()
  .action<{ type: 'check', value: boolean }>('check', (_subject, page) => {
    page.url();
    return Promise.resolve({ type: 'value', value: 3 });
  });
