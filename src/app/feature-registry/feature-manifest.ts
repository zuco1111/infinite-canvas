import type { CommandContribution } from '../../shared/commands/command-contract';

export type RouteContribution = {
  path: string;
  title: string;
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
  dependencies?: string[];
};
