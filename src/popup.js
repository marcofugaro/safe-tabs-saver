import browser from 'webextension-polyfill'
import { MDCTextField } from '@material/textfield'
import wdtEmojiBundleOriginal from 'wdt-emoji-bundle'
import { html, render } from 'lit-html'
import { wdtEmojiBundleSetup } from './emoji-picker'


(async () => {
  // wait for the document
  await browser.browserAction.getPopup({})

  const currentWindowId = 'asdasda'

  function savedWindowTemplate(savedWindow) {
    return html`
      <div class="mdc-list-item ${savedWindow.id === currentWindowId ? 'mdc-list-item--selected' : ''}">
        <div class="mdc-list-item__clickable-area">
          <span class="mdc-list-item__emoji" aria-hidden="true">${savedWindow.emoji}</span>
          ${savedWindow.name}
        </div>
        <i class="mdc-list-item__meta material-icons hover-blue" data-no-trigger-active-parent="true" aria-hidden="true">edit</i>
      </div>
    `
  }


  function deletedWindowTemplate(savedWindow) {
    return html`
      <div class="mdc-snackbar mdc-snackbar--active">
        <div class="mdc-snackbar__text">Successfully deleted ${savedWindow.name}.</div>
        <div class="mdc-snackbar__action-wrapper">
          <button type="button" class="mdc-snackbar__action-button">Undo</button>
        </div>
      </div>
    `
  }

  function editingWindowTemplate(savedWindow) {
    return html`
      <form class="mdc-list-item">
        <div class="mdc-list-item__emoji emoji-picker" data-no-trigger-active-parent="true" aria-hidden="true">
          <span class="emoji-picker__chosen">${savedWindow.emoji}</span>
          <div class="wdt-emoji-picker">
            <i class="material-icons hover-blue" aria-hidden="true">edit</i>
          </div>
        </div>

        <div class="mdc-text-field">
          <input type="text" class="mdc-text-field__input" required="required" spellcheck="false" value="${savedWindow.name}">
          <div class="mdc-line-ripple"></div>
        </div>

        <button type="submit" class="button-reset mdc-list-item__meta material-icons hover-blue" aria-hidden="true"
          data-no-trigger-active-parent="true">check</button>
        <i class="mdc-list-item__meta material-icons hover-red" data-no-trigger-active-parent="true" aria-hidden="true">delete</i>
      </form>
    `
  }

  const wdtEmojiBundle = wdtEmojiBundleSetup(wdtEmojiBundleOriginal)

  const testSavedWindows = [{
    id: 'dasdasdasda',
    tabs: ['http://google.com', 'https://dn.ht/picklecat/'],
    name: 'Dog Shit',
    emoji: ':eggplant:'
  }]

  await browser.storage.sync.set({ savedWindows: testSavedWindows })

  const OPTIONS_DEFAULTS = {
    emojiStyle: 'apple',
    savedWindows: [],
  }

  const { emojiStyle, savedWindows } = await browser.storage.sync.get(OPTIONS_DEFAULTS)
  wdtEmojiBundle.defaults.emojiType = emojiStyle

  wdtEmojiBundle.init('.emoji-picker')

  // document.querySelector('.emoji-picker__chosen').innerHTML = wdtEmojiBundle.render(':file_folder:')

  wdtEmojiBundle.on('afterSelect', (event) => {
    const emojiPicker = event.el.parentNode
    const activeIconContainer = emojiPicker.querySelector('.emoji-picker__chosen')
    activeIconContainer.innerHTML = wdtEmojiBundle.render(event.emoji)
  })



  render(savedWindowTemplate(savedWindows[0]), document.querySelector('#saved-windows-container'))

  document.querySelectorAll('.mdc-list-item__emoji').forEach(emoji => {
    emoji.innerHTML = wdtEmojiBundle.render(emoji.innerHTML)
  })


  // inizialize the material design text field ripple effect
  document.querySelectorAll('.mdc-text-field').forEach(textInput => new MDCTextField(textInput))

  // disable the hover/active state of the row when interacting with the clickable icon
  document.querySelectorAll('[data-no-trigger-active-parent="true"]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.parentNode.classList.add('mdc-list-item--non-interactive')
    })
    el.addEventListener('mouseleave', () => {
      el.parentNode.classList.remove('mdc-list-item--non-interactive')
    })
  })

})()
