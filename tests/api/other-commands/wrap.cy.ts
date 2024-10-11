import { setup } from '../../../src';

setup();

describe('.wrap()', () => {
  it('simple value', () => {
    cy.wrap({ hello: 'world' }).should('have.property', 'hello');
  })

  it('promise', () => {
    cy.wrap(Promise.resolve({ hello: 'world' })).should('have.property', 'hello');
  });
})
