import { setup } from '../../../src';

setup();

describe('.debug()', () => {
  it('basic usage', () => {
    cy.visit('https://example.cypress.io/todo').get('button').debug();
  })
})
