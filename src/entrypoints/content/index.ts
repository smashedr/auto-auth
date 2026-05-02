import { i18n } from '#imports'
import { defineContentScript } from 'wxt/utils/define-content-script'

let url: URL
let tabEnabled = false

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.debug('%cLoaded Content Script:', 'color: SpringGreen', chrome.runtime.id)

    url = new URL(window.location.href)

    if (!chrome.storage.sync.onChanged.hasListener(onChanged)) {
      // console.debug('Adding storage.onChanged Listener')
      chrome.storage.sync.onChanged.addListener(onChanged)
    }

    chrome.runtime.sendMessage({ host: url.host }).then(processCreds).catch(console.error)
  },
})

async function onChanged(changes: Record<string, any>) {
  // console.debug('content/index.ts - onChanged:', changes)
  const items = changes[url.host[0]] // NOTE: Lazy Typing... in changes
  if (!items) return
  const oldCreds = items.oldValue?.[url.host]
  const newCreds = items.newValue?.[url.host]
  if (oldCreds !== newCreds) await processCreds(newCreds)
}

async function processCreds(creds: any) {
  // console.debug('%c processCreds:', 'color: LightSkyBlue', creds)
  if (creds) {
    tabEnabled = true
    if (creds === 'ignored') {
      console.debug('%cIgnored - Site is Ignored!', 'color: Gold')
      await chrome.runtime.sendMessage({
        badgeText: i18n.t('content.badge.off'),
        badgeColor: 'yellow',
      })
    } else {
      console.debug('%cEnabled - Site Credentials Found.', 'color: MediumSpringGreen')
      await chrome.runtime.sendMessage({
        badgeText: i18n.t('content.badge.on'),
        badgeColor: 'green',
      })
    }
  } else if (tabEnabled) {
    console.debug('%cDisabled - Site Credentials Removed.', 'color: Tomato')
    tabEnabled = false
    await chrome.runtime.sendMessage({ badgeText: '' })
  }
}
