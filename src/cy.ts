import {
  inspectQueue, pushQueue, replaceQueue,
} from './actions';

export const cy = {
  visit(url: string) {
    pushQueue({ type: 'navigate', url });
    return this;
  },
  get(selector: string) {
    pushQueue({ type: 'locator', selector: [selector] });
    return this;
  },
  first() {
    const action = inspectQueue(-1);
    if (action === undefined) {
      throw new Error('.first() cannot be chained off "cy"');
    }
    if (action.type === 'assertion') {
      pushQueue({
        type: 'locator',
        selector: [...action.selector, { modifier: 'first' }],
      });
      return this;
    }
    if (action.type !== 'locator') {
      throw new Error(`"${action.type}" action doesn't yield DOM element`);
    }

    replaceQueue(-1, {
      ...action,
      selector: [...action.selector, { modifier: 'first' }],
    });

    return this;
  },
  last() {
    const action = inspectQueue(-1);
    if (action === undefined) {
      throw new Error('.first() cannot be chained off "cy"');
    }

    // last() can be chained off assertion
    if (action.type === 'assertion') {
      pushQueue({ type: 'locator', selector: [...action.selector, { modifier: 'last' }] });
      return this;
    }

    if (action.type !== 'locator') {
      throw new Error(`"${action.type}" action doesn't yield DOM element`);
    }

    replaceQueue(-1, {
      ...action,
      selector: [...action.selector, { modifier: 'last' }],
    });

    return this;
  },
  contains(value: string) {
    pushQueue({ type: 'locator', selector: [{ modifier: 'contains', value }] });
    return this;
  },
  check() {
    const action = inspectQueue(-1);
    if (action === undefined) {
      throw new Error('.check() cannot be chained off "cy"');
    }
    if (action.type !== 'locator') {
      throw new Error(`"${action.type}" action doesn't yield DOM element`);
    }

    replaceQueue(-1, {
      type: 'check',
      selector: action.selector,
    });

    return this;
  },
  click() {
    const action = inspectQueue(-1);
    if (action === undefined) {
      throw new Error('.check() cannot be chained off "cy"');
    }
    if (action.type !== 'locator') {
      throw new Error(`"${action.type}" action doesn't yield DOM element`);
    }

    replaceQueue(-1, {
      type: 'click',
      selector: action.selector,
    });

    return this;
  },
  parent() {
    const action = inspectQueue(-1);
    if (action === undefined) {
      throw new Error('.parent() cannot be chained off "cy"');
    }
    if (action.type !== 'locator') {
      throw new Error(`"${action.type}" action doesn't yield DOM element`);
    }

    replaceQueue(-1, { type: 'locator', selector: [...action.selector, 'xpath=..'] });

    return this;
  },
  parents(selector: string) {
    const action = inspectQueue(-1);
    if (action === undefined) {
      throw new Error('.parents() cannot be chained off "cy"');
    }
    if (action.type !== 'locator') {
      throw new Error(`"${action.type}" action doesn't yield DOM element`);
    }

    replaceQueue(-1, { type: 'locator', selector: [...action.selector, `xpath=ancestor::${selector}`] });

    return this;
  },
  find(selector: string) {
    const action = inspectQueue(-1);
    if (action === undefined) {
      throw new Error('.find() cannot be chained off "cy"');
    }
    if (action.type !== 'locator') {
      throw new Error(`"${action.type}" action doesn't yield DOM element`);
    }

    replaceQueue(-1, { type: 'locator', selector: [...action.selector, selector] });

    return this;
  },
  should(assertion: string, value: string | number) {
    switch (assertion) {
      case 'have.length': {
        const action = inspectQueue(-1);
        if (action === undefined) {
          throw new Error('.should() cannot be chained off "cy"');
        }
        if (action.type !== 'locator') {
          throw new Error(`"${action.type}" action doesn't yield DOM element`);
        }

        replaceQueue(-1, {
          type: 'assertion',
          subject: 'locator',
          selector: action.selector,
          name: 'count',
          value: value as number,
        });
        break;
      }
      case 'have.text':
      case 'not.have.text': {
        const action = inspectQueue(-1);
        if (action === undefined) {
          throw new Error('.should() cannot be chained off "cy"');
        }
        if (action.type === 'assertion') {
          pushQueue({
            type: 'assertion',
            subject: 'locator',
            selector: [...action.selector],
            name: 'haveText',
            value: value as string,
            negation: assertion.startsWith('not'),
          });
          break;
        }
        if (action.type !== 'locator') {
          throw new Error(`"${action.type}" action doesn't yield DOM element`);
        }

        replaceQueue(-1, {
          type: 'assertion',
          subject: 'locator',
          selector: action.selector,
          name: 'haveText',
          value: value as string,
          negation: assertion.startsWith('not'),
        });
        break;
      }
      case 'have.class': {
        const action = inspectQueue(-1);
        if (action === undefined) {
          throw new Error('.should() cannot be chained off "cy"');
        }
        if (action.type !== 'locator') {
          throw new Error(`"${action.type}" action doesn't yield DOM element`);
        }

        replaceQueue(-1, {
          type: 'assertion',
          subject: 'locator',
          selector: action.selector,
          name: 'haveClass',
          value: value as string,
        });
        break;
      }
      case 'not.exist':
      case 'exist': {
        const action = inspectQueue(-1);
        if (action === undefined) {
          throw new Error('.should() cannot be chained off "cy"');
        }
        if (action.type !== 'locator') {
          throw new Error(`"${action.type}" action doesn't yield DOM element`);
        }

        replaceQueue(-1, {
          type: 'assertion',
          subject: 'locator',
          selector: action.selector,
          name: 'exists',
          negation: assertion.startsWith('not'),
        });
        break;
      }
      default: {
        throw new Error(`Unknown assertion "${assertion}"`);
      }
    }

    return this;
  },
  type(value: string) {
    const action = inspectQueue(-1);
    if (action === undefined) {
      throw new Error('.type() cannot be chained off "cy"');
    }
    if (action.type !== 'locator') {
      throw new Error(`"${action.type}" action doesn't yield DOM element`);
    }

    // TODO: remove
    const newValue = value.replace('{enter}', '');

    replaceQueue(-1, {
      type: 'fill',
      selector: action.selector,
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
  },
};
