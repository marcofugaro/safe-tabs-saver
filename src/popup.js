import browser from 'webextension-polyfill'
import { MDCTextField } from '@material/textfield'
import wdtEmojiBundle from 'wdt-emoji-bundle'




(async () => {
  await browser.browserAction.getPopup({})

  wdtEmojiBundle.addPicker = function (element) {
    if (element.classList.contains('wdt-emoji-picker-ready')) {
      return
    }

    const div = element.querySelector('.wdt-emoji-picker')
    div.addEventListener('click', wdtEmojiBundle.openPicker)

    element.classList.add('wdt-emoji-picker-parent')

    if (element.classList.contains('wdt-emoji-open-on-colon')) {
      element.addEventListener('keyup', wdtEmojiBundle.onKeyup)
    }

    element.classList.add('wdt-emoji-picker-ready')
  }

  wdtEmojiBundle.openPicker = function(event) {
    if (wdtEmojiBundle.popup.classList.contains('open')) {
      wdtEmojiBundle.close()
      return
    }

    wdtEmojiBundle.input = event.currentTarget

    const inputRect = wdtEmojiBundle.input.getBoundingClientRect()

    const top = inputRect.top + inputRect.height
    const left = inputRect.left

    wdtEmojiBundle.popup.style.top = `${top + 8}px`
    wdtEmojiBundle.popup.style.left = `${left}px`

    wdtEmojiBundle.popup.classList.add('open')

    // fill with emoji
    wdtEmojiBundle.fillPickerPopup()

    wdtEmojiBundle.closePickers()
  }

  wdtEmojiBundle.defaults.emojiSheets.apple = './images/emoji_sheets/sheet_apple_64.png'
  wdtEmojiBundle.defaults.emojiSheets.google = './images/emoji_sheets/sheet_google_64.png'
  wdtEmojiBundle.defaults.emojiSheets.twitter = './images/emoji_sheets/sheet_twitter_64.png'
  wdtEmojiBundle.defaults.emojiSheets.emojione = './images/emoji_sheets/sheet_emojione_64.png'
  wdtEmojiBundle.defaults.emojiSheets.facebook = './images/emoji_sheets/sheet_facebook_64.png'
  wdtEmojiBundle.defaults.emojiSheets.messenger = './images/emoji_sheets/sheet_messenger_64.png'

  // wdtEmojiBundle.defaults.emojiType = 'twitter'

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

  wdtEmojiBundle.on('afterSelect', (event) => {
    const emojiPicker = event.el.parentNode
    const activeIconContainer = emojiPicker.querySelector('.emoji-picker__chosen')
    activeIconContainer.innerHTML = wdtEmojiBundle.render(event.emoji)
  })

})()
