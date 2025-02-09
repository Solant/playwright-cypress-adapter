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

let queue: Array<Action> = [];

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

function expectWrapper<T>(arg: T, negation?: boolean) {
  return negation ? expect(arg).not : expect(arg);
}

export type LocatorSubject = { type: 'locator', value: Locator };

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
