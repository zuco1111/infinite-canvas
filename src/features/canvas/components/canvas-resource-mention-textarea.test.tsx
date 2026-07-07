import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CanvasResourceReference } from '../utils/canvas-resource-references';
import { CanvasResourceMentionTextarea } from './canvas-resource-mention-textarea';

const activeTextReference: CanvasResourceReference = {
  id: 'text-1',
  nodeId: 'text-1',
  kind: 'text',
  label: '文本1',
  title: '文本节点',
  text: '参考文本',
  active: true,
};

describe('CanvasResourceMentionTextarea', () => {
  it('keeps the real textarea above the highlight overlay so the caret remains visible', () => {
    const { container } = render(
      <CanvasResourceMentionTextarea
        value="引用 文本1"
        references={[activeTextReference]}
        onChange={vi.fn()}
        className="rounded-xl border"
        style={{ color: 'red' }}
      />,
    );

    const textarea = screen.getByRole('textbox');
    const overlay = container.querySelector('[aria-hidden="true"]');

    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyle({ zIndex: '0' });
    expect(textarea).toHaveStyle({ position: 'relative', zIndex: '1' });
    expect(getComputedStyle(textarea).color).toBe('rgba(0, 0, 0, 0)');
    expect((textarea as HTMLTextAreaElement).style.getPropertyValue('caret-color')).toBe('red');
    expect(
      (textarea as HTMLTextAreaElement).style.getPropertyValue('-webkit-text-fill-color'),
    ).toBe('transparent');
  });
});
