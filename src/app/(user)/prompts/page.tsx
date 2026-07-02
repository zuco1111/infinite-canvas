'use client';

import { FolderPlus, Search } from 'lucide-react';
import { type UIEvent, useEffect, useState } from 'react';
import { App, Button, Empty, Input, Spin } from 'antd';

import { PromptCard } from '@/components/prompts/prompt-card';
import { PromptDetailDialog } from '@/components/prompts/prompt-detail-dialog';
import { usePromptList } from '@/components/prompts/use-prompt-list';
import { useCopyText } from '@/hooks/use-copy-text';
import {
  CatalogCheckableFilterGroup,
  CatalogPageHeader,
  CatalogPageShell,
  CatalogStatusText,
} from '@/shared/ui/catalog-page';
import { useAssetStore } from '@/stores/use-asset-store';
import { ALL_PROMPTS_OPTION, type Prompt } from '@/services/api/prompts';

export default function PromptsPage() {
  const { message } = App.useApp();
  const [titleKeyword, setTitleKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(ALL_PROMPTS_OPTION);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const addAsset = useAssetStore((state) => state.addAsset);
  const copyText = useCopyText();
  const {
    query,
    items: promptItems,
    tags: promptTags,
    categories: promptCategoryOptions,
    total: totalPrompts,
  } = usePromptList({ keyword: titleKeyword, tags: selectedTags, category: selectedCategory });

  useEffect(() => {
    if (query.isError) {
      message.error(query.error instanceof Error ? query.error.message : '获取提示词失败');
    }
  }, [message, query.error, query.isError]);

  const toggleTag = (tag: string) => {
    if (tag === ALL_PROMPTS_OPTION) return setSelectedTags([]);
    setSelectedTags((items) =>
      items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag],
    );
  };

  const savePromptAsset = (item: Prompt) => {
    addAsset({
      kind: 'text',
      title: item.title,
      coverUrl: item.coverUrl,
      tags: item.tags,
      source: item.category,
      data: { content: item.prompt },
      metadata: { source: 'prompt-library', promptId: item.id, githubUrl: item.githubUrl },
    });
    message.success('已加入我的素材');
  };

  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (
      query.hasNextPage &&
      !query.isFetchingNextPage &&
      target.scrollTop + target.clientHeight >= target.scrollHeight - 160
    ) {
      void query.fetchNextPage();
    }
  };

  return (
    <CatalogPageShell gridTone="medium" onScroll={handleListScroll}>
      <div className="pb-8">
        <CatalogPageHeader
          title="提示词中心"
          description={<>共 {totalPrompts} 条提示词，按标题、标签与分类快速查找灵感。</>}
        />
        {query.isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Spin />
          </div>
        ) : null}
        {!query.isLoading ? (
          <>
            <div className="mx-auto mt-8 w-full max-w-2xl">
              <Input
                size="large"
                className="w-full"
                prefix={<Search className="size-4 text-muted-foreground" />}
                value={titleKeyword}
                placeholder="按标题查询"
                onChange={(event) => setTitleKeyword(event.target.value)}
              />
            </div>
            <div className="mx-auto mt-6 grid max-w-6xl gap-3 text-left">
              <CatalogCheckableFilterGroup
                label="分类"
                options={promptCategoryOptions}
                isChecked={(category) => selectedCategory === category}
                onChange={setSelectedCategory}
              />
              <CatalogCheckableFilterGroup
                label="标签"
                options={promptTags}
                isChecked={(tag) =>
                  tag === ALL_PROMPTS_OPTION
                    ? selectedTags.length === 0
                    : selectedTags.includes(tag)
                }
                onChange={toggleTag}
              />
            </div>
          </>
        ) : null}
      </div>

      {!query.isLoading ? (
        <div>
          <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {promptItems.map((item) => (
              <PromptCard
                key={item.id}
                item={item}
                onOpen={() => setSelectedPrompt(item)}
                onCopy={() => copyText(item.prompt, '提示词已复制')}
                extraAction={
                  <Button
                    size="small"
                    icon={<FolderPlus className="size-3.5" />}
                    onClick={() => savePromptAsset(item)}
                  >
                    加入我的素材
                  </Button>
                }
              />
            ))}
          </div>
          {promptItems.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="没有找到匹配的提示词"
              className="py-16"
            />
          ) : null}
          <CatalogStatusText>
            {query.isFetchingNextPage
              ? '加载中...'
              : query.hasNextPage
                ? '继续向下滚动加载更多'
                : promptItems.length > 0
                  ? '已经到底了'
                  : null}
          </CatalogStatusText>
        </div>
      ) : null}

      <PromptDetailDialog
        prompt={selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        onCopy={(prompt) => copyText(prompt, '提示词已复制')}
        onSaveAsset={savePromptAsset}
      />
    </CatalogPageShell>
  );
}
