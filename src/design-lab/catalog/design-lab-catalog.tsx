import { useMemo, useState } from 'react';
import { Button, Input, Segmented, Select as AntSelect } from 'antd';
import { RotateCcw, Search } from 'lucide-react';

import {
  designLabAnchorForInventoryId,
  designLabCatalogEntries,
  designLabCatalogSources,
  type DesignLabCatalogEntry,
  type DesignLabCatalogLayer,
  type DesignLabCatalogStatus,
} from './catalog-data';
import {
  designLabAuditGroupForEntry,
  designLabAuditGroups,
  type DesignLabAuditGroup,
} from './audit-groups';
import { useInheritedThemeMode } from './catalog-runtime';
import styles from './catalog.module.css';
import { FoundationPreview } from './foundation-preview';
import { PrimitivePreview } from './primitive-preview';

export type DesignLabCatalogProps = {
  className?: string;
};

type LayerFilter = 'all' | DesignLabCatalogLayer;
type StatusFilter = 'all' | DesignLabCatalogStatus;
type AuditGroupFilter = 'all' | DesignLabAuditGroup['id'];
type CatalogView = 'compare' | 'inventory';

export function DesignLabCatalog({ className }: DesignLabCatalogProps) {
  const inheritedTheme = useInheritedThemeMode();
  const [query, setQuery] = useState('');
  const [layer, setLayer] = useState<LayerFilter>('all');
  const [source, setSource] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [auditGroup, setAuditGroup] = useState<AuditGroupFilter>('all');
  const [view, setView] = useState<CatalogView>('compare');

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return designLabCatalogEntries.filter((entry) => {
      if (layer !== 'all' && entry.layer !== layer) return false;
      if (source !== 'all' && !entry.sourceTags.includes(source)) return false;
      if (status !== 'all' && entry.status !== status) return false;
      const entryAuditGroup = designLabAuditGroupForEntry(entry);
      if (auditGroup !== 'all' && entryAuditGroup?.id !== auditGroup) return false;
      if (!normalizedQuery) return true;
      return searchableText(entry, entryAuditGroup).includes(normalizedQuery);
    });
  }, [auditGroup, layer, query, source, status]);

  const foundationEntries = filteredEntries.filter((entry) => entry.layer === 'Foundation');
  const primitiveEntries = filteredEntries.filter((entry) => entry.layer === 'Primitive');
  const hasFilters = Boolean(
    query || layer !== 'all' || source !== 'all' || status !== 'all' || auditGroup !== 'all',
  );

  const resetFilters = () => {
    setQuery('');
    setLayer('all');
    setSource('all');
    setStatus('all');
    setAuditGroup('all');
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.inner}>
        <header aria-label="阶段三现有样式审计概览" className={styles.header}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Phase 3 · Current style audit</h1>
            <p className={styles.subtitle}>
              相似的 Foundations 与 Primitives
              已并置，便于比较当前差异。分组只用于审计，不代表已批准合并、替换或目标规格。
            </p>
          </div>
          <div className={styles.headerMeta}>
            <div>40 inventory IDs</div>
            <div>{designLabAuditGroups.length} comparison families</div>
            <div>Inherited theme: {inheritedTheme}</div>
            <div>No target specifications rendered</div>
          </div>
        </header>

        <div className={styles.viewBar} aria-label="审计视图">
          <div>
            <div className={styles.viewBarTitle}>查看方式</div>
            <div className={styles.viewBarDescription}>
              对比视图按相似用途分组；库存视图保留阶段二稳定顺序。
            </div>
          </div>
          <Segmented
            aria-label="选择审计查看方式"
            data-testid="design-lab-catalog-view"
            options={[
              { label: '相似项对比', value: 'compare' },
              { label: '库存顺序', value: 'inventory' },
            ]}
            value={view}
            onChange={(value) => setView(value as CatalogView)}
          />
        </div>

        <div className={styles.filters} aria-label="库存筛选">
          <label className={styles.field} htmlFor="design-lab-catalog-search">
            <span className={styles.label}>搜索库存</span>
            <Input
              id="design-lab-catalog-search"
              className={styles.filterControl}
              type="search"
              aria-label="搜索库存"
              placeholder="ID、名称、来源、状态"
              prefix={<Search className="size-4 text-muted-foreground" aria-hidden="true" />}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className={styles.field} htmlFor="design-lab-catalog-audit-group">
            <span className={styles.label}>对比组</span>
            <AntSelect
              id="design-lab-catalog-audit-group"
              className={styles.filterControl}
              data-testid="design-lab-catalog-audit-group-filter"
              aria-label="按相似项对比组筛选库存"
              value={auditGroup}
              onChange={(value) => setAuditGroup(value as AuditGroupFilter)}
              virtual={false}
              options={[
                { value: 'all', label: '全部对比组' },
                ...designLabAuditGroups.map((group) => ({
                  value: group.id,
                  label: group.title,
                })),
              ]}
            />
          </label>

          <label className={styles.field} htmlFor="design-lab-catalog-layer">
            <span className={styles.label}>层级</span>
            <AntSelect
              id="design-lab-catalog-layer"
              className={styles.filterControl}
              data-testid="design-lab-catalog-layer-filter"
              aria-label="按层级筛选库存"
              value={layer}
              onChange={(value) => setLayer(value as LayerFilter)}
              options={[
                { value: 'all', label: '全部层级' },
                { value: 'Foundation', label: 'Foundation' },
                { value: 'Primitive', label: 'Primitive' },
              ]}
            />
          </label>

          <label className={styles.field} htmlFor="design-lab-catalog-source">
            <span className={styles.label}>来源</span>
            <AntSelect
              id="design-lab-catalog-source"
              className={styles.filterControl}
              data-testid="design-lab-catalog-source-filter"
              aria-label="按来源筛选库存"
              value={source}
              onChange={setSource}
              virtual={false}
              options={[
                { value: 'all', label: '全部来源' },
                ...designLabCatalogSources.map((option) => ({ value: option, label: option })),
              ]}
            />
          </label>

          <label className={styles.field} htmlFor="design-lab-catalog-status">
            <span className={styles.label}>状态</span>
            <AntSelect
              id="design-lab-catalog-status"
              className={styles.filterControl}
              data-testid="design-lab-catalog-status-filter"
              aria-label="按状态筛选库存"
              value={status}
              onChange={(value) => setStatus(value as StatusFilter)}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'unreviewed', label: 'unreviewed' },
                { value: 'candidate', label: 'candidate' },
              ]}
            />
          </label>

          <Button
            type="default"
            className={styles.resetButton}
            aria-label="重置库存筛选"
            title="重置库存筛选"
            disabled={!hasFilters}
            icon={<RotateCcw size={16} aria-hidden="true" />}
            onClick={resetFilters}
          />
        </div>

        <div className={styles.resultsSummary} aria-live="polite">
          <span>
            显示 {filteredEntries.length} / {designLabCatalogEntries.length} 项
          </span>
          <span>稳定锚点使用 inventory ID</span>
        </div>

        {filteredEntries.length ? (
          view === 'compare' ? (
            <AuditGroups entries={filteredEntries} />
          ) : (
            <>
              <CatalogSection title="Foundations" entries={foundationEntries} />
              <CatalogSection title="Primitives" entries={primitiveEntries} />
            </>
          )
        ) : (
          <div className={styles.emptyState}>没有符合当前筛选条件的库存项。</div>
        )}
      </div>
    </div>
  );
}

function AuditGroups({ entries }: { entries: DesignLabCatalogEntry[] }) {
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  return (
    <div className={styles.auditGroups} data-testid="design-lab-audit-groups">
      {designLabAuditGroups.map((group, index) => {
        const groupEntries = group.entryIds
          .map((entryId) => entriesById.get(entryId))
          .filter((entry): entry is DesignLabCatalogEntry => Boolean(entry));
        if (!groupEntries.length) return null;
        return (
          <section
            aria-labelledby={`design-lab-audit-group-${group.id}-title`}
            className={styles.auditGroup}
            data-audit-group={group.id}
            key={group.id}
          >
            <div className={styles.auditGroupHeader}>
              <div className={styles.auditGroupIndex}>{String(index + 1).padStart(2, '0')}</div>
              <div className={styles.auditGroupCopy}>
                <div className={styles.auditGroupTitleRow}>
                  <h2
                    id={`design-lab-audit-group-${group.id}-title`}
                    className={styles.auditGroupTitle}
                  >
                    {group.title}
                  </h2>
                  <span className={styles.sectionCount}>{groupEntries.length} items</span>
                </div>
                <p className={styles.auditGroupDescription}>{group.description}</p>
                <p className={styles.auditGroupPrompt}>
                  <strong>审计重点：</strong>
                  {group.reviewPrompt}
                </p>
              </div>
            </div>
            <div className={styles.auditEntryGrid}>
              {groupEntries.map((entry) => (
                <CatalogEntry key={entry.id} entry={entry} compact />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CatalogSection({ title, entries }: { title: string; entries: DesignLabCatalogEntry[] }) {
  if (!entries.length) return null;
  return (
    <section className={styles.section} aria-labelledby={`design-lab-${title.toLowerCase()}-title`}>
      <div className={styles.sectionHeader}>
        <h2 id={`design-lab-${title.toLowerCase()}-title`} className={styles.sectionTitle}>
          {title}
        </h2>
        <span className={styles.sectionCount}>{entries.length} items</span>
      </div>
      <div className={styles.entryList}>
        {entries.map((entry) => (
          <CatalogEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function CatalogEntry({
  entry,
  compact = false,
}: {
  entry: DesignLabCatalogEntry;
  compact?: boolean;
}) {
  const anchor = designLabAnchorForInventoryId(entry.id);
  const headingId = `${anchor}-title`;
  return (
    <article
      id={anchor}
      className={[styles.entry, compact ? styles.entryCompact : ''].filter(Boolean).join(' ')}
      data-inventory-id={entry.id}
      data-inventory-layer={entry.layer}
      data-inventory-status={entry.status}
      aria-labelledby={headingId}
    >
      <div className={styles.entryHeader}>
        <div className={styles.entryHeading}>
          <div className={styles.entryIdentity}>
            <a
              aria-label={`跳转到库存锚点 ${entry.id}`}
              className={styles.inventoryId}
              href={`#${anchor}`}
              title={`#${anchor}`}
            >
              {entry.id}
            </a>
            <span className={styles.badge}>{entry.layer}</span>
            <span className={styles.badge}>{entry.category}</span>
            <span className={styles.badge} data-status={entry.status}>
              {entry.status}
            </span>
          </div>
          <h3 id={headingId} className={styles.entryName}>
            {entry.name}
          </h3>
        </div>
      </div>

      <div
        className={styles.preview}
        data-inventory-preview={entry.id}
        data-testid={`${anchor}-preview`}
      >
        <h4 className={styles.previewTitle}>Current implementation</h4>
        {entry.layer === 'Foundation' ? (
          <FoundationPreview inventoryId={entry.id} />
        ) : (
          <PrimitivePreview inventoryId={entry.id} />
        )}
      </div>
      {compact ? (
        <details className={styles.evidenceDetails}>
          <summary>来源与审计证据</summary>
          <div className={styles.metadata}>
            <MetadataItem label="Source" value={entry.source} />
            <MetadataItem label="Current use" value={entry.usage} />
            <MetadataItem label="Resolved value" value={entry.resolved} />
            <MetadataItem label="Decision" value={entry.decision} />
          </div>
        </details>
      ) : (
        <div className={styles.metadata}>
          <MetadataItem label="Source" value={entry.source} />
          <MetadataItem label="Current use" value={entry.usage} />
          <MetadataItem label="Resolved value" value={entry.resolved} />
          <MetadataItem label="Decision" value={entry.decision} />
        </div>
      )}
    </article>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metadataItem}>
      <span className={styles.metadataLabel}>{label}</span>
      <div className={styles.metadataValue}>{value}</div>
    </div>
  );
}

function searchableText(entry: DesignLabCatalogEntry, auditGroup?: DesignLabAuditGroup) {
  return [
    entry.id,
    entry.name,
    entry.layer,
    entry.category,
    entry.source,
    entry.sourceTags.join(' '),
    entry.usage,
    entry.resolved,
    entry.status,
    entry.decision,
    auditGroup?.title,
    auditGroup?.description,
    auditGroup?.reviewPrompt,
  ]
    .join(' ')
    .toLocaleLowerCase();
}
