import type { Subject } from './subject';
import { actionRegistry } from './actions';
import { assertionRegistry } from './assertions';
import { Registry } from './registry';

const registry = Registry.compose(actionRegistry, assertionRegistry);

export function evaluateAction(...args: Parameters<typeof registry['evaluateAction']>): Promise<Subject> {
  return registry.evaluateAction(...args);
}

export {
  pushQueue, type Actions, resetQueue, cloneQueue,
} from './queue';

export type { Subject } from './subject';

export type { ClickActionModifiers, ClickActionPosition } from './actions';
