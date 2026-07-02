'use client';

import {
  BookOpen,
  CheckSquare,
  ClipboardPaste,
  Download,
  FolderPlus,
  History,
  Music2,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  VideoIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { App, Button, Drawer, Input, Modal, Tag } from 'antd';
import localforage from 'localforage';
import { nanoid } from 'nanoid';
import { saveAs } from 'file-saver';

import {
  AssetPickerModal,
  type InsertAssetPayload,
} from '@/app/(user)/canvas/components/asset-picker-modal';
import { ModelPicker } from '@/components/model-picker';
import { PromptSelectDialog } from '@/components/prompts/prompt-select-dialog';
import {
  normalizeVideoResolutionValue,
  normalizeVideoSizeValue,
  videoSizeLabel,
} from '@/components/video-settings-options';
import { VideoSettingsPanel } from '@/components/video-settings-panel';
import { AppMultiSelectCheckbox } from '@/shared/ui/app-multi-select-checkbox';
import { canvasThemes } from '@/lib/canvas-theme';
import { formatBytes, formatDuration } from '@/lib/image-utils';
import {
  boolConfig,
  isSeedanceVideoConfig,
  normalizeSeedanceRatio,
  seedanceReferenceLabel,
  seedanceVideoReferenceError,
  seedanceVideoReferenceHint,
  SEEDANCE_REFERENCE_LIMITS,
} from '@/lib/seedance-video';
import { deleteStoredMedia, resolveMediaUrl, uploadMediaFile } from '@/services/file-storage';
import { resolveImageUrl, uploadImage } from '@/services/image-storage';
import {
  createVideoGenerationTask,
  pollVideoGenerationTask,
  storeGeneratedVideo,
  type VideoGenerationTask,
} from '@/services/api/video';
import {
  WorkbenchContentGrid,
  WorkbenchEditorPanel,
  WorkbenchEmptyState,
  WorkbenchFailedCard,
  WorkbenchFieldHeader,
  WorkbenchHeader,
  WorkbenchLogEmpty,
  WorkbenchLogHeader,
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
  workbenchTagClassName,
  workbenchTagToneClassName,
} from '@/shared/ui/workbench-style';
import { useAssetStore } from '@/stores/use-asset-store';
import {
  modelOptionLabel,
  useConfigStore,
  useEffectiveConfig,
  type AiConfig,
} from '@/stores/use-config-store';
import { useThemeStore } from '@/stores/use-theme-store';
import type { ReferenceImage } from '@/types/image';
import type { ReferenceAudio, ReferenceVideo } from '@/types/media';

type GeneratedVideo = {
  id: string;
  url: string;
  storageKey: string;
  durationMs: number;
  width: number;
  height: number;
  bytes: number;
  mimeType: string;
};

type GenerationResult = {
  id: string;
  status: 'pending' | 'success' | 'failed';
  video?: GeneratedVideo;
  error?: string;
};

type GenerationLog = {
  id: string;
  createdAt: number;
  title: string;
  prompt: string;
  time: string;
  model: string;
  config: GenerationLogConfig;
  references: ReferenceImage[];
  videoReferences: ReferenceVideo[];
  audioReferences: ReferenceAudio[];
  durationMs: number;
  size: string;
  resolution: string;
  seconds: string;
  status: '生成中' | '成功' | '失败';
  task?: VideoGenerationTask;
  video?: GeneratedVideo;
  error?: string;
};

type GenerationLogConfig = Pick<
  AiConfig,
  | 'model'
  | 'videoModel'
  | 'size'
  | 'vquality'
  | 'videoSeconds'
  | 'videoGenerateAudio'
  | 'videoWatermark'
>;

type UpdateAiConfig = <K extends keyof AiConfig>(key: K, value: AiConfig[K]) => void;

const logStore = localforage.createInstance({
  name: 'infinite-canvas',
  storeName: 'video_generation_logs',
});

export default function VideoPage() {
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeLogIdsRef = useRef<Set<string>>(new Set());
  const refreshLogsRef = useRef<() => Promise<GenerationLog[]>>(async () => []);
  const effectiveConfig = useEffectiveConfig();
  const updateConfig = useConfigStore((state) => state.updateConfig);
  const isAiConfigReady = useConfigStore((state) => state.isAiConfigReady);
  const openConfigDialog = useConfigStore((state) => state.openConfigDialog);
  const addAsset = useAssetStore((state) => state.addAsset);
  const [prompt, setPrompt] = useState('');
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [videoReferences, setVideoReferences] = useState<ReferenceVideo[]>([]);
  const [audioReferences, setAudioReferences] = useState<ReferenceAudio[]>([]);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [running, setRunning] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [previewLog, setPreviewLog] = useState<GenerationLog | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const model = effectiveConfig.videoModel || effectiveConfig.model;
  const canGenerate = Boolean(prompt.trim());

  useEffect(() => {
    if (!running || !startedAt) return;
    const timer = window.setInterval(() => setElapsedMs(performance.now() - startedAt), 1000);
    return () => window.clearInterval(timer);
  }, [running, startedAt]);

  useEffect(() => {
    void refreshLogsRef.current();
  }, []);

  const addReferences = async (files?: FileList | null) => {
    const selectedFiles = Array.from(files || []);
    const unsupported = selectedFiles.filter(
      (file) =>
        !file.type.startsWith('image/') &&
        !file.type.startsWith('video/') &&
        !isSupportedAudioFile(file),
    );
    if (unsupported.length)
      message.warning('已忽略不支持的参考素材，请使用图片、mp4/mov 视频或 mp3/wav 音频');
    const imageFiles = selectedFiles
      .filter(
        (file) =>
          file.type.startsWith('image/') && file.size <= SEEDANCE_REFERENCE_LIMITS.imageMaxBytes,
      )
      .slice(0, SEEDANCE_REFERENCE_LIMITS.images - references.length);
    const videoFiles = selectedFiles
      .filter(
        (file) =>
          file.type.startsWith('video/') && file.size <= SEEDANCE_REFERENCE_LIMITS.videoMaxBytes,
      )
      .slice(0, SEEDANCE_REFERENCE_LIMITS.videos - videoReferences.length);
    const audioFiles = selectedFiles
      .filter(
        (file) =>
          isSupportedAudioFile(file) && file.size <= SEEDANCE_REFERENCE_LIMITS.audioMaxBytes,
      )
      .slice(0, SEEDANCE_REFERENCE_LIMITS.audios - audioReferences.length);
    if (
      selectedFiles.some(
        (file) =>
          file.type.startsWith('image/') && file.size > SEEDANCE_REFERENCE_LIMITS.imageMaxBytes,
      )
    )
      message.warning('已忽略超过 30MB 的参考图');
    if (
      selectedFiles.some(
        (file) =>
          file.type.startsWith('video/') && file.size > SEEDANCE_REFERENCE_LIMITS.videoMaxBytes,
      )
    )
      message.warning('已忽略超过 50MB 的参考视频');
    if (
      selectedFiles.some(
        (file) => isSupportedAudioFile(file) && file.size > SEEDANCE_REFERENCE_LIMITS.audioMaxBytes,
      )
    )
      message.warning('已忽略超过 15MB 的参考音频');
    const nextReferences = await Promise.all(
      imageFiles.map(async (file) => {
        const image = await uploadImage(file);
        return {
          id: nanoid(),
          name: file.name,
          type: image.mimeType,
          dataUrl: image.url,
          storageKey: image.storageKey,
        };
      }),
    );
    const nextVideoReferences = await Promise.all(
      videoFiles.map(async (file) => {
        const video = await uploadMediaFile(file, 'video-reference');
        return {
          id: nanoid(),
          name: file.name,
          type: video.mimeType,
          url: video.url,
          storageKey: video.storageKey,
          bytes: video.bytes,
          width: video.width,
          height: video.height,
          durationMs: video.durationMs,
        };
      }),
    );
    const nextAudioReferences = filterAudioReferencesByDuration(
      audioReferences,
      await Promise.all(
        audioFiles.map(async (file) => {
          const audio = await uploadMediaFile(file, 'audio-reference');
          return {
            id: nanoid(),
            name: file.name,
            type: audio.mimeType,
            url: audio.url,
            storageKey: audio.storageKey,
            durationMs: audio.durationMs,
          };
        }),
      ),
      message.warning,
    );
    setReferences((value) =>
      [...value, ...nextReferences].slice(0, SEEDANCE_REFERENCE_LIMITS.images),
    );
    setVideoReferences((value) =>
      [...value, ...nextVideoReferences].slice(0, SEEDANCE_REFERENCE_LIMITS.videos),
    );
    setAudioReferences((value) =>
      [...value, ...nextAudioReferences].slice(0, SEEDANCE_REFERENCE_LIMITS.audios),
    );
  };

  const addReferencesFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      const blobs = await Promise.all(
        items.flatMap((item) =>
          item.types.filter((type) => type.startsWith('image/')).map((type) => item.getType(type)),
        ),
      );
      if (!blobs.length) {
        message.error('剪切板里没有可读取的图片');
        return;
      }
      const nextReferences = await Promise.all(
        blobs
          .slice(0, SEEDANCE_REFERENCE_LIMITS.images - references.length)
          .map(async (blob, index) => {
            const image = await uploadImage(blob);
            return {
              id: nanoid(),
              name: `clipboard-${index + 1}.png`,
              type: image.mimeType,
              dataUrl: image.url,
              storageKey: image.storageKey,
            };
          }),
      );
      setReferences((value) =>
        [...value, ...nextReferences].slice(0, SEEDANCE_REFERENCE_LIMITS.images),
      );
      message.success(`已读取 ${nextReferences.length} 张参考图`);
    } catch {
      message.error('剪切板里没有可读取的图片');
    }
  };
  const generate = async () => {
    const snapshot = buildRequestSnapshot();
    if (!snapshot) return;
    setElapsedMs(0);
    setRunning(true);
    setPreviewLog(null);
    setResults([{ id: nanoid(), status: 'pending' }]);
    const batchStartedAt = performance.now();
    setStartedAt(batchStartedAt);
    try {
      const task = await createVideoGenerationTask(
        snapshot.config,
        snapshot.text,
        snapshot.references,
        snapshot.videoReferences,
        snapshot.audioReferences,
      );
      const log = buildLog({
        prompt: snapshot.text,
        model,
        config: snapshot.config,
        references: snapshot.references,
        videoReferences: snapshot.videoReferences,
        audioReferences: snapshot.audioReferences,
        durationMs: 0,
        status: '生成中',
        task,
      });
      await saveLog(log);
      void pollGenerationLog(log, snapshot.config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败';
      setResults([{ id: nanoid(), status: 'failed', error: errorMessage }]);
      await saveLog(
        buildLog({
          prompt: snapshot.text,
          model,
          config: snapshot.config,
          references: snapshot.references,
          videoReferences: snapshot.videoReferences,
          audioReferences: snapshot.audioReferences,
          durationMs: performance.now() - batchStartedAt,
          status: '失败',
          error: errorMessage,
        }),
      );
      message.error(errorMessage);
      setRunning(false);
    }
  };

  const buildRequestSnapshot = () => {
    const text = prompt.trim();
    if (!text) {
      message.error('请输入视频提示词');
      return null;
    }
    if (!isAiConfigReady(effectiveConfig, model)) {
      message.warning('请先完成配置');
      openConfigDialog(true);
      return null;
    }
    const videoReferenceError = seedanceVideoReferenceError(videoReferences);
    if (videoReferenceError) {
      message.error(`${videoReferenceError}。${seedanceVideoReferenceHint}`);
      return null;
    }
    return {
      text,
      config: buildVideoConfig(effectiveConfig, model),
      references: [...references],
      videoReferences: [...videoReferences],
      audioReferences: [...audioReferences],
    };
  };

  const retryResult = () => {
    void generate();
  };

  const downloadVideo = (video: GeneratedVideo) => {
    saveAs(video.url, 'video.mp4');
  };

  const saveResultToAssets = (video: GeneratedVideo) => {
    addAsset({
      kind: 'video',
      title: '生成视频',
      coverUrl: '',
      tags: [],
      source: '视频创作台',
      data: {
        url: video.url,
        storageKey: video.storageKey,
        width: video.width,
        height: video.height,
        bytes: video.bytes,
        mimeType: video.mimeType,
      },
      metadata: { source: 'video-page', prompt },
    });
    message.success('已加入我的素材');
  };

  const insertPickedAsset = async (payload: InsertAssetPayload) => {
    if (payload.kind === 'text') {
      setPrompt(payload.content);
    } else if (payload.kind === 'image') {
      const stored = await uploadImage(payload.dataUrl);
      setReferences((value) =>
        [
          ...value,
          {
            id: nanoid(),
            name: payload.title,
            type: stored.mimeType,
            dataUrl: stored.url,
            storageKey: stored.storageKey,
          },
        ].slice(0, SEEDANCE_REFERENCE_LIMITS.images),
      );
    } else if (payload.kind === 'video') {
      setVideoReferences((value) =>
        [
          ...value,
          {
            id: nanoid(),
            name: payload.title,
            type: 'video/mp4',
            url: payload.url,
            storageKey: payload.storageKey,
            width: payload.width,
            height: payload.height,
          },
        ].slice(0, SEEDANCE_REFERENCE_LIMITS.videos),
      );
    }
    setAssetPickerOpen(false);
  };

  const createSession = () => {
    setPrompt('');
    setReferences([]);
    setVideoReferences([]);
    setAudioReferences([]);
    setResults([]);
    setElapsedMs(0);
    setStartedAt(0);
    setSelectedLogIds([]);
    setPreviewLog(null);
  };

  const deleteSelectedLogs = () => {
    const mediaKeys = logs
      .filter((log) => selectedLogIds.includes(log.id))
      .map((log) => log.video?.storageKey)
      .filter((key): key is string => Boolean(key));
    void Promise.all([
      deleteStoredMedia(mediaKeys),
      ...selectedLogIds.map((id) => logStore.removeItem(id)),
    ]).then(refreshLogs);
    if (previewLog && selectedLogIds.includes(previewLog.id)) {
      setPreviewLog(null);
      setResults([]);
    }
    setSelectedLogIds([]);
    setDeleteConfirmOpen(false);
  };

  const saveLog = async (log: GenerationLog) => {
    await logStore.setItem(log.id, serializeLog(log));
    await refreshLogs();
  };

  const refreshLogs = async () => {
    const nextLogs = await readStoredLogs();
    setLogs(nextLogs);
    resumePendingLogs(nextLogs);
    return nextLogs;
  };
  refreshLogsRef.current = refreshLogs;

  const resumePendingLogs = (items: GenerationLog[]) => {
    for (const log of items) {
      if (log.status === '生成中' && log.task) void pollGenerationLog(log);
    }
  };

  const pollGenerationLog = async (log: GenerationLog, configOverride?: AiConfig) => {
    if (!log.task || activeLogIdsRef.current.has(log.id)) return;
    activeLogIdsRef.current.add(log.id);
    setRunning(true);
    setStartedAt((value) => value || performance.now());
    setResults((value) => (value.length ? value : [{ id: log.id, status: 'pending' }]));
    const taskConfig = buildVideoConfig(
      { ...effectiveConfig, ...log.config },
      log.task.model || log.model,
    );
    try {
      for (let attempt = 0; attempt < 120; attempt += 1) {
        const state = await pollVideoGenerationTask(configOverride || taskConfig, log.task);
        if (state.status === 'completed') {
          const stored = await storeGeneratedVideo(state.result);
          const nextVideo: GeneratedVideo = {
            id: nanoid(),
            url: stored.url,
            storageKey: stored.storageKey,
            durationMs: Date.now() - log.createdAt,
            width: stored.width || 1280,
            height: stored.height || 720,
            bytes: stored.bytes,
            mimeType: stored.mimeType,
          };
          setResults([{ id: nextVideo.id, status: 'success', video: nextVideo }]);
          await saveLog({
            ...log,
            status: '成功',
            durationMs: nextVideo.durationMs,
            video: nextVideo,
            error: undefined,
          });
          message.success('视频已生成');
          return;
        }
        if (state.status === 'failed') throw new Error(state.error);
        if (attempt === 119) throw new Error('视频生成超时，请稍后重试');
        await delay(log.task.provider === 'seedance' ? 5000 : 2500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败';
      setResults([{ id: log.id, status: 'failed', error: errorMessage }]);
      await saveLog({
        ...log,
        status: '失败',
        durationMs: Date.now() - log.createdAt,
        error: errorMessage,
      });
      message.error(errorMessage);
    } finally {
      activeLogIdsRef.current.delete(log.id);
      if (!activeLogIdsRef.current.size) {
        setRunning(false);
        setStartedAt(0);
      }
    }
  };

  const previewGenerationLog = (log: GenerationLog) => {
    setPreviewLog(log);
    setLogsOpen(false);
    setPrompt(log.prompt);
    setReferences(log.references || []);
    setVideoReferences(log.videoReferences || []);
    setAudioReferences(log.audioReferences || []);
    if (log.config.videoModel || log.model)
      updateConfig('videoModel', log.config.videoModel || log.model);
    if (log.config.size) updateConfig('size', log.config.size);
    if (log.config.vquality) updateConfig('vquality', log.config.vquality);
    if (log.config.videoSeconds) updateConfig('videoSeconds', log.config.videoSeconds);
    if (log.config.videoGenerateAudio)
      updateConfig('videoGenerateAudio', log.config.videoGenerateAudio);
    if (log.config.videoWatermark) updateConfig('videoWatermark', log.config.videoWatermark);
    setResults(
      log.status === '生成中'
        ? [{ id: log.id, status: 'pending' }]
        : log.video
          ? [{ id: log.video.id, status: 'success', video: log.video }]
          : [{ id: log.id, status: 'failed', error: log.error || '生成失败' }],
    );
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
            onPreviewLog={previewGenerationLog}
          />
        </WorkbenchSidebar>

        <WorkbenchContentGrid>
          <WorkbenchEditorPanel>
            <WorkbenchHeader
              title="视频创作台"
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
                  placeholder="描述镜头运动、主体动作、场景氛围和画面风格"
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
                <WorkbenchReferenceStrip>
                  {references.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative size-20 shrink-0 overflow-hidden rounded-md border border-border"
                    >
                      <img src={item.dataUrl} alt={item.name} className="size-full object-cover" />
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {seedanceReferenceLabel('image', index)}
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
                    <WorkbenchReferenceEmpty>暂无参考图，最多 9 张</WorkbenchReferenceEmpty>
                  ) : null}
                </WorkbenchReferenceStrip>
              </div>

              <div className="min-w-0">
                <WorkbenchFieldHeader
                  title="参考视频"
                  actions={
                    <Button
                      size="small"
                      icon={<Upload className="size-3.5" />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      上传
                    </Button>
                  }
                />
                <WorkbenchReferenceStrip>
                  {videoReferences.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative h-20 w-32 shrink-0 overflow-hidden rounded-md border border-border bg-black"
                    >
                      <video
                        src={item.url}
                        className="size-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {seedanceReferenceLabel('video', index)}
                      </span>
                      <WorkbenchReferenceOrderButtons
                        index={index}
                        total={videoReferences.length}
                        onMove={(offset) =>
                          setVideoReferences((value) => moveWorkbenchListItem(value, index, offset))
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 hidden size-6 items-center justify-center rounded bg-black/60 text-white group-hover:flex"
                        onClick={() =>
                          setVideoReferences((value) => value.filter((ref) => ref.id !== item.id))
                        }
                        aria-label="移除参考视频"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  {!videoReferences.length ? (
                    <WorkbenchReferenceEmpty>暂无参考视频，最多 3 个</WorkbenchReferenceEmpty>
                  ) : null}
                </WorkbenchReferenceStrip>
              </div>

              <div className="min-w-0">
                <WorkbenchFieldHeader
                  title="参考音频"
                  actions={
                    <Button
                      size="small"
                      icon={<Upload className="size-3.5" />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      上传
                    </Button>
                  }
                />
                <WorkbenchReferenceStrip>
                  {audioReferences.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative flex h-20 w-48 shrink-0 flex-col justify-center gap-2 rounded-md border border-border bg-muted px-2"
                    >
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <Music2 className="size-4 shrink-0" />
                        <span className="shrink-0 rounded bg-secondary px-1 text-[10px] text-secondary-foreground">
                          {seedanceReferenceLabel('audio', index)}
                        </span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <audio src={item.url} controls className="h-8 w-full" preload="metadata" />
                      <WorkbenchReferenceOrderButtons
                        index={index}
                        total={audioReferences.length}
                        onMove={(offset) =>
                          setAudioReferences((value) => moveWorkbenchListItem(value, index, offset))
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 hidden size-6 items-center justify-center rounded bg-black/60 text-white group-hover:flex"
                        onClick={() =>
                          setAudioReferences((value) => value.filter((ref) => ref.id !== item.id))
                        }
                        aria-label="移除参考音频"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  {!audioReferences.length ? (
                    <WorkbenchReferenceEmpty>
                      暂无参考音频，最多 3 个，mp3/wav，单个 15MB 内
                    </WorkbenchReferenceEmpty>
                  ) : null}
                </WorkbenchReferenceStrip>
              </div>

              <WorkbenchMobileSummary
                summary={`${modelOptionLabel(effectiveConfig, model)} · ${normalizeResolution(
                  effectiveConfig.vquality,
                )}p · ${videoSizeLabel(effectiveConfig.size)} · ${normalizeVideoSeconds(
                  effectiveConfig.videoSeconds,
                )}s`}
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
              <div className="grid gap-4">
                {results.map((result) =>
                  result.status === 'success' && result.video ? (
                    <ResultVideoCard
                      key={result.id}
                      video={result.video}
                      onDownload={downloadVideo}
                      onSaveAsset={saveResultToAssets}
                    />
                  ) : result.status === 'failed' ? (
                    <FailedVideoCard
                      key={result.id}
                      error={result.error || '生成失败'}
                      onRetry={retryResult}
                    />
                  ) : (
                    <PendingVideoCard key={result.id} />
                  ),
                )}
              </div>
            ) : (
              <WorkbenchEmptyState icon={VideoIcon} description="还没有生成视频" />
            )}
          </WorkbenchResultsPanel>
        </WorkbenchContentGrid>
      </WorkbenchMainGrid>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/quicktime,audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav"
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
          onPreviewLog={previewGenerationLog}
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
  const theme = canvasThemes[useThemeStore((state) => state.theme)];

  return (
    <>
      <label className="col-span-2 block min-w-0 sm:col-span-1">
        <span className="mb-1.5 block text-sm font-semibold sm:mb-2 sm:text-base">模型</span>
        <ModelPicker
          config={config}
          value={model}
          onChange={(value) => updateConfig('videoModel', value)}
          capability="video"
          fullWidth
          onMissingConfig={() => openConfigDialog(false)}
        />
      </label>
      <div className="col-span-2">
        <VideoSettingsPanel
          config={config}
          onConfigChange={(key, value) => updateConfig(key, value)}
          theme={theme}
          showTitle={false}
          className="space-y-4"
        />
      </div>
    </>
  );
}

function ResultVideoCard({
  video,
  onDownload,
  onSaveAsset,
}: {
  video: GeneratedVideo;
  onDownload: (video: GeneratedVideo) => void;
  onSaveAsset: (video: GeneratedVideo) => void;
}) {
  return (
    <WorkbenchMediaCard
      meta={
        <>
          <span>
            {video.width}x{video.height}
          </span>
          <span>{formatBytes(video.bytes)}</span>
          <span>{formatDuration(video.durationMs)}</span>
        </>
      }
      actions={
        <div className="flex shrink-0 gap-1">
          <Button
            size="small"
            icon={<FolderPlus className="size-3.5" />}
            onClick={() => onSaveAsset(video)}
          >
            添加到素材
          </Button>
          <Button
            size="small"
            icon={<Download className="size-3.5" />}
            onClick={() => onDownload(video)}
          >
            下载
          </Button>
        </div>
      }
    >
      <video src={video.url} controls className="aspect-video w-full bg-black object-contain" />
    </WorkbenchMediaCard>
  );
}

function PendingVideoCard() {
  return <WorkbenchPendingCard aspect="video" />;
}

function FailedVideoCard({ error, onRetry }: { error: string; onRetry: () => void }) {
  return <WorkbenchFailedCard aspect="video" error={error} onRetry={onRetry} />;
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
        {logs.map((log) => (
          <LogCard
            key={log.id}
            log={log}
            selected={selectedLogIds.includes(log.id)}
            active={activeLogId === log.id}
            onSelectedChange={(checked) =>
              onSelectedLogIdsChange(
                checked
                  ? [...selectedLogIds, log.id]
                  : selectedLogIds.filter((id) => id !== log.id),
              )
            }
            onClick={() => onPreviewLog(log)}
          />
        ))}
        {!logs.length ? <WorkbenchLogEmpty /> : null}
      </div>
    </>
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
  return (
    <button type="button" className={workbenchLogCardClassName(active)} onClick={onClick}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
        <AppMultiSelectCheckbox
          className="mt-0.5"
          checked={selected}
          onCheckedChange={onSelectedChange}
          ariaLabel={`选择生成记录 ${log.title}`}
          stopPropagation
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-5">{log.title}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            <Tag className={workbenchTagClassName}>{log.size}</Tag>
            <Tag className={workbenchTagClassName}>{log.resolution}p</Tag>
            <Tag className={workbenchTagClassName}>{log.seconds}s</Tag>
          </div>
        </div>
        <div className="grid justify-items-end gap-2">
          <Tag className={videoLogStatusTagClassName(log.status)}>{log.status}</Tag>
          <Tag className={workbenchTagToneClassName.success}>{formatDuration(log.durationMs)}</Tag>
        </div>
      </div>
    </button>
  );
}

function videoLogStatusTagClassName(status: GenerationLog['status']) {
  if (status === '成功') return workbenchTagToneClassName.primary;
  if (status === '生成中') return workbenchTagToneClassName.warning;
  return workbenchTagToneClassName.danger;
}

async function readStoredLogs() {
  if (typeof window === 'undefined') return [];
  try {
    const logs: GenerationLog[] = [];
    await logStore.iterate<GenerationLog, void>((value) => {
      logs.push(value);
    });
    return (await Promise.all(logs.map(normalizeLog))).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    );
  } catch {
    return [];
  }
}

async function normalizeLog(log: Partial<GenerationLog>): Promise<GenerationLog> {
  const video = log.video?.storageKey
    ? { ...log.video, url: await resolveMediaUrl(log.video.storageKey, log.video.url) }
    : log.video;
  const videoReferences = await Promise.all(
    (log.videoReferences || []).map(async (item) => ({
      ...item,
      url: item.storageKey ? await resolveMediaUrl(item.storageKey, item.url) : item.url,
    })),
  );
  const audioReferences = await Promise.all(
    (log.audioReferences || []).map(async (item) => ({
      ...item,
      url: item.storageKey ? await resolveMediaUrl(item.storageKey, item.url) : item.url,
    })),
  );
  const references = await Promise.all(
    (log.references || []).map(async (item) => ({
      ...item,
      dataUrl: await resolveImageUrl(item.storageKey, item.dataUrl),
    })),
  );
  const config = normalizeLogConfig(log);
  return {
    id: log.id || nanoid(),
    createdAt: log.createdAt || Date.now(),
    title: log.title || log.model || '未命名',
    prompt: log.prompt || '',
    time: log.time || new Date().toLocaleString('zh-CN', { hour12: false }),
    model: log.model || config.videoModel || '',
    config,
    references,
    videoReferences,
    audioReferences,
    durationMs: log.durationMs || 0,
    size: log.size || config.size || '',
    resolution: normalizeResolution(log.resolution || config.vquality || ''),
    seconds: log.seconds || config.videoSeconds || '',
    status: log.status || '成功',
    task: log.task,
    video,
    error: log.error,
  };
}

function serializeLog(log: GenerationLog): GenerationLog {
  return {
    ...log,
    references: log.references.map((item) => ({
      ...item,
      dataUrl: item.storageKey ? '' : item.dataUrl,
    })),
    videoReferences: log.videoReferences.map((item) =>
      item.storageKey ? { ...item, url: '' } : item,
    ),
    audioReferences: log.audioReferences.map((item) =>
      item.storageKey ? { ...item, url: '' } : item,
    ),
    video: log.video?.storageKey ? { ...log.video, url: '' } : log.video,
  };
}

function isSupportedAudioFile(file: File) {
  return (
    file.type === 'audio/mpeg' ||
    file.type === 'audio/mp3' ||
    file.type === 'audio/wav' ||
    file.type === 'audio/x-wav' ||
    /\.(mp3|wav)$/i.test(file.name)
  );
}

function filterAudioReferencesByDuration(
  existing: ReferenceAudio[],
  next: ReferenceAudio[],
  warn: (content: string) => void,
) {
  let total = existing.reduce((sum, item) => sum + (item.durationMs || 0), 0);
  const accepted: ReferenceAudio[] = [];
  let skipped = false;
  for (const item of next) {
    if (item.durationMs && (item.durationMs < 2000 || item.durationMs > 15000)) {
      skipped = true;
      continue;
    }
    if (item.durationMs && total + item.durationMs > 15000) {
      skipped = true;
      continue;
    }
    total += item.durationMs || 0;
    accepted.push(item);
  }
  if (skipped) warn('已忽略不符合时长要求的参考音频：单个 2-15 秒，总时长不超过 15 秒');
  return accepted;
}

function normalizeLogConfig(log: Partial<GenerationLog>): GenerationLogConfig {
  return {
    model: log.config?.model || log.model || '',
    videoModel: log.config?.videoModel || log.model || '',
    size: log.config?.size || log.size || '',
    vquality: normalizeResolution(log.config?.vquality || log.resolution || ''),
    videoSeconds: log.config?.videoSeconds || log.seconds || '',
    videoGenerateAudio: log.config?.videoGenerateAudio || 'true',
    videoWatermark: log.config?.videoWatermark || 'false',
  };
}

function buildLog({
  prompt,
  model,
  config,
  references,
  videoReferences,
  audioReferences,
  durationMs,
  status,
  task,
  video,
  error,
}: {
  prompt: string;
  model: string;
  config: AiConfig;
  references: ReferenceImage[];
  videoReferences: ReferenceVideo[];
  audioReferences: ReferenceAudio[];
  durationMs: number;
  status: GenerationLog['status'];
  task?: VideoGenerationTask;
  video?: GeneratedVideo;
  error?: string;
}): GenerationLog {
  const logConfig = {
    model: config.model,
    videoModel: config.videoModel,
    size: config.size,
    vquality: normalizeResolution(config.vquality),
    videoSeconds: config.videoSeconds,
    videoGenerateAudio: config.videoGenerateAudio,
    videoWatermark: config.videoWatermark,
  };
  return {
    id: nanoid(),
    createdAt: Date.now(),
    title: prompt.slice(0, 12) || '未命名',
    prompt,
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    model,
    config: logConfig,
    references,
    videoReferences,
    audioReferences,
    durationMs,
    size: logConfig.size,
    resolution: logConfig.vquality,
    seconds: logConfig.videoSeconds,
    status,
    task,
    video,
    error,
  };
}

function buildVideoConfig(config: AiConfig, model: string): AiConfig {
  const seedance = isSeedanceVideoConfig({ ...config, model });
  return {
    ...config,
    model,
    videoModel: model,
    size: seedance ? normalizeSeedanceRatio(config.size) : normalizeVideoSize(config.size),
    videoSeconds: normalizeVideoSeconds(config.videoSeconds),
    vquality: normalizeResolution(config.vquality),
    videoGenerateAudio: String(boolConfig(config.videoGenerateAudio, true)),
    videoWatermark: String(boolConfig(config.videoWatermark, false)),
  };
}

function normalizeVideoSeconds(value: string) {
  if (String(value).trim() === '-1') return '-1';
  const seconds = Math.floor(Number(value) || 6);
  return String(Math.max(1, Math.min(20, seconds)));
}

function normalizeVideoSize(value: string) {
  return normalizeVideoSizeValue(value);
}

function normalizeResolution(value: string) {
  return normalizeVideoResolutionValue(value);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
