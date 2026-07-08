import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultConfig, encodeChannelModel, type AiConfig } from '@/features/settings';

import {
  fetchChannelModels,
  IMAGE_REQUEST_TIMEOUT_MS,
  requestEdit,
  requestGeneration,
} from './image-generation-api';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn(() => false),
    isCancel: vi.fn(() => false),
  },
}));

const mockedAxios = vi.mocked(axios);

function imageConfig(model: string): AiConfig {
  const channelModel = encodeChannelModel('default', model);
  return {
    ...defaultConfig,
    apiKey: 'test-key',
    baseUrl: 'https://api.example.com',
    model: channelModel,
    imageModel: channelModel,
    channels: [
      {
        id: 'default',
        name: '默认渠道',
        baseUrl: 'https://api.example.com',
        apiKey: 'test-key',
        apiFormat: 'openai',
        models: [model],
      },
    ],
    models: [channelModel],
    imageModels: [channelModel],
    quality: 'auto',
    size: '1:1',
    count: '1',
  };
}

describe('image api requests', () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
    mockedAxios.post.mockResolvedValue({
      data: { data: [{ b64_json: 'aW1hZ2U=' }] },
    });
  });

  it('does not send response_format for GPT image models', async () => {
    await requestGeneration(imageConfig('gpt-image-2'), 'test prompt');

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [, body, options] = mockedAxios.post.mock.calls[0];
    expect(body).toMatchObject({ model: 'gpt-image-2', output_format: 'png' });
    expect(body).not.toHaveProperty('response_format');
    expect(options).toMatchObject({ timeout: IMAGE_REQUEST_TIMEOUT_MS });
  });

  it('keeps response_format for non-GPT image generation models', async () => {
    await requestGeneration(imageConfig('dall-e-3'), 'test prompt');

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(body).toMatchObject({ model: 'dall-e-3', response_format: 'b64_json' });
    expect(body).not.toHaveProperty('output_format');
  });

  it('uses image array field for GPT image edits', async () => {
    await requestEdit(imageConfig('gpt-image-2'), 'edit prompt', [referenceImage()]);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [, body, options] = mockedAxios.post.mock.calls[0];
    expect(body).toBeInstanceOf(FormData);
    const formData = body as FormData;
    expect(formData.get('model')).toBe('gpt-image-2');
    expect(formData.get('output_format')).toBe('png');
    expect(formData.get('response_format')).toBeNull();
    expect(formData.getAll('image[]')).toHaveLength(1);
    expect(formData.has('image')).toBe(false);
    expect(options).toMatchObject({ timeout: IMAGE_REQUEST_TIMEOUT_MS });
  });

  it('keeps image field for non-GPT image edits', async () => {
    await requestEdit(imageConfig('dall-e-2'), 'edit prompt', [referenceImage()]);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(body).toBeInstanceOf(FormData);
    const formData = body as FormData;
    expect(formData.get('model')).toBe('dall-e-2');
    expect(formData.get('response_format')).toBe('b64_json');
    expect(formData.get('output_format')).toBeNull();
    expect(formData.getAll('image')).toHaveLength(1);
    expect(formData.has('image[]')).toBe(false);
  });

  it('reports stalled image edit requests as timeouts', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      code: 'ECONNABORTED',
      message: `timeout of ${IMAGE_REQUEST_TIMEOUT_MS}ms exceeded`,
    });
    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    await expect(
      requestEdit(imageConfig('gpt-image-2'), 'edit prompt', [referenceImage()]),
    ).rejects.toThrow('图片编辑失败：请求超时，请稍后重试');
  });

  it('fetches OpenAI-compatible channel models through the remote proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 'gpt-image-2' }, { id: 'gpt-image-1.5' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchChannelModels({
        id: 'default',
        name: '默认渠道',
        baseUrl: 'https://api.example.com/',
        apiKey: ' test-key ',
        apiFormat: 'openai',
        models: [],
      }),
    ).resolves.toEqual(['gpt-image-1.5', 'gpt-image-2']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    const requestUrl = new URL(String(url), window.location.origin);
    expect(requestUrl.pathname).toBe('/__ai-proxy');
    expect(requestUrl.searchParams.get('target')).toBe('https://api.example.com/v1/models');
    expect(options).toMatchObject({
      headers: {
        Authorization: 'Bearer test-key',
      },
    });
  });
});

function referenceImage() {
  return {
    id: 'ref-1',
    name: 'reference.png',
    type: 'image/png',
    dataUrl: 'data:image/png;base64,aW1hZ2U=',
  };
}
