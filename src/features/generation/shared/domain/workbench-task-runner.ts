import { summarizeSettledBatch, type WorkbenchBatchSummary } from './workbench-results';

export async function runImmediateWorkbenchBatch<TItem>({
  count,
  runSlot,
}: {
  count: number;
  runSlot: (index: number) => Promise<TItem>;
}): Promise<WorkbenchBatchSummary<TItem>> {
  const tasks = Array.from({ length: count }, (_, index) => runSlot(index));
  return summarizeSettledBatch(await Promise.allSettled(tasks), count);
}

export async function runPollingWorkbenchTask<TState, TCompleted extends TState>({
  poll,
  isCompleted,
  isFailed,
  getFailureMessage,
  getDelayMs,
  maxAttempts = 120,
  timeoutMessage = '生成超时，请稍后重试',
  signal,
}: {
  poll: () => Promise<TState>;
  isCompleted: (state: TState) => state is TCompleted;
  isFailed: (state: TState) => boolean;
  getFailureMessage: (state: TState) => string;
  getDelayMs: (attempt: number) => number;
  maxAttempts?: number;
  timeoutMessage?: string;
  signal?: AbortSignal;
}): Promise<TCompleted> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const state = await poll();
    if (isCompleted(state)) return state;
    if (isFailed(state)) throw new Error(getFailureMessage(state));
    if (attempt === maxAttempts - 1) throw new Error(timeoutMessage);
    await waitForWorkbenchTask(getDelayMs(attempt), signal);
  }

  throw new Error(timeoutMessage);
}

export function waitForWorkbenchTask(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = globalThis.setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        globalThis.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}
