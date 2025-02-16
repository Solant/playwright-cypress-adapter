import { type actionRegistry, type InferActions } from './registry';

export type Actions = InferActions<typeof actionRegistry>;

let queue: Array<Actions> = [];

export function resetQueue() {
  queue = [];
}

export function cloneQueue(): Array<Actions> {
  return [...queue];
}

export function pushQueue(action: Actions) {
  queue.push(action);
}

export function inspectQueue(index: number): Actions | undefined {
  if (index >= 0) {
    return queue[index];
  }
  return queue[queue.length + index];
}

export function replaceQueue(index: number, action: Actions) {
  if (index >= 0) {
    queue[index] = action;
  } else {
    queue[queue.length + index] = action;
  }
}
