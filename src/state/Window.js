import browser from 'webextension-polyfill'
import { types as t, getSnapshot, getRoot } from 'mobx-state-tree'
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
    async open() {
      const { windowsIdMap } = getRoot(self)

      // attempt to focus if the window is already open
      if (windowsIdMap.has(self.id)) {
        const windowId = windowsIdMap.get(self.id)
        try {
          await browser.windows.update(windowId, { focused: true })

          // force the popup to close
          window.close()
          return
        } catch (e) {
          // e.message is 'No window with id: ...'
          // do nothing so it creates a new window
        }
      }

      browser.windows.create({ url: getSnapshot(self.tabs) })

      // force the popup to close
      window.close()
    },
  }))

export default Window
