import { i18n } from '#imports'
import { defineContentScript } from 'wxt/utils/define-content-script'

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

    chrome.runtime.sendMessage({ host: url.host }).then(processCreds).catch(console.error)
  },
})

async function onChanged(changes: Record<string, any>) {
  console.debug('content/index.ts - onChanged:', changes)
  const items = changes[url.host[0]] // NOTE: Lazy Typing... in changes
  const oldCreds = items?.oldValue?.[url.host]
  const newCreds = items?.newValue?.[url.host]
  if (oldCreds !== newCreds) {
    await processCreds(newCreds)
  }
}

async function processCreds(creds: any) {
  console.debug('%c processCreds:', 'color: SpringGreen', creds)
  if (creds) {
    tabEnabled = true
    if (creds === 'ignored') {
      console.debug('%cSite is currently ignored.', 'color: Yellow')
      await chrome.runtime.sendMessage({
        badgeText: i18n.t('content.badge.off'),
        badgeColor: 'yellow',
      })
    } else {
      console.debug('%cFound credentials for site.', 'color: LimeGreen')
      await chrome.runtime.sendMessage({
        badgeText: i18n.t('content.badge.on'),
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
