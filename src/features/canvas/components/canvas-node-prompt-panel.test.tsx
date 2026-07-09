import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CanvasNodeType, type CanvasNodeData } from '../types';
import { CanvasNodePromptPanel } from './canvas-node-prompt-panel';

vi.mock('@/features/settings', () => ({
  defaultConfig: {
    model: 'default::gpt-image-2',
    imageModel: 'default::gpt-image-2',
    quality: 'auto',
    size: '1024x1024',
    count: '1',
  },
  ModelPicker: () => <div data-testid="model-picker" />,
  useAppTheme: () => 'light',
  useEffectiveConfig: () => ({
    model: 'default::gpt-image-2',
    imageModel: 'default::gpt-image-2',
    quality: 'auto',
    size: '1024x1024',
    count: '1',
    canvasImageCount: '1',
  }),
  useOpenConfigDialog: () => vi.fn(),
}));

vi.mock('@/features/prompts', () => ({
  CanvasPromptLibrary: () => <button type="button">提示词库</button>,
}));

vi.mock('./canvas-image-settings-popover', () => ({
  CanvasImageSettingsPopover: () => <button type="button">图片设置</button>,
}));

vi.mock('./canvas-video-settings-popover', () => ({
  CanvasVideoSettingsPopover: () => <button type="button">视频设置</button>,
}));

vi.mock('./canvas-audio-settings-popover', () => ({
  CanvasAudioSettingsPopover: () => <button type="button">音频设置</button>,
}));

const baseImageNode: CanvasNodeData = {
  id: 'image-1',
  type: CanvasNodeType.Image,
  title: '图片节点',
  position: { x: 0, y: 0 },
  width: 280,
  height: 280,
  metadata: {},
};

afterEach(() => cleanup());

describe('CanvasNodePromptPanel', () => {
  it('keeps the submitted image prompt visible while generation is starting', async () => {
    const onGenerate = vi.fn();

    render(
      <CanvasNodePromptPanel
        node={baseImageNode}
        isRunning={false}
        onPromptChange={vi.fn()}
        onConfigChange={vi.fn()}
        onGenerate={onGenerate}
        onStop={vi.fn()}
      />,
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '生成一张蓝色海报' } });
    fireEvent.click(screen.getByRole('button', { name: '生成' }));

    expect(onGenerate).toHaveBeenCalledWith('image-1', 'image', '生成一张蓝色海报');
    await waitFor(() => expect(textarea).toHaveValue('生成一张蓝色海报'));
  });

  it('clears the submitted image prompt after a running image node receives content', async () => {
    const { rerender } = render(
      <CanvasNodePromptPanel
        node={baseImageNode}
        isRunning={false}
        onPromptChange={vi.fn()}
        onConfigChange={vi.fn()}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
      />,
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '生成一张蓝色海报' } });
    fireEvent.click(screen.getByRole('button', { name: '生成' }));

    rerender(
      <CanvasNodePromptPanel
        node={{ ...baseImageNode, metadata: { prompt: '生成一张蓝色海报', status: 'loading' } }}
        isRunning
        onPromptChange={vi.fn()}
        onConfigChange={vi.fn()}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
      />,
    );
    expect(textarea).toHaveValue('生成一张蓝色海报');

    rerender(
      <CanvasNodePromptPanel
        node={{
          ...baseImageNode,
          metadata: {
            prompt: '生成一张蓝色海报',
            status: 'success',
            content: 'data:image/png;base64,AAAA',
          },
        }}
        isRunning={false}
        onPromptChange={vi.fn()}
        onConfigChange={vi.fn()}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
      />,
    );

    await waitFor(() => expect(textarea).toHaveValue(''));
  });
});
