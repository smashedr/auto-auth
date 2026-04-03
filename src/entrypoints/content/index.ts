import { i18n } from '#imports'

let url: URL
let tabEnabled = false

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log(`%c ${chrome.runtime.id}: content/index.ts`, 'color: Lime')

    url = new URL(window.location.href)

    if (!chrome.storage.sync.onChanged.hasListener(onChanged)) {
      console.debug('Adding storage.onChanged Listener')
      chrome.storage.sync.onChanged.addListener(onChanged)
    }

    chrome.runtime
      .sendMessage({ host: url.host })
      .then(async (creds) => {
        await processCreds(creds)
      })
      .catch((e) => {
        if (e instanceof Error) console.error(e.message)
      })
  },
})

async function processCreds(creds: any) {
  console.debug('%c processCreds:', 'color: SpringGreen', creds)
  if (creds) {
    tabEnabled = true
    if (creds === 'ignored') {
      console.debug('%cSite is currently ignored.', 'color: Yellow')
      await chrome.runtime.sendMessage({
        badgeText: i18n.t('content.off'),
        badgeColor: 'yellow',
      })
    } else {
      console.debug('%cFound credentials for site.', 'color: LimeGreen')
      await chrome.runtime.sendMessage({
        badgeText: i18n.t('content.on'),
        badgeColor: 'green',
      })
    }
  } else if (tabEnabled) {
    console.debug('%cSite has been removed.', 'color: OrangeRed')
    tabEnabled = false
    await chrome.runtime.sendMessage({
      badgeText: '',
    })
  }
}

async function onChanged(changes: Record<string, chrome.storage.StorageChange>) {
  // console.debug('content/index.ts - onChanged:', changes)
  const records = changes as Record<string, any> // NOTE: Lazy Typing...
  // console.debug('records:', records)
  const items = records[url.host[0]]
  // console.debug('items:', items)
  if (!items?.oldValue || !items?.newValue) return

  const oldCreds = items.oldValue[url.host]
  console.debug('oldCreds:', oldCreds)
  const newCreds = items.newValue[url.host]
  console.debug('newCreds:', newCreds)

  if (oldCreds !== newCreds) {
    await processCreds(newCreds)
  }
}
