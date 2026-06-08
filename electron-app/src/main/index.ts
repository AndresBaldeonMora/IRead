import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { initDB, runQuery, runGet, runAll } from './db'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
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

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
