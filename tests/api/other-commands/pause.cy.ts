import { setup } from '../../../src';

setup();

describe('.pause()', () => {
  it('basic usage', () => {
    cy.visit('https://example.cypress.io/todo').get('button').pause();
  })
})
