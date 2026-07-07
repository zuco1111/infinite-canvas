'use client';

import { Button } from 'antd';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { WorkbenchLogEmpty, WorkbenchLogHeader } from '@/shared/ui/workbench-page';

type RenderLogArgs<TLog extends { id: string }> = {
  log: TLog;
  selected: boolean;
  onSelectedChange: (checked: boolean) => void;
};

export function GenerationWorkbenchLogPanel<TLog extends { id: string }>({
  logs,
  selectedLogIds,
  onSelectedLogIdsChange,
  onCreateSession,
  onDeleteSelected,
  renderLog,
}: {
  logs: TLog[];
  selectedLogIds: string[];
  onSelectedLogIdsChange: (ids: string[]) => void;
  onCreateSession: () => void;
  onDeleteSelected: () => void;
  renderLog: (args: RenderLogArgs<TLog>) => ReactNode;
}) {
  const allSelected = Boolean(logs.length) && selectedLogIds.length === logs.length;
  const toggleAll = () => onSelectedLogIdsChange(allSelected ? [] : logs.map((log) => log.id));

  return (
    <>
      <WorkbenchLogHeader count={logs.length}>
        <Button size="small" icon={<Plus className="size-3.5" />} onClick={onCreateSession}>
          新建
        </Button>
        <Button
          size="small"
          icon={<CheckSquare className="size-3.5" />}
          disabled={!logs.length}
          onClick={toggleAll}
        >
          {allSelected ? '取消' : '全选'}
        </Button>
        <Button
          size="small"
          danger
          icon={<Trash2 className="size-3.5" />}
          disabled={!selectedLogIds.length}
          onClick={onDeleteSelected}
        >
          删除
        </Button>
      </WorkbenchLogHeader>
      <div className="space-y-3">
        {logs.map((log) =>
          renderLog({
            log,
            selected: selectedLogIds.includes(log.id),
            onSelectedChange: (checked) =>
              onSelectedLogIdsChange(
                checked
                  ? [...selectedLogIds, log.id]
                  : selectedLogIds.filter((id) => id !== log.id),
              ),
          }),
        )}
        {!logs.length ? <WorkbenchLogEmpty /> : null}
      </div>
    </>
  );
}
