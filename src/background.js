import browser from 'webextension-polyfill'
import { onSnapshot, applySnapshot } from 'mobx-state-tree'
import { reaction } from 'mobx'
import _ from 'lodash'
import BackgroundState from './state/BackgroundState'

// try to match the existing tabs to the stored ones
function computeWindowsIdMap(windows, savedList) {
  const windowsIdMap = windows.reduce((map, window) => {
    const tabs = window.tabs.map(tab => tab.url)

    const storedWindow = savedList.find(w => _.difference(w.tabs, tabs).length === 0)

    if (storedWindow) {
      map[storedWindow.id] = window.id
    }

    return map
  }, {})

  return windowsIdMap
}

async function init() {
  // const testSavedWindows = []
  // for (let i = 0; i < 1; i++) {
  //   testSavedWindows.push({
  //     id: Math.random().toString(),
  //     tabs: ['http://google.com', 'https://dn.ht/picklecat/'],
  //     name: 'Dog Vomit',
  //     emoji: '🗂',
  //   })
  // }
  // await browser.storage.sync.set({ savedList: testSavedWindows })

  const STORAGE_DEFAULTS = {
    savedList: [],
  }

  // retrieve the storage data and current windows
  const [{ savedList: savedListStored }, windows] = await Promise.all([
    browser.storage.sync.get(STORAGE_DEFAULTS),
    browser.windows.getAll({ populate: true }),
  ])

  // the map of the initial ids between the stored windows and
  // the open windows
  const storedWindowsMap = computeWindowsIdMap(windows, savedListStored)

  // initialize the state with the stored tabs
  const state = BackgroundState.create({
    savedList: savedListStored,
    windowsIdMap: storedWindowsMap,
  })

  if (process.env.NODE_ENV === 'development') {
    window.state = state
  }

  // keep the storage updated with the state
  onSnapshot(state.savedList, savedList => {
    browser.storage.sync.set({ savedList })
  })

  // and keep the state updated with the browser windows
  const syncWindowsDebounced = _.debounce(state.syncWindows, 50)
  browser.tabs.onUpdated.addListener(syncWindowsDebounced)
  browser.tabs.onRemoved.addListener(syncWindowsDebounced)
  browser.tabs.onAttached.addListener(syncWindowsDebounced)
  browser.tabs.onDetached.addListener(syncWindowsDebounced)
  browser.tabs.onMoved.addListener(syncWindowsDebounced)

  // add add the new tracked windows to the ids map
  browser.windows.onCreated.addListener(async ({ id }) => {
    const window = await browser.windows.get(id, { populate: true })
    const tabs = window.tabs.map(tab => tab.url)

    const savedWindow = state.savedList.find(w => _.difference(w.tabs, tabs).length === 0)

    if (!savedWindow) {
      return
    }

    state.addWindowsIdMapEntry(savedWindow.id, id)
  })

  // recompute the ids map when we start stracking / stop tracking
  reaction(
    () => state.savedList.length,
    async () => {
      const currentWindows = await browser.windows.getAll({ populate: true })
      const windowsIdMap = computeWindowsIdMap(currentWindows, state.savedList)
      state.setWindowsIdMap(windowsIdMap)
    },
  )

  // listen for popup connections
  browser.runtime.onConnect.addListener(port => {
    // send the saved state the first time
    port.postMessage({ savedList: state.savedList, windowsIdMap: state.windowsIdMap.toJSON() })

    // then listen from changes from the popup
    port.onMessage.addListener(({ savedList }) => {
      applySnapshot(state.savedList, savedList)
    })
  })
}

init()
