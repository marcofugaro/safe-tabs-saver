import { types as t, flow } from 'mobx-state-tree'
import uuid from 'uuid/v4'
import browser from 'webextension-polyfill'
import emojiRegex from 'emoji-regex/text.js'
import superb from 'superb'

const isOnlyEmoji = string => string.replace(emojiRegex(), '') === ''
const countEmojis = string => (string.match(emojiRegex()) || []).length

const Window = t
  .model('Window', {
    id: t.identifier,
    tabs: t.array(t.string),
    name: t.string,
    emoji: t.string,
  })
  .views(self => ({}))
  .actions(self => ({
    setName(name) {
      self.name = name
    },
    setEmoji(emoji) {
      if (!isOnlyEmoji(emoji)) {
        return
      }

      if (countEmojis(emoji) > 1) {
        return
      }

      self.emoji = emoji
    },
  }))

const Windows = t
  .model('Windows', {
    // this is kept in sync with the state
    savedList: t.array(Window),
    // this contains the windows currently being edited,
    // at the original index
    editingList: t.array(t.maybe(Window)),
    // this contains the windows that will be deleted in a few seconds,
    // at the original index
    trashBin: t.array(t.maybe(Window)),
    // the one we're in
    currentWindowId: t.maybe(t.string),
  })
  .views(self => ({}))
  .actions(self => ({
    edit(savedWindow) {
      const index = self.savedList.findIndex(w => w.id === savedWindow.id)
      self.editingList[index] = savedWindow.toJSON()
    },
    applyEdit(editedWindow) {
      const index = self.editingList.findIndex(w => w && w.id === editedWindow.id)
      self.savedList[index] = editedWindow.toJSON()
      self.editingList[index] = undefined
    },
    delete(editedWindow) {
      const index = self.editingList.findIndex(w => w && w.id === editedWindow.id)
      self.trashBin[index] = editedWindow.toJSON()
      self.savedList.remove(self.savedList[index])
      self.editingList.remove(self.editingList[index])

      self.currentWindowId = undefined
    },
    unDelete(deletedWindow) {
      const index = self.trashBin.findIndex(w => w && w.id === deletedWindow.id)
      self.savedList.splice(index, 0, deletedWindow.toJSON())
      self.editingList.splice(index, 0, undefined)
      self.trashBin[index] = undefined

      self.currentWindowId = deletedWindow.id
    },
    deletePermanently(deletedWindow) {
      self.trashBin.remove(deletedWindow)
    },
    addCurrent: flow(function*() {
      const tabs = yield browser.tabs.query({ currentWindow: true })

      const currentWindow = {
        id: uuid(),
        tabs: tabs.map(tab => tab.url),
        name: `My ${superb.random()} tabs`,
        emoji: '🗂',
      }

      self.currentWindowId = currentWindow.id
      self.savedList.unshift(currentWindow)
      self.editingList.unshift(currentWindow)
    }),
  }))

export default Windows
