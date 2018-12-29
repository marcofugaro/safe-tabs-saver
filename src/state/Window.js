import { types as t } from 'mobx-state-tree'
import emojiRegex from 'emoji-regex/text.js'

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
    setTabs(tabs) {
      self.tabs = tabs
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

export default Window
