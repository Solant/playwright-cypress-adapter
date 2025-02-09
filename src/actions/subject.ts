import { JSHandle, Locator } from '@playwright/test';

export type LocatorSubject = { type: 'locator', value: Locator };

export type Subject =
  LocatorSubject
  | { type: 'value', value: unknown }
  | { type: 'handle', value: JSHandle };

export function assertLocator(arg: Subject): asserts arg is LocatorSubject {
  if (arg.type !== 'locator') {
    throw new Error(`Expected Locator subject, got ${arg.type}`);
  }
}

export function handleSubject(value: JSHandle): Subject {
  return { type: 'handle', value };
}

export function valueSubject(value: unknown): Subject {
  return { type: 'value', value };
}
