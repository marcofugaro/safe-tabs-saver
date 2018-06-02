# safe-tabs-saver [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![devDependency Status][daviddm-dev-image]][daviddm-dev-url]

> Save all your current tabs for a later use, safely in your google account

#### [Install it from the Chrome Web Store]()

## Commands

- `npm start` to compile and watch the files for changes.
  After you ran `npm start` go in `chrome://extensions/`, enable `Developer mode` if you already haven't, click `Load unpacked extension...` and select the `build/` folder.
  Every time you change a file in the `src/` folder the extension is reloaded automatically.
- `npm run build` to just compile the files.
- `npm run bundle` to compile the files and put them in a `.zip`, ready to be uploaded to the Chrome Web Store.

## License

MIT © [Marco Fugaro](https://github.com/marcofugaro)


[travis-image]: https://travis-ci.org/marcofugaro/safe-tabs-saver.svg?branch=master
[travis-url]: https://travis-ci.org/marcofugaro/safe-tabs-saver
[daviddm-image]: https://david-dm.org/marcofugaro/safe-tabs-saver.svg
[daviddm-url]: https://david-dm.org/marcofugaro/safe-tabs-saver
[daviddm-dev-image]: https://david-dm.org/marcofugaro/safe-tabs-saver/dev-status.svg
[daviddm-dev-url]: https://david-dm.org/marcofugaro/safe-tabs-saver/?type=dev

