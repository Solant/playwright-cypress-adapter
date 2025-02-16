import { type Page } from '@playwright/test';

import { type Subject } from './subject';
import type { BaseAssert } from './assertions';

type PageAction<T> = {
  (subject: Subject, action: T, page: Page, aliasMap: Record<string, Subject>): Promise<Subject>,
};

export class Registry<T = unknown> {
  private map: Map<string, PageAction<unknown>>;

  private assertions: Map<string, PageAction<unknown>>;

  constructor(
    map = new Map<string, PageAction<unknown>>(),
    assertions = new Map<string, PageAction<unknown>>(),
  ) {
    this.map = map;
    this.assertions = assertions;
  }

  static compose<T1, T2>(a: Registry<T1>, b: Registry<T2>): Registry<T1 | T2> {
    return new Registry(
      new Map([...a.map, ...b.map]),
      new Map([...a.assertions, ...b.assertions]),
    );
  }

  action<Payload extends {
    type: string,
  }>(
    type: Payload['type'],
    callback: PageAction<Payload>,
  ): Registry<T extends { type: string } ? (T | Payload) : Payload> {
    this.map.set(type, callback as PageAction<unknown>);
    // @ts-expect-error type safe builder
    return this;
  }

  assertion<Payload extends { name: string }>(
    name: Payload['name'],
    callback: PageAction<Payload & BaseAssert>,
  ): Registry<T extends { type: string } ? (T | (Payload & BaseAssert)) : (Payload & BaseAssert)> {
    this.assertions.set(name, callback as PageAction<unknown>);
    // @ts-expect-error type safe builder
    return this;
  }

  evaluateAction(action: T, subject: Subject, page: Page, aliasMap: Record<string, Subject>) {
    // @ts-expect-error get action type
    const type = action.type as string;

    if (type === 'assertion') {
      const { name } = (action as BaseAssert);
      const fn = this.assertions.get(name);
      if (!fn) {
        throw new Error(`Unknown assertion "${name}"`);
      }

      return fn.call(null, subject, action, page, aliasMap);
    }

    const fn = this.map.get(type);
    if (!fn) {
      throw new Error(`Unknown action "${type}"`);
    }

    return fn.call(null, subject, action, page, aliasMap);
  }
}

export type InferActions<T> = T extends Registry<infer T1> ? T1 : never;
