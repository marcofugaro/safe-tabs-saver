import browser from 'webextension-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as MobxProvider } from 'mobx-react'
import { applySnapshot, onSnapshot } from 'mobx-state-tree'
import WindowsList from './popup/WindowsList'
import PopupState from './state/PopupState'

async function init() {
  // wait for the document
  await browser.browserAction.getPopup({})

  // initialize the state
  const state = PopupState.create()

  // open a long-lived connection
  const port = browser.runtime.connect()

  // fill the state with the stored data the first time
  port.onMessage.addListener(({ savedList }) => {
    const placeholderArray = Array(savedList.length).fill()
    applySnapshot(state, {
      savedList,
      editingList: placeholderArray,
      trashBin: placeholderArray,
      // currentWindowId,
    })
  })

  // keep the background updated with the popup
  onSnapshot(state.savedList, savedList => {
    port.postMessage({ savedList })
  })

  ReactDOM.render(
    <MobxProvider state={state}>
      <WindowsList />
    </MobxProvider>,
    document.getElementById('root'),
  )
}

init()
