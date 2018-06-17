import browser from 'webextension-polyfill'
import { MDCTextField } from '@material/textfield'
import wdtEmojiBundleOriginal from 'wdt-emoji-bundle'
import { wdtEmojiBundleSetup } from './emoji-picker'


(async () => {
  await browser.browserAction.getPopup({})

  const wdtEmojiBundle = wdtEmojiBundleSetup(wdtEmojiBundleOriginal)

  const OPTIONS_DEFAULTS = {
    'emojiStyle': 'apple',
  }

  const { emojiStyle } = await browser.storage.sync.get(OPTIONS_DEFAULTS)
  wdtEmojiBundle.defaults.emojiType = emojiStyle

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

  wdtEmojiBundle.init('.emoji-picker')

  document.querySelector('.emoji-picker__chosen').innerHTML = wdtEmojiBundle.render(':file_folder:')

  // document.querySelectorAll('.mdc-list-item__emoji').forEach(emoji => {
  //   emoji.innerHTML = wdtEmojiBundle.render(emoji.innerHTML)
  // })

  wdtEmojiBundle.on('afterSelect', (event) => {
    const emojiPicker = event.el.parentNode
    const activeIconContainer = emojiPicker.querySelector('.emoji-picker__chosen')
    activeIconContainer.innerHTML = wdtEmojiBundle.render(event.emoji)
  })

})()
