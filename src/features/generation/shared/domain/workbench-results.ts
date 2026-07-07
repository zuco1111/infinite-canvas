import { nanoid } from 'nanoid';

export type WorkbenchResultStatus = 'pending' | 'success' | 'failed';

export type WorkbenchResultBase = {
  id: string;
  status: WorkbenchResultStatus;
  error?: string;
};

export type WorkbenchResult<TMedia, TMediaKey extends string> = WorkbenchResultBase &
  Partial<Record<TMediaKey, TMedia>>;

export type WorkbenchBatchSummary<TItem> = {
  successItems: TItem[];
  successCount: number;
  failCount: number;
  errors: string[];
  firstError?: unknown;
};

export function createPendingWorkbenchResults<TResult extends WorkbenchResultBase>(count: number) {
  return Array.from({ length: Math.max(0, count) }, () => ({
    id: nanoid(),
    status: 'pending',
  })) as TResult[];
}

export function updateWorkbenchResultAt<TResult extends WorkbenchResultBase>(
  results: TResult[],
  index: number,
  next: Partial<TResult>,
) {
  return results.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item));
}

export function summarizeSettledBatch<TItem>(
  results: PromiseSettledResult<TItem>[],
  expectedCount = results.length,
): WorkbenchBatchSummary<TItem> {
  const successItems = results
    .filter((item): item is PromiseFulfilledResult<TItem> => item.status === 'fulfilled')
    .map((item) => item.value);
  const rejected = results.filter(
    (item): item is PromiseRejectedResult => item.status === 'rejected',
  );

  return {
    successItems,
    successCount: successItems.length,
    failCount: Math.max(0, expectedCount - successItems.length),
    errors: rejected.map((item) => readWorkbenchErrorMessage(item.reason)),
    firstError: rejected[0]?.reason,
  };
}

export function readWorkbenchErrorMessage(error: unknown, fallback = '生成失败') {
  return error instanceof Error ? error.message : fallback;
}
