import { describe, expect, it } from 'vitest';

import {
  summarizeSettledBatch,
  updateWorkbenchResultAt,
  type WorkbenchResult,
} from './workbench-results';

type ImageResult = WorkbenchResult<{ id: string }, 'image'>;

describe('workbench-results', () => {
  it('summarizes settled batch results', () => {
    const summary = summarizeSettledBatch(
      [
        { status: 'fulfilled', value: { id: 'a' } },
        { status: 'rejected', reason: new Error('boom') },
      ],
      3,
    );

    expect(summary.successItems).toEqual([{ id: 'a' }]);
    expect(summary.successCount).toBe(1);
    expect(summary.failCount).toBe(2);
    expect(summary.errors).toEqual(['boom']);
  });

  it('updates a result by index without mutating siblings', () => {
    const results: ImageResult[] = [
      { id: 'a', status: 'pending' },
      { id: 'b', status: 'pending' },
    ];

    expect(updateWorkbenchResultAt(results, 1, { status: 'failed', error: 'bad' })).toEqual([
      { id: 'a', status: 'pending' },
      { id: 'b', status: 'failed', error: 'bad' },
    ]);
  });
});
