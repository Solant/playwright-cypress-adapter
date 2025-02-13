import {
  expect, test, describe, beforeEach,
} from 'vitest';

import { cy } from './cy';
import { cloneQueue, resetQueue } from './actions';

beforeEach(() => {
  resetQueue();
});

describe('cy.visit()', () => {
  test('simple url', () => {
    cy.visit('https://google.com');
    expect(cloneQueue()).toEqual([{ type: 'navigate', url: 'https://google.com' }]);
  });
});

describe('cy.get()', () => {
  test('simple locator', () => {
    cy.visit('https://google.com').get('.input');
    expect(cloneQueue()).toEqual([
      {
        type: 'navigate',
        url: 'https://google.com',
      },
      {
        root: false,
        type: 'locator',
        selector: ['.input'],
      },
    ]);
  });
});

describe('cy.type()', () => {
  test('simple type', () => {
    cy.visit('https://google.com').get('.input').type('Hello');
    expect(cloneQueue()).toEqual([
      {
        type: 'navigate',
        url: 'https://google.com',
      },
      {
        type: 'locator',
        root: false,
        selector: ['.input'],
      },
      {
        type: 'fill',
        value: 'Hello',
      },
    ]);
  });
});

describe('cy.should()', () => {
  test('have.length', () => {
    cy.visit('https://google.com').get('.input').should('have.length', 2);
    expect(cloneQueue()).toEqual([
      {
        type: 'navigate',
        url: 'https://google.com',
      },
      {
        type: 'locator',
        root: false,
        selector: ['.input'],
      },
      {
        type: 'assertion',
        name: 'dom.length',
        value: 2,
        negation: false,
      },
    ]);
  });
});
