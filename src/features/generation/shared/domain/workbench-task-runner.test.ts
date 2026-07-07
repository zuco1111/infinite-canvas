import { describe, expect, it } from 'vitest';

import { runImmediateWorkbenchBatch, runPollingWorkbenchTask } from './workbench-task-runner';

describe('workbench-task-runner', () => {
  it('runs immediate batches and returns a summary', async () => {
    const summary = await runImmediateWorkbenchBatch({
      count: 3,
      runSlot: async (index) => {
        if (index === 1) throw new Error('failed');
        return index;
      },
    });

    expect(summary.successItems).toEqual([0, 2]);
    expect(summary.failCount).toBe(1);
    expect(summary.errors).toEqual(['failed']);
  });

  it('polls until a task is completed', async () => {
    type State = { status: 'pending' } | { status: 'completed'; value: number };
    let attempts = 0;

    const state = await runPollingWorkbenchTask<State, Extract<State, { status: 'completed' }>>({
      poll: async () => {
        attempts += 1;
        return attempts >= 2 ? { status: 'completed', value: 7 } : { status: 'pending' };
      },
      isCompleted: (state): state is Extract<State, { status: 'completed' }> =>
        state.status === 'completed',
      isFailed: () => false,
      getFailureMessage: () => 'failed',
      getDelayMs: () => 0,
      maxAttempts: 3,
    });

    expect(state.value).toBe(7);
    expect(attempts).toBe(2);
  });
});
