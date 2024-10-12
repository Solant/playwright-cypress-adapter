import { expect, Locator, Page } from '@playwright/test';

export type SpecialSelector = { modifier: 'first' } | { modifier: 'last' } | { modifier: 'contains', value: string } | {
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
};

let queue: Array<Action> = [];

function resolveSelectorItem(parent: Locator | Page, selector: Selector[number]): Locator {
  if (typeof selector === 'string') {
    return parent.locator(selector);
  }
  switch (selector.modifier) {
    case 'contains':
      return parent.getByText(selector.value, { exact: true });
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

export type Subject = { type: 'locator', value: Locator } | { type: 'value', value: unknown };

export async function evaluateAction(
  page: Page,
  action: Action,
  subject: Subject,
): Promise<Subject> {
  switch (action.type) {
    case 'subject': {
      if (action.value instanceof Promise) {
        return { type: 'value', value: await action.value };
      }
      return { type: 'value', value: action.value };
    }
    case 'locator': {
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
        case 'include':
          if (subject.type === 'value') {
            if (action.negation) {
              expect(subject.value).not.toContain(action.value);
            } else {
              expect(subject.value).toContain(action.value);
            }
          } else if (action.negation) {
            await expect(subject.value).not.toContainText(action.value);
          } else {
            await expect(subject.value).toContainText(action.value);
          }
          break;
        case 'property':
          if (action.negation) {
            expect(subject.value).not.toHaveProperty(action.value);
          } else {
            expect(subject.value).toHaveProperty(action.value);
          }
          break;
        default:
          throw new Error(`Unknown assertion type "${(action as Record<string, unknown>).name}"`);
      }
      break;
    case 'fill':
      if (subject.type !== 'locator') {
        throw new Error(`count assertion expected locator, got ${subject.type} ${subject.value}`);
      }
      await subject.value.fill(action.value);
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
    case 'check':
      if (subject.type !== 'locator') {
        throw new Error(`count assertion expected locator, got ${subject.type} ${subject.value}`);
      }
      await subject.value.check();
      break;
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
