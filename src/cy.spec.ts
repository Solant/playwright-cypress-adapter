import {
  expect, test, describe, beforeEach,
} from 'vitest';

import { cy } from './cy';
import { cloneQueue, type Action, resetQueue } from './actions';

beforeEach(() => {
  resetQueue();
});

describe('cy.visit()', () => {
  test('simple url', () => {
    cy.visit('https://google.com');
    expect(cloneQueue()).toEqual([{ type: 'navigate', url: 'https://google.com' }] satisfies Action[]);
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
        type: 'locator',
        selector: ['.input'],
      },
    ] satisfies Action[]);
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
        type: 'fill',
        selector: ['.input'],
        value: 'Hello',
      },
    ] satisfies Action[]);
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
        type: 'assertion',
        subject: 'locator',
        name: 'count',
        selector: ['.input'],
        value: 2,
      },
    ] satisfies Action[]);
  });
});
