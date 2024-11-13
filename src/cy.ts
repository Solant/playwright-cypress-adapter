import { arch, platform } from 'node:os';

import {
  ClickActionModifiers,
  ClickActionPosition,
  pushQueue,
} from './actions';

const LANGUAGE_CHAINS = [
  'to',
  'be',
  'been',
  'is',
  'that',
  'which',
  'and',
  'has',
  'have',
  'with',
  'at',
  'of',
  'same',
  'but',
  'does',
  'still',
  'also',
];

function parseBddChain(assertion: string): { negation: boolean, assertion: string } {
  let parts = assertion.split('.').filter((part) => !LANGUAGE_CHAINS.includes(part));

  const negation = parts.includes('not');
  parts = parts.filter((part) => part !== 'not');

  return { negation, assertion: parts[0] };
}

class Cy {
  // eslint-disable-next-line no-empty-function
  constructor(private root: boolean) {
  }

  private selfOrChild(): Cy {
    return this.root ? new Cy(false) : this;
  }

  visit(url: string) {
    pushQueue({ type: 'navigate', url });
    return this.selfOrChild();
  }

  get(selector: string) {
    pushQueue({ type: 'locator', selector: [selector], root: this.root });
    return this.selfOrChild();
  }

  title() {
    pushQueue({ type: 'title' });
    return this.selfOrChild();
  }

  debug() {
    pushQueue({ type: 'pause' });
    return this.selfOrChild();
  }

  pause() {
    pushQueue({ type: 'pause' });
    return this.selfOrChild();
  }

  wrap(value: unknown) {
    pushQueue({ type: 'subject', value });
    return this.selfOrChild();
  }

  children(query = '*') {
    if (this.root) {
      throw new Error('.children() cannot be chained off "cy"');
    }

    pushQueue({ type: 'locator', selector: [`:scope > ${query}`], root: this.root });
    return this.selfOrChild();
  }

  filter(query: string) {
    pushQueue({ type: 'locator', selector: [`:scope${query}`], root: this.root });
    return this.selfOrChild();
  }

  not(query: string) {
    pushQueue({ type: 'locator', selector: [`:scope:not(${query})`], root: this.root });
    return this.selfOrChild();
  }

  next(query = '*') {
    pushQueue({ type: 'locator', selector: [`:scope + ${query}`], root: this.root });
    return this.selfOrChild();
  }

  prev() {
    pushQueue({ type: 'locator', selector: ['xpath=/preceding-sibling::*[1]'], root: this.root });
    return this.selfOrChild();
  }

  prevAll() {
    pushQueue({ type: 'locator', selector: ['xpath=/preceding-sibling::*'], root: this.root });
    return this.selfOrChild();
  }

  nextAll() {
    pushQueue({ type: 'locator', selector: ['xpath=/following-sibling::*'], root: this.root });
    return this.selfOrChild();
  }

  siblings() {
    pushQueue({
      type: 'locator',
      selector: ['xpath=/following-sibling::* | /preceding-sibling::*'],
      root: this.root,
    });
    return this.selfOrChild();
  }

  first() {
    pushQueue({ type: 'locator', selector: [{ modifier: 'first' }], root: this.root });
    return this.selfOrChild();
  }

  last() {
    pushQueue({ type: 'locator', selector: [{ modifier: 'last' }], root: this.root });
    return this.selfOrChild();
  }

  contains(value: string, options?: { matchCase?: boolean }) {
    pushQueue({
      type: 'locator',
      selector: [{ modifier: 'contains', value, exact: options?.matchCase ?? true }],
      root: this.root,
    });
    return this.selfOrChild();
  }

  check() {
    pushQueue({ type: 'check', value: true });
    return this.selfOrChild();
  }

  uncheck() {
    pushQueue({ type: 'check', value: false });
    return this.selfOrChild();
  }

  // TODO: refactor
  dblclick(...args: Array<string | number | object | undefined>) {
    const [x, y] = args.filter((arg) => typeof arg === 'number');
    const position = args.find((arg) => typeof arg === 'string');
    const options = args.find((arg) => typeof arg === 'object');

    const modifiers: Array<ClickActionModifiers> = [];
    if (options) {
      if ('altKey' in options && options.altKey === true) {
        modifiers.push('Alt');
      }
      if ('ctrlKey' in options && options.ctrlKey === true) {
        modifiers.push('Control');
      }
      if ('metaKey' in options && options.metaKey === true) {
        modifiers.push('Meta');
      }
      if ('shiftKey' in options && options.shiftKey === true) {
        modifiers.push('Shift');
      }
    }

    pushQueue({
      type: 'click',
      position: position as ClickActionPosition || (x !== undefined ? { x, y } : undefined),
      double: true,
      button: 'left',
      force: (options && 'force' in options && options.force === true) || false,
      modifiers,
      multiple: (options && 'multiple' in options && options.multiple === true),
    });

    return this.selfOrChild();
  }

  scrollIntoView() {
    pushQueue({ type: 'scrollIntoView' });
    return this.selfOrChild();
  }

  scrollTo(position: string | number, y?: string | number) {
    if (typeof position === 'string' && !position.endsWith('%')) {
      pushQueue({ type: 'scrollTo', position: position as ClickActionPosition });
    } else {
      pushQueue({
        type: 'scrollTo',
        position: { x: position, y: y! },
      });
    }
    return this.selfOrChild();
  }

  trigger(event: string) {
    pushQueue({ type: 'dispatchEvent', event });
    return this.selfOrChild();
  }

  // TODO: refactor
  rightclick(...args: Array<string | number | object | undefined>) {
    const [x, y] = args.filter((arg) => typeof arg === 'number');
    const position = args.find((arg) => typeof arg === 'string');
    const options = args.find((arg) => typeof arg === 'object');

    const modifiers: Array<ClickActionModifiers> = [];
    if (options) {
      if ('altKey' in options && options.altKey === true) {
        modifiers.push('Alt');
      }
      if ('ctrlKey' in options && options.ctrlKey === true) {
        modifiers.push('Control');
      }
      if ('metaKey' in options && options.metaKey === true) {
        modifiers.push('Meta');
      }
      if ('shiftKey' in options && options.shiftKey === true) {
        modifiers.push('Shift');
      }
    }

    pushQueue({
      type: 'click',
      position: position as ClickActionPosition || (x !== undefined ? { x, y } : undefined),
      double: false,
      button: 'right',
      force: (options && 'force' in options && options.force === true) || false,
      modifiers,
      multiple: (options && 'multiple' in options && options.multiple === true),
    });

    return this.selfOrChild();
  }

  click(): Cy;
  click(options: Record<string, unknown>): Cy;
  click(position: string, options?: Record<string, unknown>): Cy;
  click(x: number, y: number, options?: Record<string, unknown>): Cy;
  click(...args: Array<string | number | object | undefined>): Cy {
    const [x, y] = args.filter((arg) => typeof arg === 'number');
    const position = args.find((arg) => typeof arg === 'string');
    const options = args.find((arg) => typeof arg === 'object');

    const modifiers: Array<ClickActionModifiers> = [];
    if (options) {
      if ('altKey' in options && options.altKey === true) {
        modifiers.push('Alt');
      }
      if ('ctrlKey' in options && options.ctrlKey === true) {
        modifiers.push('Control');
      }
      if ('metaKey' in options && options.metaKey === true) {
        modifiers.push('Meta');
      }
      if ('shiftKey' in options && options.shiftKey === true) {
        modifiers.push('Shift');
      }
    }

    pushQueue({
      type: 'click',
      position: position as ClickActionPosition || (x !== undefined ? { x, y } : undefined),
      double: false,
      button: 'left',
      force: (options && 'force' in options && options.force === true) || false,
      modifiers,
      multiple: (options && 'multiple' in options && options.multiple === true),
    });

    return this.selfOrChild();
  }

  as(name: string) {
    if (this.root) {
      throw new Error('.as() cannot be chained off "cy"');
    }

    pushQueue({ type: 'alias', name });
    return this.selfOrChild();
  }

  wait(value: number | string) {
    pushQueue({ type: 'wait', value: value as number });
    return this.selfOrChild();
  }

  window() {
    pushQueue({ type: 'handle', global: 'window' });
    return this.selfOrChild();
  }

  document() {
    pushQueue({ type: 'handle', global: 'document' });
    return this.selfOrChild();
  }

  hash() {
    return this.location('hash');
  }

  url() {
    return this.location('href');
  }

  location(key?: 'search' | 'hash' | 'host' | 'hostname' | 'href' | 'origin' | 'pathname' | 'port' | 'protocol') {
    pushQueue({ type: 'location', key });
    return this.selfOrChild();
  }

  parent() {
    pushQueue({ type: 'locator', selector: ['xpath=..'], root: this.root });
    return this.selfOrChild();
  }

  parents(selector: string) {
    pushQueue({ type: 'locator', selector: [`xpath=ancestor::${selector}`], root: this.root });
    return this.selfOrChild();
  }

  find(selector: string) {
    pushQueue({ type: 'locator', selector: [selector], root: this.root });
    return this.selfOrChild();
  }

  eq(index: number) {
    pushQueue({ type: 'locator', selector: [{ modifier: 'nth', value: index }], root: this.root });
    return this.selfOrChild();
  }

  and(assertionChain: string, value: string | number) {
    return this.should(assertionChain, value);
  }

  should(assertionChain: string, value: string | number) {
    const { assertion, negation } = parseBddChain(assertionChain);
    switch (assertion) {
      case 'length': {
        pushQueue({
          type: 'assertion',
          name: 'dom.length',
          value: value as number,
          negation,
        });
        break;
      }
      case 'text': {
        pushQueue({
          type: 'assertion',
          name: 'dom.text',
          value: value as string,
          negation,
        });
        break;
      }
      case 'class': {
        pushQueue({
          type: 'assertion',
          name: 'dom.class',
          value: value as string,
          negation,
        });
        break;
      }
      case 'exist': {
        pushQueue({
          type: 'assertion',
          name: 'dom.exist',
          negation,
        });
        break;
      }
      case 'include':
      case 'contain':
      case 'includes':
      case 'contains':
        pushQueue({
          type: 'assertion',
          name: 'include',
          value: value as string,
          negation,
        });
        break;
      case 'property':
        pushQueue({
          type: 'assertion',
          name: 'property',
          value: value as string,
          negation,
        });
        break;
      case 'empty':
        pushQueue({
          type: 'assertion',
          name: 'empty',
          negation,
        });
        break;
      case 'equal':
      case 'equals':
      case 'eq':
        pushQueue({
          type: 'assertion',
          name: 'equal',
          value,
          negation,
        });
        break;
      case 'checked':
        pushQueue({
          type: 'assertion',
          name: 'dom.checked',
          negation,
        });
        break;
      case 'value':
        pushQueue({
          type: 'assertion',
          name: 'dom.value',
          value: value.toString(),
          negation,
        });
        break;
      case 'visible':
        pushQueue({
          type: 'assertion',
          name: 'dom.visible',
          negation,
        });
        break;
      default: {
        throw new Error(`Unknown assertion "${assertion}"`);
      }
    }

    return this.selfOrChild();
  }

  type(value: string) {
    // TODO: remove
    const newValue = value.replace('{enter}', '');

    pushQueue({
      type: 'fill',
      value: newValue,
    });

    // TODO: remove
    if (value.endsWith('{enter}')) {
      pushQueue({
        type: 'keyboard',
        action: 'press',
        key: 'Enter',
      });
    }

    return this.selfOrChild();
  }

  clear() {
    if (this.root) {
      throw new Error('.clear() cannot be chained off "cy"');
    }
    pushQueue({ type: 'clear' });
    return this.selfOrChild();
  }
}

export const cy = new Cy(true);

export const Cypress = {
  isCy(arg: unknown) {
    return arg instanceof Cy;
  },
  arch: arch(),
  platform: platform(),
  version: '12.0.0',
};
