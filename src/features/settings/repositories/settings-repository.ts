import { localForageStorage } from '@/shared/storage/localforage-storage';

const SETTINGS_KEY = 'infinite-canvas:settings';

export type PersistedSettings = {
  version: 1;
  config?: unknown;
  webdav?: unknown;
  theme?: unknown;
};

export type SettingsRepository = {
  read: () => Promise<PersistedSettings>;
  write: (settings: PersistedSettings) => Promise<void>;
  update: (patch: Partial<Omit<PersistedSettings, 'version'>>) => Promise<void>;
};

let updateQueue = Promise.resolve();

export const settingsRepository: SettingsRepository = {
  read: async () => {
    const value = await localForageStorage.getItem(SETTINGS_KEY);
    if (!value) return { version: 1 };
    const settings = JSON.parse(value) as Partial<PersistedSettings>;
    return { version: 1, ...settings };
  },
  write: async (settings) => {
    await localForageStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, version: 1 }));
  },
  update: async (patch) => {
    updateQueue = updateQueue.then(async () => {
      const settings = await settingsRepository.read();
      await settingsRepository.write({ ...settings, ...patch, version: 1 });
    });
    await updateQueue;
  },
};
