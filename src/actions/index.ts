import { actionRegistry } from './registry';
import type { Subject } from './subject';

export function evaluateAction(...args: Parameters<typeof actionRegistry['evaluateAction']>): Promise<Subject> {
  return actionRegistry.evaluateAction(...args);
}

export {
  pushQueue, type Actions, resetQueue, cloneQueue,
} from './queue';

export type { Subject } from './subject';

export type { ClickActionModifiers, ClickActionPosition } from './registry';
