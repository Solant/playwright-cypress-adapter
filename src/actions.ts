import { expect, Locator, Page } from '@playwright/test';

export type SpecialSelector = { modifier: 'first' } | { modifier: 'last' } | { modifier: 'contains', value: string };

export type Selector = Array<string | SpecialSelector>;

export type Action = {
  type: 'navigate',
  url: string
} | {
  type: 'locator',
  selector: Selector
} | {
  type: 'fill',
  selector: Selector,
  value: string,
} | {
  type: 'check',
  selector: Selector,
} | {
  type: 'click',
  selector: Selector,
} | {
  type: 'keyboard',
  action: 'press',
  key: string,
} | {
  type: 'assertion',
  subject: 'locator',
  selector: Selector,
  name: 'count',
  value: number
} | {
  type: 'assertion',
  subject: 'locator',
  selector: Selector,
  name: 'haveText',
  value: string,
  negation?: boolean
} | {
  type: 'assertion',
  subject: 'locator',
  selector: Selector,
  name: 'haveClass',
  value: string,
} | {
  type: 'assertion',
  subject: 'locator',
  selector: Selector,
  name: 'exists',
  negation?: boolean
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
    default:
      throw new Error(`Unknown selector modifier ${(selector as SpecialSelector).modifier}`);
  }
}

export function getLocator(page: Page, selector: Selector): Locator {
  let locator = resolveSelectorItem(page, selector[0]);

  for (let i = 1; i < selector.length; i += 1) {
    locator = resolveSelectorItem(locator, selector[i]);
  }

  return locator;
}

export async function evaluateAction(page: Page, action: Action) {
  switch (action.type) {
    case 'navigate':
      await page.goto(action.url);
      break;
    case 'assertion':
      switch (action.name) {
        case 'count':
          await expect(getLocator(page, action.selector)).toHaveCount(action.value);
          break;
        case 'haveText':
          if (action.negation) {
            await expect(getLocator(page, action.selector)).not.toHaveText(action.value);
          } else {
            await expect(getLocator(page, action.selector)).toHaveText(action.value);
          }
          break;
        case 'haveClass':
          await expect(getLocator(page, action.selector)).toHaveClass(new RegExp(action.value));
          break;
        case 'exists':
          if (action.negation) {
            await expect(getLocator(page, action.selector)).toBeHidden();
          } else {
            await expect(getLocator(page, action.selector)).toBeVisible();
          }
          break;
        default:
          throw new Error(`Unknown assertion type "${(action as Record<string, string>).name}"`);
      }
      break;
    case 'fill':
      await getLocator(page, action.selector).fill(action.value);
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
      await getLocator(page, action.selector).check();
      break;
    case 'click':
      await getLocator(page, action.selector).click();
      break;
    default:
      throw new Error(`Action type "${action.type}" is not implemented`);
  }
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
