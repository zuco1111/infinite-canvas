export type AiRequestKind = 'text' | 'image' | 'video' | 'audio';

export type AiProviderRequest<TInput = unknown> = {
  kind: AiRequestKind;
  input: TInput;
  signal?: AbortSignal;
};

export type AiProviderResult<TOutput = unknown> = {
  providerId: string;
  output: TOutput;
  createdAt: string;
};

export type AiProviderPort = {
  id: string;
  title: string;
  request: <TInput = unknown, TOutput = unknown>(
    request: AiProviderRequest<TInput>,
  ) => Promise<AiProviderResult<TOutput>>;
};
