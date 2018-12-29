import browser from 'webextension-polyfill'
import { types as t } from 'mobx-state-tree'
import _ from 'lodash'
import Window from './Window'

// try to match the existing tabs to the stored ones
export function computeWindowsIdMap(windows, savedList) {
  const windowsIdMap = windows.reduce((map, window) => {
    const windowTabs = window.tabs.map(tab => tab.url)

    const storedWindow = savedList.find(w => _.difference(w.tabs, windowTabs).length === 0)

    if (storedWindow) {
      map[storedWindow.id] = window.id
    }

    return map
  }, {})

  return windowsIdMap
}

const BackgroundState = t
  .model('BackgroundState', {
    savedList: t.array(Window),
    windowsIdMap: t.map(t.number),
  })
  .views(self => ({}))
  .actions(self => ({
    async syncWindows() {
      const timestamp = Date.now()
      self.lastTimestamp = timestamp

      const windows = await browser.windows.getAll({ populate: true })

      // make sure it's the last function call
      if (timestamp !== self.lastTimestamp) {
        return
      }

      self.windowsIdMap.forEach((storedWindowId, windowId) => {
        const window = windows.find(w => w.di === windowId)
        const tabs = window.tabs.map(tab => tab.url)

        const savedWindow = self.savedList.find(w => w.id === storedWindowId)
        savedWindow.setTabs(tabs)
      })
    },
    async recomputeWindowsIdMap() {
      const windows = await browser.windows.getAll({ populate: true })
      const windowsIdMap = computeWindowsIdMap(windows, self.savedList)
      self.setWindowsIdMap(windowsIdMap)

      // resync the windows for good measure
      self.syncWindows()
    },
    setWindowsIdMap(windowsIdMap) {
      self.windowsIdMap = windowsIdMap
    },
  }))

export default BackgroundState
