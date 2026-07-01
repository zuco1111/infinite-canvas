import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('infiniteCanvasPlatform', {
  runtime: 'electron',
  getAppVersion: () => ipcRenderer.invoke('platform:get-version') as Promise<string>,
  openExternal: (url: string) => ipcRenderer.invoke('platform:open-external', url) as Promise<void>,
  getLocalAgentStatus: () => ipcRenderer.invoke('platform:local-agent-status'),
  startLocalAgent: () => ipcRenderer.invoke('platform:local-agent-start'),
  stopLocalAgent: () => ipcRenderer.invoke('platform:local-agent-stop'),
});
