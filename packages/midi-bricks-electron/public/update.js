/**
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates` callback from `updater` for the click property of `Check Updates...` MenuItem.
 */
const { dialog } = require('electron')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')

let updater
autoUpdater.autoDownload = false
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

autoUpdater.on('error', (error) => {
  dialog.showErrorBox(
    'Error: ',
    error == null ? 'unknown' : (error.stack || error).toString()
  )
})

autoUpdater.on('update-available', () => {
  dialog.showMessageBox(
    {
      type: 'info',
      title: 'Found Updates',
      message: 'Found updates, do you want update now?',
      buttons: ['Sure', 'No']
    },
    (buttonIndex) => {
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate()
      } else {
        updater.enabled = true
        updater = null
      }
    }
  )
})

autoUpdater.on('download-progress', (progressObj) => {
  const mBitPerSec = parseInt(progressObj.bytesPerSecond / (1024 * 1024), 10)
  const progressInPercent = parseInt(progressObj.percent, 10)
  let logMsg = 'Download speed: ' + mBitPerSec
  logMsg = logMsg + ' - Downloaded ' + progressInPercent + '%'
  logMsg =
    logMsg +
    ' (' +
    parseInt(progressObj.transferred, 10) +
    '/' +
    parseInt(progressObj.total, 10) +
    ')'

  log.info(logMsg)
  // sendStatusToWindow(logMsg)
})

// autoUpdater.on('update-not-available', () => {
//   dialog.showMessageBox({
//     title: 'No Updates',
//     message: 'Current version is up-to-date.'
//   })
//   updater.enabled = true
//   updater = null
// })

autoUpdater.on('update-downloaded', (tmp) => {
  log.info('downloaded version: ', tmp.version || 'no vers was given')
  dialog.showMessageBox(
    {
      title: 'Install Updates',
      message:
        'The App has to be closed to get installed to Version: ' +
          tmp.version || 'no vers was given'
    },
    () => {
      setImmediate(() => autoUpdater.quitAndInstall())
    }
  )
})

// export this to MenuItem click callback
function checkForUpdates(clickCallback, focusedWindow, event) {
  updater = clickCallback
  updater.enabled = false
  autoUpdater.checkForUpdates()
}
module.exports.checkForUpdates = checkForUpdates
