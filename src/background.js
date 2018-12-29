import browser from 'webextension-polyfill'
import { onSnapshot, applySnapshot } from 'mobx-state-tree'
import { reaction } from 'mobx'
import _ from 'lodash'
import BackgroundState, { computeWindowsIdMap } from './state/BackgroundState'

async function init() {
  // const testSavedWindows = []
  // for (let i = 0; i < 2; i++) {
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
  const syncWindowsDebounced = _.debounce(state.syncWindows, 100)
  browser.tabs.onUpdated.addListener(syncWindowsDebounced)
  browser.tabs.onRemoved.addListener(syncWindowsDebounced)
  browser.tabs.onAttached.addListener(syncWindowsDebounced)
  browser.tabs.onDetached.addListener(syncWindowsDebounced)
  browser.tabs.onMoved.addListener(syncWindowsDebounced)

  browser.windows.onCreated.addListener(state.recomputeWindowsIdMap)
  browser.windows.onRemoved.addListener(state.recomputeWindowsIdMap)
  reaction(() => state.savedList.length, state.recomputeWindowsIdMap)

  // listen for popup connections
  browser.runtime.onConnect.addListener(port => {
    // send the saved state the first time
    port.postMessage({ savedList: state.savedList })

    // then listen from changes from the popup
    port.onMessage.addListener(({ savedList }) => {
      applySnapshot(state, {
        savedList,
      })
    })
  })
}

init()
