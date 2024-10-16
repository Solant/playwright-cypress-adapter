type Timeouts = 'command' | 'exec' | 'task' | 'pageLoad' | 'request' | 'response';

const DEFAULT_TIMEOUTS: { [key in Timeouts]: number } = {
  command: 4_000,
  exec: 60_000,
  task: 60_000,
  pageLoad: 60_000,
  request: 5_000,
  response: 30_000,
};

export function getTimeout(timeout: Timeouts, value: number | undefined): number {
  if (value !== undefined) {
    return value;
  }

  return DEFAULT_TIMEOUTS[timeout];
}
