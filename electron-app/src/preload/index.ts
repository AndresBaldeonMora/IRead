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
})
