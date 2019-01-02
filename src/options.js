import browser from 'webextension-polyfill'
import pEvent from 'p-event'
import _ from 'lodash'
import largeSync from './large-sync'

const MESSAGE_TIMEOUT = 5000

function download(filename, content) {
  const element = document.createElement('a')
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`)
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

const STORAGE_DEFAULTS = {
  savedList: [],
}

async function exportOptions() {
  const { savedList = [] } = await largeSync.get(STORAGE_DEFAULTS)
  download('safe-tabs-saver-data.json', JSON.stringify(savedList, null, 2))
}

async function importOptions(e) {
  // read the uploaded file
  const file = e.target.files[0]
  const reader = new window.FileReader()
  reader.readAsText(file)
  await pEvent(reader, 'load')
  const content = reader.result

  const importSuccess = document.querySelector('#import-success')
  const importFailure = document.querySelector('#import-failure')

  // make sure they're hidden
  importSuccess.classList.add('hidden')
  importFailure.classList.add('hidden')
  window.clearTimeout(this.hideTimeout)

  try {
    var savedList = JSON.parse(content)
  } catch (err) {
    importFailure.classList.remove('hidden')
    this.hideTimeout = setTimeout(() => {
      importFailure.classList.add('hidden')
    }, MESSAGE_TIMEOUT)

    // empty the input
    const importInput = document.querySelector('#import')
    importInput.value = null
    return
  }

  // upsert!
  const { savedList: savedListStored = [] } = await largeSync.get(STORAGE_DEFAULTS)
  const savedListMerged = _.unionBy(savedList, savedListStored, o => o.id)
  await largeSync.set({ savedList: savedListMerged })

  // reload the background page to it reads the updated data
  const background = await browser.extension.getBackgroundPage()
  background.location.reload()

  importSuccess.classList.remove('hidden')
  this.hideTimeout = setTimeout(() => {
    importSuccess.classList.add('hidden')
  }, MESSAGE_TIMEOUT)

  // empty the input
  const importInput = document.querySelector('#import')
  importInput.value = null
}

document.addEventListener('DOMContentLoaded', () => {
  const exportButton = document.querySelector('#export')
  const importInput = document.querySelector('#import')

  exportButton.addEventListener('click', exportOptions)
  importInput.addEventListener('change', importOptions)
})
