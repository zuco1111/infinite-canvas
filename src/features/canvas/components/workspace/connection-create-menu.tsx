'use client';

import type { ReactNode } from 'react';
import { ImageIcon, List, Music2, Settings2, Video } from 'lucide-react';

import { useAppTheme } from '@/features/settings';
import { canvasThemes } from '@/shared/tokens/canvas-theme';
import { CanvasNodeType, type ConnectionHandle, type Position } from '../../types';

export type PendingConnectionCreate = {
  connection: ConnectionHandle;
  position: Position;
};

type ConnectionCreateMenuProps = {
  pending: PendingConnectionCreate;
  onCreate: (
    type:
      | CanvasNodeType.Image
      | CanvasNodeType.Text
      | CanvasNodeType.Config
      | CanvasNodeType.Video
      | CanvasNodeType.Audio,
  ) => void;
  onClose: () => void;
};

export function ConnectionCreateMenu({ pending, onCreate, onClose }: ConnectionCreateMenuProps) {
  const theme = canvasThemes[useAppTheme()];
  return (
    <div
      className="absolute z-[120] w-[300px] rounded-[18px] border p-3 shadow-2xl backdrop-blur"
      data-connection-create-menu
      style={{
        left: pending.position.x,
        top: pending.position.y,
        background: theme.node.panel,
        borderColor: theme.node.stroke,
        color: theme.node.text,
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-medium" style={{ color: theme.node.muted }}>
          引用该节点生成
        </span>
        <button
          type="button"
          className="grid size-7 place-items-center rounded-lg text-base opacity-55 transition hover:bg-white/10 hover:opacity-100"
          onClick={onClose}
          aria-label="关闭"
        >
          ×
        </button>
      </div>
      <div className="grid gap-1">
        <ConnectionCreateOption
          theme={theme}
          icon={<List className="size-5" />}
          title="文本生成"
          description="脚本、广告词、品牌文案"
          onClick={() => onCreate(CanvasNodeType.Text)}
        />
        <ConnectionCreateOption
          theme={theme}
          icon={<ImageIcon className="size-5" />}
          title="图片生成"
          onClick={() => onCreate(CanvasNodeType.Image)}
        />
        <ConnectionCreateOption
          theme={theme}
          icon={<Video className="size-5" />}
          title="视频生成"
          onClick={() => onCreate(CanvasNodeType.Video)}
        />
        <ConnectionCreateOption
          theme={theme}
          icon={<Music2 className="size-5" />}
          title="音频参考"
          onClick={() => onCreate(CanvasNodeType.Audio)}
        />
        <ConnectionCreateOption
          theme={theme}
          icon={<Settings2 className="size-5" />}
          title="配置节点"
          description="模型、尺寸、数量和输入顺序"
          onClick={() => onCreate(CanvasNodeType.Config)}
        />
      </div>
    </div>
  );
}

function ConnectionCreateOption({
  theme,
  icon,
  title,
  description,
  onClick,
}: {
  theme: (typeof canvasThemes)[keyof typeof canvasThemes];
  icon: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-16 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 text-left transition"
      style={{ color: theme.node.text }}
      onClick={onClick}
      onMouseEnter={(event) => (event.currentTarget.style.background = theme.node.fill)}
      onMouseLeave={(event) => (event.currentTarget.style.background = 'transparent')}
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl"
        style={{ background: theme.node.fill, color: theme.node.muted }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-base font-semibold leading-5">{title}</span>
        {description ? (
          <span className="mt-1 block truncate text-sm" style={{ color: theme.node.muted }}>
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
