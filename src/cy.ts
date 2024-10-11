import {
  pushQueue,
} from './actions';

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

  first() {
    pushQueue({ type: 'locator', selector: [{ modifier: 'first' }], root: this.root });
    return this.selfOrChild();
  }

  last() {
    pushQueue({ type: 'locator', selector: [{ modifier: 'last' }], root: this.root });
    return this.selfOrChild();
  }

  contains(value: string) {
    pushQueue({ type: 'locator', selector: [{ modifier: 'contains', value }], root: this.root });
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

  should(assertion: string, value: string | number) {
    switch (assertion) {
      case 'have.length':
      case 'not.have.length': {
        pushQueue({
          type: 'assertion',
          name: 'dom.length',
          value: value as number,
          negation: assertion.startsWith('not'),
        });
        break;
      }
      case 'have.text':
      case 'not.have.text': {
        pushQueue({
          type: 'assertion',
          name: 'dom.text',
          value: value as string,
          negation: assertion.startsWith('not'),
        });
        break;
      }
      case 'have.class':
      case 'not.have.class': {
        pushQueue({
          type: 'assertion',
          name: 'dom.class',
          value: value as string,
          negation: assertion.startsWith('not'),
        });
        break;
      }
      case 'exist':
      case 'not.exist': {
        pushQueue({
          type: 'assertion',
          name: 'dom.exist',
          negation: assertion.startsWith('not'),
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
