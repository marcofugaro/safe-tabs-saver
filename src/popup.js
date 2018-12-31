import browser from 'webextension-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import { Provider as MobxProvider } from 'mobx-react'
import { applySnapshot, onSnapshot } from 'mobx-state-tree'
import WindowsList from './popup/WindowsList'
import PopupState from './state/PopupState'

async function init() {
  // wait for the document
  await browser.browserAction.getPopup({})

  // get the focused window id
  const { id: focusedWindowId } = await browser.windows.getLastFocused({})

  // initialize the state
  const state = PopupState.create()

  if (process.env.NODE_ENV === 'development') {
    window.state = state
  }

  // open a long-lived connection
  const port = browser.runtime.connect()

  // fill the state with the stored data the first time
  port.onMessage.addListener(({ savedList, windowsIdMap }) => {
    const placeholderArray = Array(savedList.length).fill()

    const id = _.findKey(windowsIdMap, windowId => windowId === focusedWindowId)

    applySnapshot(state, {
      savedList,
      editingList: placeholderArray,
      trashBin: placeholderArray,
      focusedWindowId: id,
    })

    // keep the background updated with the popup
    onSnapshot(state.savedList, newSavedList => {
      port.postMessage({ savedList: newSavedList })
    })
  })

  ReactDOM.render(
    <MobxProvider state={state}>
      <WindowsList />
    </MobxProvider>,
    document.getElementById('root'),
  )
}

init()
