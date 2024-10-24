import {
  expect, JSHandle, Locator, Page,
} from '@playwright/test';

export type SpecialSelector = { modifier: 'first' } | { modifier: 'last' } | {
  modifier: 'contains',
  value: string,
  exact: boolean
} | {
  modifier: 'nth',
  value: number
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
  name: 'dom.checked',
  negation?: boolean,
} | {
  type: 'assertion',
  name: 'dom.value',
  value: string,
  negation?: boolean,
};

export type Action = AssertActions | {
  type: 'navigate',
  url: string
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
  type: 'check'
} | {
  type: 'click',
} | {
  type: 'keyboard',
  action: 'press',
  key: string,
} | {
  type: 'title'
} | {
  type: 'pause'
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
    | 'search'
} | {
  type: 'handle',
  global: 'window' | 'document',
};

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

export type Subject =
  { type: 'locator', value: Locator }
  | { type: 'value', value: unknown }
  | { type: 'handle', value: JSHandle };

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
          if (subject.type !== 'locator') {
            throw new Error(`count assertion expected locator, got ${subject.type} ${subject.value}`);
          }
          if (subject.type === 'locator') {
            await expect(subject.value).toHaveCount(action.value);
          }
          break;
        case 'dom.text':
          if (subject.type !== 'locator') {
            throw new Error(`count assertion expected locator, got ${subject.type} ${subject.value}`);
          }
          if (action.negation) {
            await expect(subject.value).not.toHaveText(action.value);
          } else {
            await expect(subject.value).toHaveText(action.value);
          }
          break;
        case 'dom.class':
          if (subject.type !== 'locator') {
            throw new Error(`count assertion expected locator, got ${subject.type} ${subject.value}`);
          }
          await expect(subject.value).toHaveClass(new RegExp(action.value));
          break;
        case 'dom.exist':
          if (subject.type !== 'locator') {
            throw new Error(`count assertion expected locator, got ${subject.type} ${subject.value}`);
          }
          if (action.negation) {
            await expect(subject.value).toBeHidden();
          } else {
            await expect(subject.value).toBeVisible();
          }
          break;
        case 'dom.value':
          if (subject.type !== 'locator') {
            throw new Error(`assertion expected locator, got ${subject.type} ${subject.value}`);
          }
          if (action.negation) {
            await expect(subject.value).not.toHaveValue(action.value);
          } else {
            await expect(subject.value).toHaveValue(action.value);
          }
          break;
        case 'include':
          if (subject.type === 'value') {
            if (action.negation) {
              expect(subject.value).not.toContain(action.value);
            } else {
              expect(subject.value).toContain(action.value);
            }
            break;
          }
          if (subject.type === 'locator') {
            if (action.negation) {
              await expect(subject.value).not.toContainText(action.value);
            } else {
              await expect(subject.value).toContainText(action.value);
            }
            break;
          }
          throw new Error('Handle subject is not implemented');
        case 'property':
          if (subject.type === 'handle') {
            const result = await page.evaluate(
              (ctx) => Object.prototype.hasOwnProperty.call(ctx.subject, ctx.property),
              { subject: subject.value, property: action.value },
            );
            if (action.negation) {
              expect(result).not.toBe(true);
            } else {
              expect(result).toBe(true);
            }
            break;
          }

          if (action.negation) {
            expect(subject.value).not.toHaveProperty(action.value);
          } else {
            expect(subject.value).toHaveProperty(action.value);
          }
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
            if (action.negation) {
              await expect(subject.value).not.toBeEmpty();
              break;
            } else {
              await expect(subject.value).toBeEmpty();
            }
            break;
          }
          throw new Error('Handle subject is not implemented');
        case 'equal':
          if (action.negation) {
            expect(subject.value).not.toBe(action.value);
            break;
          }

          expect(subject.value).toBe(action.value);
          break;
        case 'dom.checked':
          if (subject.type !== 'locator') {
            throw new Error('Locator expected');
          }
          if (action.negation) {
            await usingLooseMode(subject.value, (el) => expect(el).not.toBeChecked());
          } else {
            await usingLooseMode(subject.value, (el) => expect(el).toBeChecked());
          }
          break;
        default:
          throw new Error(`Unknown assertion type "${(action as Record<string, unknown>).name}"`);
      }
      break;
    case 'fill':
      if (subject.type !== 'locator') {
        throw new Error(`expected locator, got ${subject.type} ${subject.value}`);
      }
      await subject.value.fill(action.value);
      break;
    case 'clear':
      if (subject.type !== 'locator') {
        throw new Error(`expected locator, got ${subject.type} ${subject.value}`);
      }
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
      if (subject.type !== 'locator') {
        throw new Error(`count assertion expected locator, got ${subject.type} ${subject.value}`);
      }
      await usingLooseMode(subject.value, (el) => el.check());
      break;
    }
    case 'click':
      if (subject.type !== 'locator') {
        throw new Error(`count assertion expected locator, got ${subject.type} ${subject.value}`);
      }
      await subject.value.click();
      break;
    case 'title':
      return { type: 'value', value: await page.title() };
    case 'pause':
      await page.pause();
      break;
    case 'wait':
      await page.waitForTimeout(action.value);
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
