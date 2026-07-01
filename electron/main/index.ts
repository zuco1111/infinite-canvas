import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { readLocalAgentStatus, startLocalAgent, stopLocalAgent } from './local-agent-manager';

const appRoot = path.resolve(__dirname, '..', '..');
const preloadPath = path.join(appRoot, 'dist-electron', 'preload', 'index.cjs');
const rendererDistPath = path.join(appRoot, 'dist', 'index.html');
const localAgentEntryPath = path.join(appRoot, 'dist-electron', 'agent', 'index.mjs');
const devServerUrl = process.env.VITE_DEV_SERVER_URL;

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: 'Infinite Canvas',
    backgroundColor: '#101418',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    await mainWindow.loadFile(rendererDistPath);
  }
}

ipcMain.handle('platform:get-version', () => app.getVersion());
ipcMain.handle('platform:open-external', async (_event, url: string) => {
  await shell.openExternal(url);
});
ipcMain.handle('platform:local-agent-status', () => readLocalAgentStatus());
ipcMain.handle('platform:local-agent-start', () => startLocalAgent(localAgentEntryPath));
ipcMain.handle('platform:local-agent-stop', () => stopLocalAgent());

app.whenReady().then(() => {
  void createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
