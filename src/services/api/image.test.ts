import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultConfig, encodeChannelModel, type AiConfig } from '@/stores/use-config-store';

import { requestGeneration } from './image';

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
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(body).toMatchObject({ model: 'gpt-image-2', output_format: 'png' });
    expect(body).not.toHaveProperty('response_format');
  });

  it('keeps response_format for legacy image generation models', async () => {
    await requestGeneration(imageConfig('dall-e-3'), 'test prompt');

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(body).toMatchObject({ model: 'dall-e-3', response_format: 'b64_json' });
    expect(body).not.toHaveProperty('output_format');
  });
});
