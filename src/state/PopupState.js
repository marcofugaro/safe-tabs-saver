import browser from 'webextension-polyfill'
import { types as t, flow } from 'mobx-state-tree'
import uuid from 'uuid/v4'
import superb from 'superb'
import Window from './Window'

const PopupState = t
  .model('PopupState', {
    // this is kept in sync with the state
    savedList: t.array(Window),
    // this contains the windows currently being edited,
    // at the original index
    editingList: t.array(t.maybe(Window)),
    // this contains the windows that will be deleted in a few seconds,
    // at the original index
    trashBin: t.array(t.maybe(Window)),
    // the one we're in
    focusedWindowId: t.maybe(t.string),
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

      let currentIndex = 0
      const trashBinIndex = self.trashBin
        .map(o => {
          if (o === undefined) {
            return self.editingList[currentIndex++]
          }

          return o
        })
        .findIndex(w => w && w.id === editedWindow.id)

      self.trashBin[trashBinIndex] = editedWindow.toJSON()
      self.savedList.remove(self.savedList[index])
      self.editingList.remove(self.editingList[index])

      // save the focused window id if we delete it,
      // to restore it if we undelete it
      const id = self.trashBin[trashBinIndex].id
      if (self.focusedWindowId === id) {
        self.focusedWindowId = undefined
        self.lastFocusedWindowId = id
      }
    },
    unDelete(deletedWindow) {
      const trashBinIndex = self.trashBin.findIndex(w => w && w.id === deletedWindow.id)
      const deletedIndex = self.trashBin.slice(0, trashBinIndex).filter(Boolean).length

      const index = trashBinIndex - deletedIndex

      self.savedList.splice(index, 0, deletedWindow.toJSON())
      self.editingList.splice(index, 0, undefined)
      self.trashBin[trashBinIndex] = undefined

      // restore the focused window id
      const id = self.savedList[index].id
      if (self.lastFocusedWindowId === id) {
        self.focusedWindowId = id
        self.lastFocusedWindowId = undefined
      }
    },
    deletePermanently(deletedWindow) {
      self.trashBin.remove(deletedWindow)
    },
    emptyTrashBinFocused() {
      if (!self.lastFocusedWindowId) {
        return
      }

      const focusedTrashed = self.trashBin.find(w => w?.id === self.lastFocusedWindowId)

      if (focusedTrashed) {
        self.trashBin.remove(focusedTrashed)
      }
    },
    addCurrent: flow(function*() {
      const tabs = yield browser.tabs.query({ currentWindow: true })

      const currentWindow = {
        id: uuid(),
        tabs: tabs.map(tab => tab.url),
        name: `My ${superb.random()} tabs`,
        emoji: '🗂',
      }

      // make sure to delete the last focused tab
      self.emptyTrashBinFocused()

      self.focusedWindowId = currentWindow.id
      self.savedList.unshift(currentWindow)
      self.editingList.unshift(currentWindow)
      self.trashBin.unshift(undefined)
    }),
  }))

export default PopupState
