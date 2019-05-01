const {
  BrowserWindow,
  app,
  Notification,
  ipcMain,
  dialog
} = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const windowStateKeeper = require('electron-window-state')
const log = require('electron-log')
const { checkForUpdates } = require('./update')
const util = require('util')
const readFile = util.promisify(fs.readFile)
require('electron').process

let win = null
let notification = null

// Prevent Zoom, disrupting touches
!isDev && app.commandLine.appendSwitch('disable-pinch')
!isDev && app.commandLine.appendSwitch('overscroll-history-navigation=0')

// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) createWindow()
})

let updateObject = {}
function updateCallback(thing) {
  updateObject = thing
  log.info('updateObject:', updateObject)
}

function createWindow() {
  log.info('App started... !')

  // Extract CLI parameter: Window Coordinates
  const windowIndex = process.argv.findIndex((item) => item === '--window') + 1
  const [xx, yy, w, h] = process.argv[windowIndex].split(',')

  // Extract CLI parameter: Enable Dev Console
  const isDevelopmentCli =
    isDev || !!process.argv.find((item) => item === '--dev')

  const isDissallowedToUpdateCli = !!process.argv.find(
    (item) => item === '--noUpdate'
  )
  const isAllowedToUpdate = isDissallowedToUpdateCli !== true ? true : false
  !isAllowedToUpdate && log.warn('Updates were disabled! ')
  isAllowedToUpdate && checkForUpdates((thing) => updateCallback(thing))

  // Load the previous state with fallback to defaults
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  })

  const { x, y, width, height } =
    {
      x: parseInt(xx, 10),
      y: parseInt(yy, 10),
      width: parseInt(w, 10),
      height: parseInt(h, 10)
    } || mainWindowState

  // Create the window using the state information
  win = new BrowserWindow({
    x,
    y,
    width,
    height,
    webPreferences: {
      nodeIntegration: true
    },
    title: 'MIDI Bricks',
    vibrancy: 'dark'
  })
  win.setMenu(null)

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win)

  // Check for develper console
  isDevelopmentCli && win.webContents.openDevTools()

  win.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      // eslint-disable-next-line standard/no-callback-literal
      callback(true)
    }
  )

  // Register IPC
  ipcMain.on('open-file-dialog', onOpenFileDialog)

  ipcMain.on('save-file-dialog', onSaveFileDialog)

  const url = isDev
    ? 'http://localhost:3000/'
    : `file://${path.join(__dirname, '../build/index.html')}`

  win.loadURL(url)
  isAllowedToUpdate && sendStatusToWindow('Software-Updates are enabled.')

  //  Emitted when the window is closed.
  win.on('closed', function() {
    sendStatusToWindow('Gracefully shutting down.')
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

function sendStatusToWindow(text) {
  log.info(text)
  if (!Notification.isSupported()) {
    log.warn('notifcations are not supported on this OS')
    return
  }
  notification = new Notification({
    // title: text,
    // subtitle: text,
    body: text || 'txt is not there',
    silent: true,
    sound: '',
    icon: './icons/icon_128@2x.png'
  })

  eventListen(notification)
  notification.show()
  //notification.close()
}

function eventListen(notification) {
  return notification.once('click', () => {
    log.info('Notification clicked')
    notification.close()
  })
}

function onSaveFileDialog(event, arg) {
  dialog.showSaveDialog(
    {
      properties: ['openFile'],
      defaultPath: app.getAppPath(),
      filters: [
        {
          name: 'javascript',
          extensions: ['js']
        },
        {
          name: 'json',
          extensions: ['json']
        }
      ]
    },
    (filename, bookmark) => {
      if (filename === undefined) {
        return
      }
      const json = JSON.stringify(arg)
      fs.writeFile(filename, json, 'utf8', (err, data) => {
        if (err) {
          throw new Error(err)
        }
      })
      event.sender.send('save-file-dialog-reply', {
        presetName: filename,
        content: arg
      })
    }
  )
}

function onOpenFileDialog(event, arg) {
  dialog.showOpenDialog(
    {
      properties: ['openFile'],
      filters: [
        {
          name: 'javascript',
          extensions: ['js']
        },
        {
          name: 'json',
          extensions: ['json']
        }
      ]
    },
    (filenames) => {
      Array.isArray(filenames) &&
        readFile(filenames[0], {}).then(
          (data) => {
            const stuff = {
              content: JSON.parse(data),
              presetName: filenames[0]
            }
            event.sender.send('open-file-dialog-reply', stuff)
            log.info(
              'Object loaded: ',
              stuff.content.viewSettings || 'nothing found'
            )
            return data
          },
          (err) => {
            new Error(err)
          }
        )
    }
  )
}
