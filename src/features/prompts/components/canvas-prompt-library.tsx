'use client';

import { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { BookOpen } from 'lucide-react';

import { PromptSelectDialog } from './prompt-select-dialog';
import { canvasThemes } from '@/shared/tokens/canvas-theme';
import { useAppTheme } from '@/features/settings';

export function CanvasPromptLibrary({ onSelect }: { onSelect: (prompt: string) => void }) {
  const [open, setOpen] = useState(false);
  const theme = canvasThemes[useAppTheme()];

  return (
    <>
      <Tooltip title="提示词库">
        <Button
          type="text"
          className="!h-8 !w-8 !min-w-8 shrink-0 !rounded-full !bg-transparent !p-0"
          style={{ color: theme.node.text }}
          icon={<BookOpen className="size-3.5" />}
          onClick={() => setOpen(true)}
          aria-label="提示词库"
        />
      </Tooltip>
      <PromptSelectDialog open={open} onOpenChange={setOpen} onSelect={onSelect} />
    </>
  );
}
