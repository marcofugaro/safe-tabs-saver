export function wdtEmojiBundleSetup(wdtEmojiBundle) {
  // rewrite the addPicker function to adapt it to the design
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

  // rewrite the openPicker function to better position the picker
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

  // add the attribute title to each emoji
  wdtEmojiBundle.oldFillPickerPopup = wdtEmojiBundle.fillPickerPopup
  wdtEmojiBundle.fillPickerPopup = function() {
    wdtEmojiBundle.oldFillPickerPopup()
    wdtEmojiBundle.popup.querySelectorAll('a.wdt-emoji').forEach(emoji => {
      const shortcode = emoji.getAttribute('data-wdt-emoji-shortnames')
      emoji.setAttribute('title', shortcode)
    })
  }

  wdtEmojiBundle.defaults.emojiSheets.apple = './images/emoji_sheets/sheet_apple_64.png'
  wdtEmojiBundle.defaults.emojiSheets.google = './images/emoji_sheets/sheet_google_64.png'
  wdtEmojiBundle.defaults.emojiSheets.twitter = './images/emoji_sheets/sheet_twitter_64.png'
  wdtEmojiBundle.defaults.emojiSheets.emojione = './images/emoji_sheets/sheet_emojione_64.png'
  wdtEmojiBundle.defaults.emojiSheets.facebook = './images/emoji_sheets/sheet_facebook_64.png'
  wdtEmojiBundle.defaults.emojiSheets.messenger = './images/emoji_sheets/sheet_messenger_64.png'

  return wdtEmojiBundle
}
