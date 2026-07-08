'use client';

import { Copy } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, Tag } from 'antd';

import { formatPromptDate, type Prompt } from '../api/prompts-api';
import { CatalogItemCard } from '@/shared/ui/catalog-page';
import { resolvePromptCoverUrl } from '../domain/prompt-cover';

export function PromptCard({
  item,
  onOpen,
  onCopy,
  actionLabel = '复制',
  actionIcon = <Copy className="size-3.5" />,
  actionType = 'text',
  extraAction,
}: {
  item: Prompt;
  onOpen: () => void;
  onCopy: () => void;
  actionLabel?: string;
  actionIcon?: ReactNode;
  actionType?: 'text' | 'primary';
  extraAction?: ReactNode;
}) {
  const coverUrl = resolvePromptCoverUrl(item);

  return (
    <CatalogItemCard
      media={
        coverUrl ? (
          <img src={coverUrl} alt={item.title} className="aspect-[4/3] w-full object-cover" />
        ) : undefined
      }
      body={
        <>
          <div className="flex items-start justify-between gap-3">
            <h2 className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</h2>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatPromptDate(item.updatedAt)}
            </span>
          </div>
          <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.prompt}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Tag key={tag} className="m-0 text-[11px]">
                {tag}
              </Tag>
            ))}
          </div>
        </>
      }
      onOpen={onOpen}
      actions={
        <>
          <Button
            block={actionType === 'primary'}
            type={actionType}
            size="small"
            icon={actionIcon}
            onClick={onCopy}
          >
            {actionLabel}
          </Button>
          {extraAction}
        </>
      }
    />
  );
}
