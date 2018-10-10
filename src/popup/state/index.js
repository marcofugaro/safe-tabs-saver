import { types as t } from 'mobx-state-tree'
import Windows from './Windows'

const State = t
  .model('State', {
    windows: t.optional(Windows, {}),
  })
  .views(self => ({}))
  .actions(self => ({
    resetSubState(subState) {
      const subStateName = subState.$treenode.subpath
      self[subStateName] = {}
    },
  }))

export default State
