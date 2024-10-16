import { arch, platform } from 'node:os';

import {
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
    pushQueue({ type: 'check' });
    return this.selfOrChild();
  }

  click() {
    pushQueue({ type: 'click' });
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
