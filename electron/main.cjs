const { app, BrowserWindow } = require('electron')
const path = require('path')
const { pathToFileURL } = require('url')

const isDev = !app.isPackaged && !!process.env.ELECTRON_START_URL

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

let wsServerStarted = false

async function startWsServer() {
  if (wsServerStarted) return
  wsServerStarted = true
  process.env.WS_PORT = process.env.WS_PORT || '8081'
  process.env.WS_HOST = process.env.WS_HOST || '127.0.0.1'
  const entry = path.join(__dirname, '..', 'server', 'ws-server.js')
  await import(pathToFileURL(entry).href)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    backgroundColor: '#0B0E14',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    const loadDevUrl = () => win.loadURL(process.env.ELECTRON_START_URL)
    win.webContents.once('did-fail-load', () => setTimeout(loadDevUrl, 500))
    loadDevUrl()
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist-electron', 'index.html'))
  }
}

app.whenReady().then(async () => {
  await startWsServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
