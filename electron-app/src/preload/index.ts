import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  db: {
    run: (sql: string, params: unknown[] = []) =>
      ipcRenderer.invoke('db:run', sql, params),
    get: (sql: string, params: unknown[] = []) =>
      ipcRenderer.invoke('db:get', sql, params),
    all: (sql: string, params: unknown[] = []) =>
      ipcRenderer.invoke('db:all', sql, params),
  },
  dialog: {
    saveJson: (data: string): Promise<{ ok: boolean }> =>
      ipcRenderer.invoke('dialog:save-json', data),
    openJson: (): Promise<{ ok: boolean; data: string | null }> =>
      ipcRenderer.invoke('dialog:open-json'),
  },
})
