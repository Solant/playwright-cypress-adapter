import type { Subject } from './subject';
import { registry } from './queue';

export function evaluateAction(...args: Parameters<typeof registry['evaluateAction']>): Promise<Subject> {
  return registry.evaluateAction(...args);
}

export {
  pushQueue, type Actions, resetQueue, cloneQueue,
} from './queue';

export type { Subject } from './subject';

export type { ClickActionModifiers, ClickActionPosition } from './actions';
