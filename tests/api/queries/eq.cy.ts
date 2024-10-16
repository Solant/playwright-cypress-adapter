import { setup } from '../../../src';

setup();

describe('.eq()', () => {
  it('basic', () => {
    cy.visit('https://example.cypress.io/todo');
    cy.get('label').eq(2).should('contain', 'Walk the dog');
  })

  it('index from end', () => {
    cy.visit('https://example.cypress.io/todo');
    cy.get('label').eq(-1).should('contain', 'Walk the dog');
  })
})
