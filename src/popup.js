import browser from 'webextension-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as MobxProvider } from 'mobx-react'
import { onSnapshot } from 'mobx-state-tree'
import { MDCTextField } from '@material/textfield'
import State from './popup/State'
import WindowsList from './popup/WindowsList'
;(async () => {
  // wait for the document
  await browser.browserAction.getPopup({})

  const testSavedWindows = [
    {
      id: 'dasdasdasda',
      tabs: ['http://google.com', 'https://dn.ht/picklecat/'],
      name: 'Dog Shit',
      emoji: '🗂',
    },
    {
      id: 'dadgsd',
      tabs: ['http://google.com', 'https://dn.ht/picklecat/'],
      name: 'Dog Ass',
      emoji: '🗂',
    },
    {
      id: 'dhvsgls',
      tabs: ['http://google.com', 'https://dn.ht/picklecat/'],
      name: 'Dog Piss',
      emoji: '🗂',
    },
    {
      id: 'ldadnm',
      tabs: ['http://google.com', 'https://dn.ht/picklecat/'],
      name: 'Dog Vomit',
      emoji: '🗂',
    },
  ]

  for (let i = 0; i < 2; i++) {
    testSavedWindows.push({
      id: Math.random().toString(),
      tabs: ['http://google.com', 'https://dn.ht/picklecat/'],
      name: 'Dog Vomit',
      emoji: '🗂',
    })
  }

  await browser.storage.sync.set({ savedList: testSavedWindows })

  const OPTIONS_DEFAULTS = {
    savedList: [],
  }

  // fill the state with the storage data
  const { savedList } = await browser.storage.sync.get({ savedList: [] })

  const placeholderArray = Array(savedList.length).fill()
  const state = State.create({
    windows: {
      savedList,
      editingList: placeholderArray,
      trashBin: placeholderArray,
    },
  })

  // keep the storage updated with the state
  onSnapshot(state.windows.savedList, savedList => {
    browser.storage.sync.set({ savedList })
  })

  ReactDOM.render(
    <MobxProvider state={state}>
      <WindowsList />
    </MobxProvider>,
    document.getElementById('root'),
  )
})()
