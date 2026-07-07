import localforage from 'localforage';

import { collectResourceStorageKeys } from '@/shared/storage/resource-usage';
import { registerResourceUsageCollector } from '@/shared/storage/resource-usage-registry';

export type StoredGenerationLog = Record<string, unknown> & { id?: string };

export type GenerationLogRepository = {
  list: <TLog extends StoredGenerationLog = StoredGenerationLog>() => Promise<TLog[]>;
  save: <TLog extends StoredGenerationLog & { id: string }>(log: TLog) => Promise<void>;
  removeMany: (ids: string[]) => Promise<void>;
  replace: <TLog extends StoredGenerationLog = StoredGenerationLog>(logs: TLog[]) => Promise<void>;
  collectResourceKeys: () => Promise<Set<string>>;
};

export const imageGenerationLogRepository = createGenerationLogRepository(
  'image_generation_logs',
  'generation-image-logs',
);

export const videoGenerationLogRepository = createGenerationLogRepository(
  'video_generation_logs',
  'generation-video-logs',
);

function createGenerationLogRepository(
  storeName: string,
  resourceCollectorId: string,
): GenerationLogRepository {
  const store = localforage.createInstance({
    name: 'infinite-canvas',
    storeName,
  });

  const repository: GenerationLogRepository = {
    list: async <TLog extends StoredGenerationLog = StoredGenerationLog>() => {
      const logs: TLog[] = [];
      await store.iterate<TLog, void>((value) => {
        if (value && typeof value === 'object') logs.push(value);
      });
      return logs;
    },
    save: async (log) => {
      await store.setItem(log.id, log);
    },
    removeMany: async (ids) => {
      await Promise.all(ids.map((id) => store.removeItem(id)));
    },
    replace: async (logs) => {
      await store.clear();
      await Promise.all(
        logs.map(async (log) => {
          if (typeof log.id === 'string' && log.id) {
            await store.setItem(log.id, log);
          }
        }),
      );
    },
    collectResourceKeys: async () => collectResourceStorageKeys(await repository.list()),
  };

  registerResourceUsageCollector({
    id: resourceCollectorId,
    collect: repository.collectResourceKeys,
  });

  return repository;
}
