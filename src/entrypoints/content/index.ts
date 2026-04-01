let url: URL
let tabEnabled = false

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log(`%c ${chrome.runtime.id}: content/index.ts`, 'color: Lime')

    url = new URL(window.location.href)

    if (!chrome.storage.onChanged.hasListener(onChanged)) {
      console.debug('Adding storage.onChanged Listener')
      chrome.storage.onChanged.addListener(onChanged)
    }

    run().catch(console.warn)
  },
})

async function run() {
  const creds = await chrome.runtime.sendMessage({ host: url.host })
  console.debug('run: creds:', creds)
  if (creds) {
    tabEnabled = true
    if (creds === 'ignored') {
      console.debug('%cSite is currently ignored.', 'color: Yellow')
      await chrome.runtime.sendMessage({
        badgeText: 'Off',
        badgeColor: 'yellow',
      })
    } else {
      console.debug('%cFound credentials for site.', 'color: LimeGreen')
      await chrome.runtime.sendMessage({
        badgeText: 'On',
        badgeColor: 'green',
      })
    }
  }
}

async function onChanged(changes: object, namespace: string) {
  console.debug('onChanged:', changes, namespace)
  for (let [key, { newValue }] of Object.entries(changes)) {
    console.debug(`key: ${key} - newValue:`, newValue)
    console.debug('url:', url)
    // if (!url) continue
    console.debug('url.host[0]', url.host[0])
    // if (!url.host[0]) continue
    if (namespace === 'sync' && key.startsWith(url.host[0])) {
      const hosts = newValue[url.host[0]] || {}
      if (tabEnabled && !(url.host in hosts)) {
        await chrome.runtime.sendMessage({
          badgeText: '',
        })
      }
    }
  }
}
