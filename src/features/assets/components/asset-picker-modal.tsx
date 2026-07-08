'use client';

import { useEffect, useMemo, useState } from 'react';
import { Empty, Input, Modal, Tag } from 'antd';
import { Search } from 'lucide-react';

import { CatalogCheckableTagList, CatalogPagination } from '@/shared/ui/catalog-page';
import type { Asset } from '../domain/asset';
import { useAssetStore } from '../stores/use-asset-store';

export type InsertAssetPayload =
  | { kind: 'text'; content: string; title: string }
  | { kind: 'image'; dataUrl: string; title: string; storageKey?: string }
  | {
      kind: 'video';
      url: string;
      title: string;
      storageKey?: string;
      width?: number;
      height?: number;
    };

type InsertAssetKind = InsertAssetPayload['kind'];

type Props = {
  open: boolean;
  onInsert: (payload: InsertAssetPayload) => void;
  onClose: () => void;
  acceptedKinds?: readonly InsertAssetKind[];
};

export function AssetPickerModal({ open, onInsert, onClose, acceptedKinds }: Props) {
  return (
    <Modal
      title="选择素材"
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      destroyOnHidden
      styles={{ body: { padding: '0 24px 24px', minHeight: 480 } }}
    >
      <MyAssetsTab onInsert={onInsert} acceptedKinds={acceptedKinds} />
    </Modal>
  );
}

const PAGE_SIZE = 8;

const allKindOptions = [
  { label: '全部', value: 'all' },
  { label: '文本', value: 'text' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
];

function PickerCard({
  title,
  kind,
  cover,
  onClick,
}: {
  title: string;
  kind: string;
  cover: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card text-left transition hover:bg-muted hover:shadow-md"
      onClick={onClick}
    >
      {cover ? (
        <img src={cover} alt={title} className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-muted p-3 text-center text-xs leading-5 text-muted-foreground">
          {title}
        </div>
      )}
      <div className="p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 text-xs font-medium text-foreground">{title}</span>
          <Tag className="m-0 shrink-0 text-[10px]">
            {kind === 'image' ? '图片' : kind === 'video' ? '视频' : '文本'}
          </Tag>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-black/55 group-hover:opacity-100">
        插入
      </div>
    </button>
  );
}

function MyAssetsTab({
  onInsert,
  acceptedKinds,
}: {
  onInsert: (payload: InsertAssetPayload) => void;
  acceptedKinds?: readonly InsertAssetKind[];
}) {
  const assets = useAssetStore((state) => state.assets);
  const [keyword, setKeyword] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [page, setPage] = useState(1);
  const acceptedKindSet = useMemo(
    () => (acceptedKinds?.length ? new Set<InsertAssetKind>(acceptedKinds) : null),
    [acceptedKinds],
  );
  const kindOptions = useMemo(
    () =>
      acceptedKindSet
        ? allKindOptions.filter(
            (option) =>
              option.value === 'all' || acceptedKindSet.has(option.value as InsertAssetKind),
          )
        : allKindOptions,
    [acceptedKindSet],
  );

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return assets
      .filter((a) => a.kind === 'text' || a.kind === 'image' || a.kind === 'video')
      .filter((a) => !acceptedKindSet || acceptedKindSet.has(a.kind))
      .filter((a) => kindFilter === 'all' || a.kind === kindFilter)
      .filter(
        (a) => !query || [a.title, ...(a.tags || [])].join(' ').toLowerCase().includes(query),
      );
  }, [acceptedKindSet, assets, keyword, kindFilter]);

  const visible = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    setPage((v) => Math.min(v, maxPage));
  }, [filtered.length]);

  useEffect(() => {
    if (kindFilter === 'all') return;
    if (acceptedKindSet?.has(kindFilter as InsertAssetKind) === false) setKindFilter('all');
  }, [acceptedKindSet, kindFilter]);

  const handleInsert = (asset: Asset) => {
    if (asset.kind === 'text') {
      onInsert({ kind: 'text', content: asset.data.content, title: asset.title });
    } else {
      onInsert(
        asset.kind === 'video'
          ? {
              kind: 'video',
              url: asset.data.url,
              storageKey: asset.data.storageKey,
              title: asset.title,
              width: asset.data.width,
              height: asset.data.height,
            }
          : {
              kind: 'image',
              dataUrl: asset.data.dataUrl,
              storageKey: asset.data.storageKey,
              title: asset.title,
            },
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="w-56"
          size="small"
          prefix={<Search className="size-3.5 text-muted-foreground" />}
          placeholder="搜索素材"
          value={keyword}
          allowClear
          onChange={(e) => {
            setPage(1);
            setKeyword(e.target.value);
          }}
        />
        <CatalogCheckableTagList
          options={kindOptions}
          isChecked={(value) => kindFilter === value}
          onChange={(value) => {
            setPage(1);
            setKindFilter(value);
          }}
          className="gap-1.5"
        />
      </div>

      {visible.length ? (
        <div className="grid grid-cols-4 gap-3">
          {visible.map((asset) => (
            <PickerCard
              key={asset.id}
              title={asset.title}
              kind={asset.kind}
              cover={asset.coverUrl || (asset.kind === 'image' ? asset.data.dataUrl : '')}
              onClick={() => handleInsert(asset)}
            />
          ))}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有素材" className="py-12" />
      )}

      {filtered.length > PAGE_SIZE && (
        <CatalogPagination
          size="small"
          current={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
          showSizeChanger={false}
        />
      )}
    </div>
  );
}
