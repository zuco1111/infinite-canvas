'use client';

import {
  BookOpen,
  ClipboardPaste,
  Download,
  FolderPlus,
  History,
  ImagePlus,
  PenLine,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { App, Button, Drawer, Image, Input, Modal, Tag, Tooltip } from 'antd';
import { saveAs } from 'file-saver';

import { ImageSettingsPanel } from '../components/image-settings-panel';
import { PromptSelectDialog } from '@/features/prompts';
import { AppMultiSelectCheckbox } from '@/shared/ui/app-multi-select-checkbox';
import { AssetPickerModal, useAddAsset, type InsertAssetPayload } from '@/features/assets';
import { canvasThemes } from '@/shared/tokens/canvas-theme';
import { imageReferenceLabel } from '../domain/image-reference-prompt';
import {
  modelOptionLabel,
  useAiConfig,
  useAppTheme,
  useEffectiveConfig,
  useIsAiConfigReady,
  useOpenConfigDialog,
  useUpdateAiConfig,
  type AiConfig,
} from '@/features/settings';
import { nanoid } from 'nanoid';
import {
  formatBytes,
  formatDuration,
  getDataUrlByteSize,
  readImageMeta,
} from '@/shared/media/image-utils';
import { requestEdit, requestGeneration } from '../api/image-generation-api';
import { uploadImage } from '@/shared/storage/image-storage';
import { cleanupUnusedRegisteredResourceBlobs } from '@/shared/storage/resource-usage-registry';
import {
  WorkbenchContentGrid,
  WorkbenchEditorPanel,
  WorkbenchEmptyState,
  WorkbenchFailedCard,
  WorkbenchFieldHeader,
  WorkbenchHeader,
  WorkbenchMainGrid,
  WorkbenchMediaCard,
  WorkbenchMobileSummary,
  WorkbenchPageShell,
  WorkbenchPendingCard,
  WorkbenchReferenceEmpty,
  WorkbenchReferenceOrderButtons,
  WorkbenchReferenceStrip,
  WorkbenchResultsPanel,
  WorkbenchSidebar,
} from '@/shared/ui/workbench-page';
import {
  moveWorkbenchListItem,
  workbenchLogCardClassName,
  workbenchResultActionButtonClassName,
  workbenchTagClassName,
  workbenchTagToneClassName,
} from '@/shared/ui/workbench-style';
import type { ReferenceImage } from '@/shared/media/reference-types';
import { imageGenerationLogRepository } from '../../shared/repositories/generation-log-repository';
import {
  createPendingWorkbenchResults,
  readWorkbenchErrorMessage,
  updateWorkbenchResultAt,
  type WorkbenchResult,
} from '../../shared/domain/workbench-results';
import { runImmediateWorkbenchBatch } from '../../shared/domain/workbench-task-runner';
import {
  createWorkbenchLogBase,
  formatWorkbenchLogTime,
  hydrateReferenceImages,
  hydrateStoredImages,
  serializeReferenceImages,
  serializeStoredImages,
  sortWorkbenchLogsByCreatedAt,
} from '../../shared/domain/workbench-log';
import {
  createImageReferencesFromBlobs,
  createImageReferencesFromFiles,
  readClipboardImageBlobs,
} from '../../shared/domain/workbench-references';
import { useWorkbenchElapsedTime } from '../../shared/hooks/use-workbench-elapsed-time';
import { GenerationWorkbenchLogPanel } from '../../shared/components/workbench-log-panel';
import { GenerationWorkbenchModelField } from '../../shared/components/workbench-model-field';

type GeneratedImage = {
  id: string;
  dataUrl: string;
  storageKey?: string;
  durationMs: number;
  width: number;
  height: number;
  bytes: number;
  mimeType?: string;
};

type GenerationResult = WorkbenchResult<GeneratedImage, 'image'>;

type GenerationLog = {
  id: string;
  createdAt: number;
  title: string;
  prompt: string;
  time: string;
  model: string;
  config: GenerationLogConfig;
  references: ReferenceImage[];
  durationMs: number;
  successCount: number;
  failCount: number;
  errors: string[];
  imageCount: number;
  size: string;
  quality: string;
  status: '成功' | '失败';
  images: GeneratedImage[];
  thumbnails: string[];
};

type GenerationLogConfig = Pick<AiConfig, 'model' | 'imageModel' | 'quality' | 'size' | 'count'>;

type UpdateAiConfig = <K extends keyof AiConfig>(key: K, value: AiConfig[K]) => void;

export default function ImagePage() {
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = useAiConfig();
  const effectiveConfig = useEffectiveConfig();
  const updateConfig = useUpdateAiConfig();
  const isAiConfigReady = useIsAiConfigReady();
  const openConfigDialog = useOpenConfigDialog();
  const addAsset = useAddAsset();
  const [prompt, setPrompt] = useState('');
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [running, setRunning] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [previewLog, setPreviewLog] = useState<GenerationLog | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const model = effectiveConfig.imageModel || effectiveConfig.model;
  const canGenerate = Boolean(prompt.trim());
  const generationCount = Math.max(1, Math.min(10, Number(config.count) || 1));
  const elapsedMs = useWorkbenchElapsedTime(running, startedAt);

  useEffect(() => {
    void refreshLogs();
  }, []);

  const addReferences = async (files?: FileList | null) => {
    const imageFiles = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
    const nextReferences = await createImageReferencesFromFiles(imageFiles);
    setReferences((value) => [...value, ...nextReferences]);
  };

  const addReferencesFromClipboard = async () => {
    try {
      const blobs = await readClipboardImageBlobs();
      if (!blobs.length) {
        message.error('剪切板里没有可读取的图片');
        return;
      }
      const nextReferences = await createImageReferencesFromBlobs(blobs);
      setReferences((value) => [...value, ...nextReferences]);
      message.success(`已读取 ${nextReferences.length} 张参考图`);
    } catch {
      message.error('剪切板里没有可读取的图片');
    }
  };

  const generate = async () => {
    const text = prompt.trim();
    if (!text) {
      message.error('请输入生图提示词');
      return;
    }
    if (!isAiConfigReady(effectiveConfig, model)) {
      message.warning('请先完成配置');
      openConfigDialog(true);
      return;
    }

    const snapshot = buildRequestSnapshot();
    if (!snapshot) return;

    setRunning(true);
    setPreviewLog(null);
    setResults(createPendingWorkbenchResults<GenerationResult>(generationCount));
    const batchStartedAt = performance.now();
    setStartedAt(batchStartedAt);

    const result = await runImmediateWorkbenchBatch({
      count: generationCount,
      runSlot: (index) => runGenerationSlot(index, snapshot),
    });

    try {
      const logImages = await Promise.all(
        result.successItems.map(async (image) => {
          const stored = await uploadImage(image.dataUrl);
          return {
            ...image,
            dataUrl: stored.url,
            storageKey: stored.storageKey,
            width: stored.width,
            height: stored.height,
            bytes: stored.bytes,
            mimeType: stored.mimeType,
          };
        }),
      );
      saveLog(
        buildLog({
          prompt: text,
          model,
          config: { ...snapshot.config, count: String(generationCount) },
          references: snapshot.references,
          durationMs: performance.now() - batchStartedAt,
          successCount: result.successCount,
          failCount: result.failCount,
          errors: result.errors,
          status: result.successCount ? '成功' : '失败',
          images: logImages,
        }),
      );
      if (result.successCount) {
        message.success('图片已生成');
      } else {
        message.error(readWorkbenchErrorMessage(result.firstError));
      }
    } finally {
      setRunning(false);
    }
  };

  const downloadImage = (image: GeneratedImage, index: number) => {
    saveAs(image.dataUrl, `image-${index + 1}.png`);
  };

  const addResultToReferences = async (image: GeneratedImage, index: number) => {
    const stored = await uploadImage(image.dataUrl);
    setReferences((value) => [
      ...value,
      {
        id: nanoid(),
        name: `result-${index + 1}.png`,
        type: stored.mimeType,
        dataUrl: stored.url,
        storageKey: stored.storageKey,
      },
    ]);
    message.success('已加入参考图');
  };

  const saveResultToAssets = async (image: GeneratedImage, index: number) => {
    const stored = await uploadImage(image.dataUrl);
    addAsset({
      kind: 'image',
      title: `生成结果 ${index + 1}`,
      coverUrl: stored.url,
      tags: [],
      source: '生图工作台',
      data: {
        dataUrl: stored.url,
        storageKey: stored.storageKey,
        width: stored.width,
        height: stored.height,
        bytes: stored.bytes,
        mimeType: stored.mimeType,
      },
      metadata: { source: 'image-page', prompt },
    });
    message.success('已加入我的素材');
  };

  const insertPickedAsset = async (payload: InsertAssetPayload) => {
    if (payload.kind === 'text') {
      setPrompt(payload.content);
    } else if (payload.kind === 'image') {
      const stored = await uploadImage(payload.dataUrl);
      setReferences((value) => [
        ...value,
        {
          id: nanoid(),
          name: payload.title,
          type: stored.mimeType,
          dataUrl: stored.url,
          storageKey: stored.storageKey,
        },
      ]);
    } else {
      message.warning('生图工作台只能使用文本或图片素材');
    }
    setAssetPickerOpen(false);
  };

  const createSession = () => {
    setPrompt('');
    setReferences([]);
    setResults([]);
    setStartedAt(0);
    setSelectedLogIds([]);
    setPreviewLog(null);
  };

  const deleteSelectedLogs = () => {
    void imageGenerationLogRepository
      .removeMany(selectedLogIds)
      .then(() => cleanupUnusedRegisteredResourceBlobs({ references, results }))
      .then(refreshLogs);
    if (previewLog && selectedLogIds.includes(previewLog.id)) {
      setPreviewLog(null);
      setResults([]);
    }
    setSelectedLogIds([]);
    setDeleteConfirmOpen(false);
  };

  const saveLog = (log: GenerationLog) => {
    void imageGenerationLogRepository.save(serializeLog(log)).then(refreshLogs);
  };

  const refreshLogs = async () => setLogs(await readStoredLogs());

  const previewGenerationLog = async (log: GenerationLog) => {
    setPreviewLog(log);
    setLogsOpen(false);
    setPrompt(log.prompt);
    setReferences(log.references || []);
    if (log.config.imageModel || log.model)
      updateConfig('imageModel', log.config.imageModel || log.model);
    if (log.config.quality) updateConfig('quality', log.config.quality);
    if (log.config.size) updateConfig('size', log.config.size);
    if (log.config.count) updateConfig('count', log.config.count);
    setResults([
      ...log.images.map((image) => ({ id: image.id, status: 'success' as const, image })),
      ...Array.from({ length: Math.max(0, log.failCount || 0) }, (_, index) => ({
        id: `${log.id}-failed-${index}`,
        status: 'failed' as const,
        error: log.errors[index] || '生成失败',
      })),
    ]);
  };

  const buildRequestSnapshot = () => {
    const text = prompt.trim();
    if (!text) {
      message.error('请输入生图提示词');
      return null;
    }
    if (!isAiConfigReady(effectiveConfig, model)) {
      message.warning('请先完成配置');
      openConfigDialog(true);
      return null;
    }
    return { text, config: { ...effectiveConfig, model, count: '1' }, references: [...references] };
  };

  const runGenerationSlot = async (
    index: number,
    snapshot: { text: string; config: AiConfig; references: ReferenceImage[] },
  ) => {
    const itemStartedAt = performance.now();
    try {
      const result = snapshot.references.length
        ? await requestEdit(snapshot.config, snapshot.text, snapshot.references)
        : await requestGeneration(snapshot.config, snapshot.text);
      const image = result[0];
      if (!image) throw new Error('接口没有返回图片');
      const meta = await readImageMeta(image.dataUrl);
      const nextImage = {
        id: image.id,
        dataUrl: image.dataUrl,
        durationMs: performance.now() - itemStartedAt,
        width: meta.width,
        height: meta.height,
        bytes: getDataUrlByteSize(image.dataUrl),
      };
      setResults((value) =>
        updateWorkbenchResultAt(value, index, { status: 'success', image: nextImage }),
      );
      return nextImage;
    } catch (error) {
      setResults((value) =>
        updateWorkbenchResultAt(value, index, {
          status: 'failed',
          error: readWorkbenchErrorMessage(error),
        }),
      );
      throw error;
    }
  };

  const retryResult = (index: number) => {
    const snapshot = buildRequestSnapshot();
    if (!snapshot) return;
    setPreviewLog(null);
    setResults((value) =>
      updateWorkbenchResultAt(value, index, {
        status: 'pending',
        error: undefined,
        image: undefined,
      }),
    );
    void runGenerationSlot(index, snapshot).catch(() => {});
  };

  return (
    <WorkbenchPageShell>
      <WorkbenchMainGrid>
        <WorkbenchSidebar>
          <LogPanel
            logs={logs}
            selectedLogIds={selectedLogIds}
            activeLogId={previewLog?.id}
            onSelectedLogIdsChange={setSelectedLogIds}
            onCreateSession={createSession}
            onDeleteSelected={() => setDeleteConfirmOpen(true)}
            onPreviewLog={(log) => void previewGenerationLog(log)}
          />
        </WorkbenchSidebar>

        <WorkbenchContentGrid>
          <WorkbenchEditorPanel>
            <WorkbenchHeader
              title="生图工作台"
              actions={
                <>
                  <Button icon={<History className="size-4" />} onClick={() => setLogsOpen(true)}>
                    记录
                  </Button>
                  <Button
                    icon={<SlidersHorizontal className="size-4" />}
                    onClick={() => setSettingsOpen(true)}
                  >
                    参数
                  </Button>
                </>
              }
            />

            <div className="mt-6 space-y-5">
              <div>
                <WorkbenchFieldHeader
                  title="提示词"
                  actions={
                    <>
                      <Button
                        size="small"
                        icon={<BookOpen className="size-3.5" />}
                        onClick={() => setPromptDialogOpen(true)}
                      >
                        查看提示词库
                      </Button>
                      <Button
                        size="small"
                        icon={<FolderPlus className="size-3.5" />}
                        onClick={() => setAssetPickerOpen(true)}
                      >
                        查看我的素材
                      </Button>
                    </>
                  }
                />
                <Input.TextArea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={7}
                  placeholder="描述画面主体、风格、构图、光线和用途"
                />
              </div>

              <div className="min-w-0">
                <WorkbenchFieldHeader
                  title="参考图"
                  actions={
                    <>
                      <Button
                        size="small"
                        icon={<ClipboardPaste className="size-3.5" />}
                        onClick={() => void addReferencesFromClipboard()}
                      >
                        剪切板
                      </Button>
                      <Button
                        size="small"
                        icon={<Upload className="size-3.5" />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        上传
                      </Button>
                    </>
                  }
                />
                <WorkbenchReferenceStrip
                  onWheel={(event) => {
                    if (event.currentTarget.scrollWidth <= event.currentTarget.clientWidth) return;
                    event.preventDefault();
                    event.currentTarget.scrollLeft += event.deltaY;
                  }}
                >
                  {references.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative size-20 shrink-0 overflow-hidden rounded-md border border-border"
                    >
                      <img src={item.dataUrl} alt={item.name} className="size-full object-cover" />
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {imageReferenceLabel(index)}
                      </span>
                      <WorkbenchReferenceOrderButtons
                        index={index}
                        total={references.length}
                        onMove={(offset) =>
                          setReferences((value) => moveWorkbenchListItem(value, index, offset))
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 hidden size-6 items-center justify-center rounded bg-black/60 text-white group-hover:flex"
                        onClick={() =>
                          setReferences((value) => value.filter((ref) => ref.id !== item.id))
                        }
                        aria-label="移除参考图"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  {!references.length ? (
                    <WorkbenchReferenceEmpty>暂无参考图</WorkbenchReferenceEmpty>
                  ) : null}
                </WorkbenchReferenceStrip>
              </div>

              <WorkbenchMobileSummary
                summary={`${modelOptionLabel(effectiveConfig, model)} · ${effectiveConfig.size} · ${
                  effectiveConfig.quality
                }`}
                icon={<SlidersHorizontal className="size-4" />}
                onClick={() => setSettingsOpen(true)}
              />

              <div className="hidden gap-4 sm:grid sm:grid-cols-2">
                <GenerationSettings
                  config={effectiveConfig}
                  model={model}
                  updateConfig={updateConfig}
                  openConfigDialog={openConfigDialog}
                />
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Button
                type="primary"
                size="large"
                block
                icon={<Sparkles className="size-4" />}
                loading={running}
                disabled={!canGenerate || running}
                onClick={() => void generate()}
              >
                开始生成
              </Button>
            </div>
          </WorkbenchEditorPanel>

          <WorkbenchResultsPanel
            title="生成结果"
            runningLabel={running ? `等待 ${formatDuration(elapsedMs)}` : undefined}
          >
            {results.length ? (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {results.map((result, index) =>
                  result.status === 'success' && result.image ? (
                    <ResultImageCard
                      key={result.id}
                      image={result.image}
                      index={index}
                      onEdit={addResultToReferences}
                      onDownload={downloadImage}
                      onSaveAsset={saveResultToAssets}
                    />
                  ) : result.status === 'failed' ? (
                    <FailedImageCard
                      key={result.id}
                      error={result.error || '生成失败'}
                      onRetry={() => retryResult(index)}
                    />
                  ) : (
                    <PendingImageCard key={result.id} />
                  ),
                )}
              </div>
            ) : (
              <WorkbenchEmptyState icon={ImagePlus} description="还没有生成图片" />
            )}
          </WorkbenchResultsPanel>
        </WorkbenchContentGrid>
      </WorkbenchMainGrid>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void addReferences(event.target.files);
          event.target.value = '';
        }}
      />
      <Drawer
        title="生成记录"
        placement="bottom"
        size="large"
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
      >
        <LogPanel
          logs={logs}
          selectedLogIds={selectedLogIds}
          activeLogId={previewLog?.id}
          onSelectedLogIdsChange={setSelectedLogIds}
          onCreateSession={createSession}
          onDeleteSelected={() => setDeleteConfirmOpen(true)}
          onPreviewLog={(log) => void previewGenerationLog(log)}
        />
      </Drawer>
      <Drawer
        title="参数"
        placement="bottom"
        height="82vh"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      >
        <div className="grid grid-cols-2 gap-3 pb-4">
          <GenerationSettings
            config={effectiveConfig}
            model={model}
            updateConfig={updateConfig}
            openConfigDialog={openConfigDialog}
          />
        </div>
      </Drawer>
      <PromptSelectDialog
        open={promptDialogOpen}
        onOpenChange={setPromptDialogOpen}
        onSelect={setPrompt}
      />
      <AssetPickerModal
        open={assetPickerOpen}
        onInsert={(payload) => void insertPickedAsset(payload)}
        onClose={() => setAssetPickerOpen(false)}
      />
      <Modal
        title="删除生成记录"
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onOk={deleteSelectedLogs}
        okText="删除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        确定删除选中的 {selectedLogIds.length} 条生成记录吗？
      </Modal>
    </WorkbenchPageShell>
  );
}

function GenerationSettings({
  config,
  model,
  updateConfig,
  openConfigDialog,
}: {
  config: AiConfig;
  model: string;
  updateConfig: UpdateAiConfig;
  openConfigDialog: (shouldPromptContinue?: boolean) => void;
}) {
  const theme = canvasThemes[useAppTheme()];

  return (
    <>
      <GenerationWorkbenchModelField
        config={config}
        model={model}
        capability="image"
        onChange={(value) => updateConfig('imageModel', value)}
        openConfigDialog={openConfigDialog}
      />
      <div className="col-span-2">
        <ImageSettingsPanel
          config={config}
          onConfigChange={(key, value) => updateConfig(key, value)}
          theme={theme}
          showTitle={false}
          className="space-y-4"
          maxCount={10}
        />
      </div>
    </>
  );
}

function ResultImageCard({
  image,
  index,
  onEdit,
  onDownload,
  onSaveAsset,
}: {
  image: GeneratedImage;
  index: number;
  onEdit: (image: GeneratedImage, index: number) => void;
  onDownload: (image: GeneratedImage, index: number) => void;
  onSaveAsset: (image: GeneratedImage, index: number) => void;
}) {
  return (
    <WorkbenchMediaCard
      meta={
        <>
          <span>
            {image.width}x{image.height}
          </span>
          <span>{formatBytes(image.bytes)}</span>
          <span>{formatDuration(image.durationMs)}</span>
        </>
      }
      actions={
        <div className="grid min-w-0 grid-cols-3 gap-2">
          <Tooltip title="添加到素材">
            <Button
              className={workbenchResultActionButtonClassName}
              size="small"
              icon={<FolderPlus className="size-3.5" />}
              onClick={() => void onSaveAsset(image, index)}
            >
              添加到素材
            </Button>
          </Tooltip>
          <Tooltip title="加入参考图">
            <Button
              className={workbenchResultActionButtonClassName}
              size="small"
              icon={<PenLine className="size-3.5" />}
              onClick={() => void onEdit(image, index)}
            >
              加入参考图
            </Button>
          </Tooltip>
          <Tooltip title="下载">
            <Button
              className={workbenchResultActionButtonClassName}
              size="small"
              icon={<Download className="size-3.5" />}
              onClick={() => onDownload(image, index)}
            >
              下载
            </Button>
          </Tooltip>
        </div>
      }
      footerClassName="grid gap-2"
    >
      <Image
        src={image.dataUrl}
        alt={`生成结果 ${index + 1}`}
        className="aspect-square object-cover"
      />
    </WorkbenchMediaCard>
  );
}

function PendingImageCard() {
  return <WorkbenchPendingCard patterned />;
}

function FailedImageCard({ error, onRetry }: { error: string; onRetry: () => void }) {
  return <WorkbenchFailedCard error={error} onRetry={onRetry} />;
}

function LogPanel({
  logs,
  selectedLogIds,
  activeLogId,
  onSelectedLogIdsChange,
  onCreateSession,
  onDeleteSelected,
  onPreviewLog,
}: {
  logs: GenerationLog[];
  selectedLogIds: string[];
  activeLogId?: string;
  onSelectedLogIdsChange: (ids: string[]) => void;
  onCreateSession: () => void;
  onDeleteSelected: () => void;
  onPreviewLog: (log: GenerationLog) => void;
}) {
  return (
    <GenerationWorkbenchLogPanel
      logs={logs}
      selectedLogIds={selectedLogIds}
      onSelectedLogIdsChange={onSelectedLogIdsChange}
      onCreateSession={onCreateSession}
      onDeleteSelected={onDeleteSelected}
      renderLog={({ log, selected, onSelectedChange }) => (
        <LogCard
          key={log.id}
          log={log}
          selected={selected}
          active={activeLogId === log.id}
          onSelectedChange={onSelectedChange}
          onClick={() => onPreviewLog(log)}
        />
      )}
    />
  );
}

function LogCard({
  log,
  selected,
  active,
  onSelectedChange,
  onClick,
}: {
  log: GenerationLog;
  selected: boolean;
  active: boolean;
  onSelectedChange: (checked: boolean) => void;
  onClick: () => void;
}) {
  const thumbnails = (log.thumbnails || []).filter(Boolean).slice(0, 4);

  return (
    <button type="button" className={workbenchLogCardClassName(active)} onClick={onClick}>
      <div className="grid grid-cols-[minmax(128px,1fr)_auto] gap-2">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2">
          <AppMultiSelectCheckbox
            className="mt-0.5"
            checked={selected}
            onCheckedChange={onSelectedChange}
            ariaLabel={`选择生成记录 ${log.title}`}
            stopPropagation
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-5">{log.title}</div>
            {thumbnails.length ? (
              <div className="mt-2 flex gap-1 overflow-hidden">
                {thumbnails.map((image, index) => (
                  <img
                    key={`${log.id}-${index}`}
                    src={image}
                    alt=""
                    className="size-8 shrink-0 rounded-md object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid justify-items-end gap-2">
          <div className="flex gap-1">
            <Tag className={workbenchTagToneClassName.primary}>
              成功 {log.successCount ?? log.imageCount}
            </Tag>
            {log.failCount ? (
              <Tag className={workbenchTagToneClassName.danger}>失败 {log.failCount}</Tag>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            <Tag className={workbenchTagClassName}>{log.imageCount} 张</Tag>
            <Tag className={workbenchTagToneClassName.success}>
              {formatDuration(log.durationMs)}
            </Tag>
          </div>
          <div className="flex justify-end">
            <Tag className={workbenchTagClassName}>{log.time}</Tag>
          </div>
        </div>
      </div>
    </button>
  );
}

async function readStoredLogs() {
  if (typeof window === 'undefined') return [];
  try {
    const values = await imageGenerationLogRepository.list<GenerationLog>();
    const logs = await Promise.all(values.map(normalizeLog));
    return sortWorkbenchLogsByCreatedAt(logs);
  } catch {
    return [];
  }
}

async function normalizeLog(log: Partial<GenerationLog>): Promise<GenerationLog> {
  const references = await hydrateReferenceImages(log.references);
  const images = await hydrateStoredImages(log.images);
  const config = normalizeLogConfig(log);
  return {
    id: log.id || nanoid(),
    createdAt: log.createdAt || Date.now(),
    title: log.title || log.model || '未命名',
    prompt: log.prompt || log.title || '',
    time: log.time || formatWorkbenchLogTime(),
    model: log.model || config.imageModel || '',
    config,
    references,
    durationMs: log.durationMs || 0,
    successCount: log.successCount ?? log.imageCount ?? 0,
    failCount: log.failCount || 0,
    errors: log.errors || [],
    imageCount: log.imageCount || log.successCount || 0,
    size: log.size || config.size || '',
    quality: log.quality || config.quality || '',
    status: log.status || '成功',
    images,
    thumbnails: images.map((image) => image.dataUrl).filter(Boolean),
  };
}

function serializeLog(log: GenerationLog): GenerationLog {
  return {
    ...log,
    references: serializeReferenceImages(log.references),
    images: serializeStoredImages(log.images),
    thumbnails: [],
  };
}

function normalizeLogConfig(log: Partial<GenerationLog>): GenerationLogConfig {
  return {
    model: log.config?.model || log.model || '',
    imageModel: log.config?.imageModel || log.model || '',
    quality: log.config?.quality || log.quality || '',
    size: log.config?.size || log.size || '',
    count: log.config?.count || String(log.imageCount || log.successCount || 1),
  };
}

function buildLog({
  prompt,
  model,
  config,
  references,
  durationMs,
  successCount,
  failCount,
  errors,
  status,
  images,
}: {
  prompt: string;
  model: string;
  config: GenerationLogConfig;
  references: ReferenceImage[];
  durationMs: number;
  successCount: number;
  failCount: number;
  errors: string[];
  status: GenerationLog['status'];
  images: GeneratedImage[];
}): GenerationLog {
  const logConfig = {
    model: config.model,
    imageModel: config.imageModel,
    quality: config.quality,
    size: config.size,
    count: config.count,
  };
  const base = createWorkbenchLogBase({
    prompt,
    model,
    config: logConfig,
    durationMs,
    status,
  });
  return {
    ...base,
    references,
    successCount,
    failCount,
    errors,
    imageCount: Number(logConfig.count) || successCount,
    size: logConfig.size,
    quality: logConfig.quality,
    status,
    images,
    thumbnails: images.map((image) => image.dataUrl).filter(Boolean),
  };
}
