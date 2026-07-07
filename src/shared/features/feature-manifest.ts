import type { ComponentType } from 'react';

import type { CommandContribution } from '@/shared/commands/command-contract';

export type RouteComponentModule = {
  default: ComponentType;
};

export type RouteComponentLoader = () => Promise<RouteComponentModule>;

export type RouteContribution = {
  path: string;
  title: string;
  loadComponent: RouteComponentLoader;
};

export type ToolbarContribution = {
  id: string;
  title: string;
  commandId: string;
};

export type NodeTypeContribution = {
  id: string;
  title: string;
};

export type StorageDomainContribution = {
  id: string;
  title: string;
};

export type BackgroundTaskContribution = {
  id: string;
  title: string;
};

export type SettingsContribution = {
  id: string;
  title: string;
};

export type FeatureManifest = {
  id: string;
  title: string;
  routes?: RouteContribution[];
  toolbarItems?: ToolbarContribution[];
  nodeTypes?: NodeTypeContribution[];
  commands?: CommandContribution[];
  storageDomains?: StorageDomainContribution[];
  settingsPanels?: SettingsContribution[];
  backgroundTasks?: BackgroundTaskContribution[];
  dependencies?: string[];
};
