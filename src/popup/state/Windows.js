import { types as t } from 'mobx-state-tree'
import uuid from 'uuid/v4'

const Window = t
  .model('Window', {
    id: uuid(),
    tabs: t.array(t.string),
    name: '',
    emoji: '',
  })
  .views(self => ({}))
  .actions(self => ({
    setName(name) {
      self.name = name
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
    },
    unDelete(deletedWindow) {
      const index = self.trashBin.findIndex(w => w && w.id === deletedWindow.id)
      self.savedList.splice(index, 0, deletedWindow.toJSON())
      self.editingList.splice(index, 0, undefined)
      self.trashBin[index] = undefined
    },
    deletePermanently(deletedWindow) {
      self.trashBin.remove(deletedWindow)
    },
  }))

export default Windows
