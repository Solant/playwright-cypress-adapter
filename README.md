# playwright-cypress-adapter

A brief description of what this project does and who it's for

## Usage

Install module with you favorite package manager

```shell
# pnpm
pnpm add -D playwright-cypress-adapter

# npm
npm install -D playwright-test-adapter

# yarn
yarn add -D playwright-test-adapter
```

Change playwright config to use cypress test cases

```javascript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ...
  testMatch: /.*cy.js/,
});
```

Prepend your cypress test cases with

```javascript
// my-test-case.cy.js
import { setup } from 'playwright-cypress-adapter';

setup();
```

And now you can run your tests with playwright. Check project [playwright.config.ts](./playwright.config.ts)
and [package.json](./package.json) scripts to see additional configurations.

## FAQ

#### What commands are supported?

Currently, adapter can successfully translate basic `todo.cy.js` test case into playwright test runner. This *might* be
enough for simple projects, but I highly doubt so. If you find this project useful, make sure to star it and provide the
feedback on what cypress actions are needed for your use cases.

#### Can I still run modified test cases in cypress?

Yes, project uses [conditional exports](https://nodejs.org/api/packages.html#conditional-exports) to
provide [mocked](./dist/noop.js) module for cypress that doesn't modify any globals.

#### Are there any compatibility issues?

Yes, some APIs with similar names are very different between cypress and playwright.
See [compatibility](./COMPATIBILITY.md) notes.

#### Are you copying cypress source code?

No cypress source code is copied. But for the testing purposes project uses cypress basic examples.
