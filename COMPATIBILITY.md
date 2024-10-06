# Compatibility

## Forcing interaction
[Cypress](https://docs.cypress.io/guides/core-concepts/interacting-with-elements#Forcing)
[Playwright](https://playwright.dev/docs/input#forcing-the-click)

Playwright force flag simply omits checks if element is visible and interactive, while cypress also emits an Event on the target element. Thus, in some cases, playwright action with `force` flag enabled, won't actually do anything.
