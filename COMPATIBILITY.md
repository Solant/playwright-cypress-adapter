# Compatibility

- ✅ Supported
- ⚠️ Partial support
- 🕓 Not implemented yet
- ⭕ Not supported (might be too big for current scope, or very tricky one to handle)

## Queries

| Command                                                              | Basic syntax | Arguments | Notes                                |
|----------------------------------------------------------------------|:------------:|:---------:|--------------------------------------|
| [.as()](https://docs.cypress.io/api/commands/as)                     |      ⚠️      |    ⚠️     | Supports wrapped values and elements |
| [.children()](https://docs.cypress.io/api/commands/children)         |      ✅       |    🕓     |                                      |
| [.closest()](https://docs.cypress.io/api/commands/closest)           |      🕓      |    🕓     |                                      |
| [.contains()](https://docs.cypress.io/api/commands/contains)         |      ✅       |    🕓     |                                      |
| [.document()](https://docs.cypress.io/api/commands/document)         |      🕓      |    🕓     |                                      |
| [.eq()](https://docs.cypress.io/api/commands/eq)                     |      ✅       |    🕓     |                                      |
| [.filter()](https://docs.cypress.io/api/commands/filter)             |      ✅       |    🕓     |                                      |
| [.find()](https://docs.cypress.io/api/commands/find)                 |      ✅       |    🕓     |                                      |
| [.first()](https://docs.cypress.io/api/commands/first)               |      ✅       |    🕓     |                                      |
| [.focused()](https://docs.cypress.io/api/commands/focused)           |      🕓      |    🕓     |                                      |
| [.get()](https://docs.cypress.io/api/commands/get)                   |      ✅       |    🕓     |                                      |
| [.hash()](https://docs.cypress.io/api/commands/hash)                 |      🕓      |    🕓     |                                      |
| [.invoke()](https://docs.cypress.io/api/commands/invoke)             |      🕓      |    🕓     |                                      |
| [.its()](https://docs.cypress.io/api/commands/its)                   |      🕓      |    🕓     |                                      |
| [.last()](https://docs.cypress.io/api/commands/last)                 |      ✅       |    🕓     |                                      |
| [.location()](https://docs.cypress.io/api/commands/location)         |      🕓      |    🕓     |                                      |
| [.next()](https://docs.cypress.io/api/commands/next)                 |      ✅       |    🕓     |                                      |
| [.nextAll()](https://docs.cypress.io/api/commands/nextall)           |      ⚠️      |    🕓     | selector argument is not implemented |
| [.nextUntil()](https://docs.cypress.io/api/commands/nextuntil)       |      🕓      |    🕓     |                                      |
| [.not()](https://docs.cypress.io/api/commands/not)                   |      ✅       |    🕓     |                                      |
| [.parent()](https://docs.cypress.io/api/commands/parent)             |      🕓      |    🕓     |                                      |
| [.parents()](https://docs.cypress.io/api/commands/parents)           |      ✅       |    🕓     |                                      |
| [.parentsUntil()](https://docs.cypress.io/api/commands/parentsuntil) |      🕓      |    🕓     |                                      |
| [.prev()](https://docs.cypress.io/api/commands/prev)                 |      ⚠️      |    🕓     | selector argument is not implemented |
| [.prevAll()](https://docs.cypress.io/api/commands/prevall)           |      ⚠️      |    🕓     | selector argument is not implemented |
| [.prevUntil()](https://docs.cypress.io/api/commands/prevuntil)       |      🕓      |    🕓     |                                      |
| [.readFile()](https://docs.cypress.io/api/commands/readfile)         |      🕓      |    🕓     |                                      |
| [.root()](https://docs.cypress.io/api/commands/root)                 |      🕓      |    🕓     |                                      |
| [.shadow()](https://docs.cypress.io/api/commands/shadow)             |      🕓      |    🕓     |                                      |
| [.siblings()](https://docs.cypress.io/api/commands/siblings)         |      ⚠️      |    🕓     | selector argument is not implemented |
| [.title()](https://docs.cypress.io/api/commands/title)               |      ✅       |     -     | -                                    |
| [.url()](https://docs.cypress.io/api/commands/url)                   |      🕓      |    🕓     |                                      |
| [.window()](https://docs.cypress.io/api/commands/window)             |      🕓      |    🕓     |                                      |

## Assertions

## Actions

| Command                                                                  | Basic syntax | Arguments | Notes                       |
|--------------------------------------------------------------------------|:------------:|:---------:|-----------------------------|
| [.check()](https://docs.cypress.io/api/commands/check)                   |      ✅       |    🕓     |                             |
| [.clear()](https://docs.cypress.io/api/commands/clear)                   |      🕓      |    🕓     |                             |
| [.click()](https://docs.cypress.io/api/commands/click)                   |      ✅       |    🕓     | [1](#1-forcing-interaction) | 
| [.dblclick()](https://docs.cypress.io/api/commands/dblclick)             |      🕓      |    🕓     |                             |
| [.rightclick()](https://docs.cypress.io/api/commands/rightclick)         |      🕓      |    🕓     |                             |
| [.scrollIntoView()](https://docs.cypress.io/api/commands/scrollIntoView) |      🕓      |    🕓     |                             |
| [.scrollTo()](https://docs.cypress.io/api/commands/scrollTo)             |      🕓      |    🕓     |                             |
| [.select()](https://docs.cypress.io/api/commands/select)                 |      🕓      |    🕓     |                             |
| [.selectFile()](https://docs.cypress.io/api/commands/selectFile)         |      🕓      |    🕓     |                             |
| [.trigger()](https://docs.cypress.io/api/commands/trigger)               |      🕓      |    🕓     |                             |
| [.type()](https://docs.cypress.io/api/commands/type)                     |     ️ ✅      |    🕓     | [1](#1-forcing-interaction) |
| [.uncheck()](https://docs.cypress.io/api/commands/uncheck)               |      🕓      |    🕓     |                             |

## Assertions

| Command                                                            | .should() | expect() | Notes              |
|--------------------------------------------------------------------|:---------:|:--------:|--------------------|
| [Assertions](https://docs.cypress.io/guides/references/assertions) |    ⚠️     |    ⭕     | [2](#2-assertions) |

## Other commands

| Command                                                                                   | Basic syntax | Arguments | Notes                                      |
|-------------------------------------------------------------------------------------------|:------------:|:---------:|--------------------------------------------|
| [.blur()](https://docs.cypress.io/api/commands/blur)                                      |      🕓      |    🕓     |                                            |
| [.clearAllCookies()](https://docs.cypress.io/api/commands/clearallcookies)                |      🕓      |    🕓     |                                            |
| [.clearAllLocalStorage()](https://docs.cypress.io/api/commands/clearalllocalstorage)      |      🕓      |    🕓     |                                            |
| [.clearAllSessionStorage()](https://docs.cypress.io/api/commands/clearallsessionstorage/) |      🕓      |    🕓     |                                            |
| [.clearCookie()](https://docs.cypress.io/api/commands/clearcookie)                        |      🕓      |    🕓     |                                            |
| [.clearCookies()](https://docs.cypress.io/api/commands/clearcookies)                      |      🕓      |    🕓     |                                            |
| [.clearLocalStorage()](https://docs.cypress.io/api/commands/clearlocalstorage)            |      🕓      |    🕓     |                                            |
| [.clock()](https://docs.cypress.io/api/commands/clock)                                    |      🕓      |    🕓     |                                            |
| [.debug()](https://docs.cypress.io/api/commands/debug)                                    |      ✅       |     -     |                                            |
| [.each()](https://docs.cypress.io/api/commands/each)                                      |      🕓      |    🕓     |                                            |
| [.end()](https://docs.cypress.io/api/commands/end)                                        |      🕓      |    🕓     |                                            |
| [.exec()](https://docs.cypress.io/api/commands/exec)                                      |      🕓      |    🕓     |                                            |
| [.fixture()](https://docs.cypress.io/api/commands/fixture)                                |      🕓      |    🕓     |                                            |
| [.focus()](https://docs.cypress.io/api/commands/focus)                                    |      🕓      |    🕓     |                                            |
| [.getAllCookies()](https://docs.cypress.io/api/commands/getallcookies)                    |      🕓      |    🕓     |                                            |
| [.getAllLocalStorage()](https://docs.cypress.io/api/commands/getalllocalstorage)          |      🕓      |    🕓     |                                            |
| [.getAllSessionStorage()](https://docs.cypress.io/api/commands/getallsessionstorage)      |      🕓      |    🕓     |                                            |
| [.getCookie()](https://docs.cypress.io/api/commands/getcookie)                            |      🕓      |    🕓     |                                            |
| [.getCookies()](https://docs.cypress.io/api/commands/getcookies)                          |      🕓      |    🕓     |                                            |
| [.go()](https://docs.cypress.io/api/commands/go)                                          |      🕓      |    🕓     |                                            |
| [.hover()](https://docs.cypress.io/api/commands/hover)                                    |      🕓      |    🕓     |                                            |
| [.intercept()](https://docs.cypress.io/api/commands/intercept)                            |      🕓      |    🕓     |                                            |
| [.log()](https://docs.cypress.io/api/commands/log)                                        |      🕓      |    🕓     |                                            |
| [.mount()](https://docs.cypress.io/api/commands/mount)                                    |      🕓      |    🕓     |                                            |
| [.origin()](https://docs.cypress.io/api/commands/origin)                                  |      🕓      |    🕓     |                                            |
| [.pause()](https://docs.cypress.io/api/commands/pause)                                    |      ✅       |     -     |                                            |
| [.reload()](https://docs.cypress.io/api/commands/reload)                                  |      🕓      |    🕓     |                                            |
| [.request()](https://docs.cypress.io/api/commands/request)                                |      🕓      |    🕓     |                                            |
| [.screenshot()](https://docs.cypress.io/api/commands/screenshot)                          |      🕓      |    🕓     |                                            |
| [.session()](https://docs.cypress.io/api/commands/session)                                |      🕓      |    🕓     |                                            |
| [.setCookie()](https://docs.cypress.io/api/commands/setcookie)                            |      🕓      |    🕓     |                                            |
| [.spread()](https://docs.cypress.io/api/commands/spread)                                  |      🕓      |    🕓     |                                            |
| [.spy()](https://docs.cypress.io/api/commands/spy)                                        |      🕓      |    🕓     |                                            |
| [.stub()](https://docs.cypress.io/api/commands/stub)                                      |      🕓      |    🕓     |                                            |
| [.submit()](https://docs.cypress.io/api/commands/submit)                                  |      🕓      |    🕓     |                                            |
| [.task()](https://docs.cypress.io/api/commands/task)                                      |      🕓      |    🕓     |                                            |
| [.then()](https://docs.cypress.io/api/commands/then)                                      |      🕓      |    🕓     |                                            |
| [.tick()](https://docs.cypress.io/api/commands/tick)                                      |      🕓      |    🕓     |                                            |
| [.viewport()](https://docs.cypress.io/api/commands/viewport)                              |      🕓      |    🕓     |                                            |
| [.visit()](https://docs.cypress.io/api/commands/visit)                                    |      ✅       |    🕓     |                                            |
| [.wait()](https://docs.cypress.io/api/commands/wait)                                      |      ⚠       |    🕓     | Waiting for aliases is not implemented yet |
| [.within()](https://docs.cypress.io/api/commands/within)                                  |      🕓      |    🕓     |                                            |
| [.wrap()](https://docs.cypress.io/api/commands/wrap)                                      |      ⚠️      |     -     | Only JS values and promises                |
| [.writeFile()](https://docs.cypress.io/api/commands/writefile)                            |      🕓      |    🕓     |                                            |

## Cypress API

| Command                                                                                         | Basic syntax | Arguments | Notes |
|-------------------------------------------------------------------------------------------------|:------------:|:---------:|-------|
| [Catalog of Events](https://docs.cypress.io/api/cypress-api/catalog-of-events)                  |      🕓      |    🕓     |       |
| [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)                      |      🕓      |    🕓     |       |
| [Custom Queries](https://docs.cypress.io/api/cypress-api/custom-queries)                        |      🕓      |    🕓     |       |
| [Cypress.arch](https://docs.cypress.io/api/cypress-api/arch)                                    |      ✅       |     -     |       |
| [Cypress.browser()](https://docs.cypress.io/api/cypress-api/browser)                            |      🕓      |    🕓     |       |
| [Cypress.config()](https://docs.cypress.io/api/cypress-api/config)                              |      🕓      |    🕓     |       |
| [Cypress.Cookies()](https://docs.cypress.io/api/cypress-api/cookies)                            |      🕓      |    🕓     |       |
| [Cypress.currentRetry()](https://docs.cypress.io/api/cypress-api/currentretry)                  |      🕓      |    🕓     |       |
| [Cypress.currentTest()](https://docs.cypress.io/api/cypress-api/currenttest)                    |      🕓      |    🕓     |       |
| [Cypress.log()](https://docs.cypress.io/api/cypress-api/cypress-log)                            |      🕓      |    🕓     |       |
| [Cypress.dom()](https://docs.cypress.io/api/cypress-api/dom)                                    |      🕓      |    🕓     |       |
| [Cypress.ensure()](https://docs.cypress.io/api/cypress-api/ensure)                              |      🕓      |    🕓     |       |
| [Cypress.env()](https://docs.cypress.io/api/cypress-api/env)                                    |      🕓      |    🕓     |       |
| [Cypress.isBrowser()](https://docs.cypress.io/api/cypress-api/isbrowser)                        |      🕓      |    🕓     |       |
| [Cypress.isCy()](https://docs.cypress.io/api/cypress-api/iscy)                                  |      🕓      |    🕓     |       |
| [Cypress.Keyboard()](https://docs.cypress.io/api/cypress-api/keyboard-api)                      |      🕓      |    🕓     |       |
| [Cypress.platform](https://docs.cypress.io/api/cypress-api/platform)                            |      ✅       |     -     |       |
| [Cypress.require()](https://docs.cypress.io/api/cypress-api/require)                            |      🕓      |    🕓     |       |
| [Cypress.Screenshot()](https://docs.cypress.io/api/cypress-api/screenshot-api)                  |      🕓      |    🕓     |       |
| [Cypress.SelectorPlayground()](https://docs.cypress.io/api/cypress-api/selector-playground-api) |      🕓      |    🕓     |       |
| [Cypress.session()](https://docs.cypress.io/api/cypress-api/session)                            |      🕓      |    🕓     |       |
| [Cypress.spec()](https://docs.cypress.io/api/cypress-api/spec)                                  |      🕓      |    🕓     |       |
| [Cypress.testingType()](https://docs.cypress.io/api/cypress-api/testing-type)                   |      🕓      |    🕓     |       |
| [Cypress.version](https://docs.cypress.io/api/cypress-api/version)                              |      ✅       |     -     |       |

### 1. Forcing interaction

[Cypress](https://docs.cypress.io/guides/core-concepts/interacting-with-elements#Forcing)
[Playwright](https://playwright.dev/docs/input#forcing-the-click)

Playwright force flag simply omits checks if element is visible and interactive, while cypress also emits an Event on
the target element. Thus, in some cases, playwright action with `force` flag enabled, won't actually do anything.

### 2. Assertions

`.should()` assertions are supported (some of them might be missing), but there are just too many of them for this
list (the whole chai BDD list).

`expect()` assertions are not supported because their chained API is trickier to reimplement and as they rely too much
on synchronous browser APIs.
