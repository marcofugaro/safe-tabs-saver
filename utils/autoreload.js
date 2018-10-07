import io from 'socket.io-client'

function reloadExtension() {
  // TODO replace this with chrome.runtime.reload() when
  // this bug will be fixed https://bugs.chromium.org/p/chromium/issues/detail?id=733209
  chrome.tabs.create({ url: 'chrome://extensions/', active: false }, (extensionTab) => {
    chrome.tabs.reload(extensionTab.id, () => {
      chrome.tabs.remove(extensionTab.id)
    })
  })
}

const socket = io(`http://localhost:${process.env.WEBSOCKET_PORT}`)
socket.on('file changed', reloadExtension)
