import browser from 'webextension-polyfill'
import { types as t } from 'mobx-state-tree'
import Window from './Window'

const BackgroundState = t
  .model('BackgroundState', {
    savedList: t.array(Window),
    windowsIdMap: t.map(t.number),
  })
  .views(self => ({}))
  .actions(self => ({
    // sync browser tabs --> stored tabs
    async syncWindows() {
      const timestamp = Date.now()
      self.lastTimestamp = timestamp

      const windows = await browser.windows.getAll({ populate: true })

      // make sure it's the last function call
      if (timestamp !== self.lastTimestamp) {
        return
      }

      self.windowsIdMap.forEach((windowId, storedWindowId) => {
        const window = windows.find(w => w.id === windowId)

        // return if somehow the window has been closed
        if (!window || window.tabs.length === 0) {
          return
        }

        const tabs = window.tabs.map(tab => tab.url)

        const savedWindow = self.savedList.find(w => w.id === storedWindowId)
        savedWindow.setTabs(tabs)
      })
    },
    setWindowsIdMap(windowsIdMap) {
      self.windowsIdMap = windowsIdMap
    },
    addWindowsIdMapEntry(savedWindowId, windowId) {
      self.windowsIdMap.set(savedWindowId, windowId)
    },
  }))

export default BackgroundState
