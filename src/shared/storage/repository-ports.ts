export type RepositoryResult<T> = Promise<T>;

export type ProjectRepository<TProject> = {
  list: () => RepositoryResult<TProject[]>;
  get: (projectId: string) => RepositoryResult<TProject | null>;
  save: (project: TProject) => RepositoryResult<void>;
  remove: (projectId: string) => RepositoryResult<void>;
};

export type AssetRepository<TAsset> = {
  list: () => RepositoryResult<TAsset[]>;
  get: (assetId: string) => RepositoryResult<TAsset | null>;
  save: (asset: TAsset) => RepositoryResult<void>;
  remove: (assetId: string) => RepositoryResult<void>;
};

export type BlobStore = {
  get: (blobId: string) => RepositoryResult<Blob | null>;
  put: (blobId: string, blob: Blob) => RepositoryResult<void>;
  remove: (blobId: string) => RepositoryResult<void>;
};

export type SettingsRepository<TSettings> = {
  read: () => RepositoryResult<TSettings>;
  write: (settings: TSettings) => RepositoryResult<void>;
};

export type SyncRepository<TDomainManifest> = {
  readDomainManifest: () => RepositoryResult<TDomainManifest>;
  writeDomainManifest: (manifest: TDomainManifest) => RepositoryResult<void>;
};
