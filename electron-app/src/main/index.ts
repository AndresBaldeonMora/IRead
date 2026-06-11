import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import { initDB, runQuery, runGet, runAll } from './db'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, '../../splash-icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    title: 'Mi Biblioteca',
  })

  if (isDev) {
    win.loadURL('http://localhost:5174')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  await initDB()

  ipcMain.handle('db:run', (_e, sql: string, params: unknown[]) => {
    return runQuery(sql, params)
  })

  ipcMain.handle('db:get', (_e, sql: string, params: unknown[]) => {
    return runGet(sql, params)
  })

  ipcMain.handle('db:all', (_e, sql: string, params: unknown[]) => {
    return runAll(sql, params)
  })

  ipcMain.handle('dialog:save-json', async (_e, data: string) => {
    const result = await dialog.showSaveDialog({
      title: 'Guardar respaldo',
      defaultPath: `respaldo-biblioteca-${new Date().toISOString().slice(0,10)}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (result.canceled || !result.filePath) return { ok: false }
    fs.writeFileSync(result.filePath, data, 'utf-8')
    return { ok: true }
  })

  ipcMain.handle('dialog:open-json', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Abrir respaldo',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (result.canceled || !result.filePaths[0]) return { ok: false, data: null }
    const data = fs.readFileSync(result.filePaths[0], 'utf-8')
    return { ok: true, data }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
