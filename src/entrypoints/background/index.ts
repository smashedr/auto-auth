import { getAppConfig } from '#imports'
import { isFirefox } from '@/utils/system.ts'
import { defaultOptions, getOptions } from '@/utils/options.ts'
import { openExtPanel, openPopup, openSidePanel } from '@/utils/extension.ts'
import { createContextMenus } from './menus.ts'
import { onAuthRequired, webRequestFinished } from '@/entrypoints/background/auth.ts'

export default defineBackground(() => {
  console.log(`Loaded: %c${chrome.runtime.id}`, 'Color: Cyan')

  chrome.runtime.onInstalled.addListener(onInstalled)
  chrome.runtime.onStartup.addListener(onStartup)
  chrome.storage.onChanged.addListener(onChanged)
  chrome.runtime.onMessage.addListener(onMessage)
  chrome.commands?.onCommand.addListener(onCommand)
  chrome.contextMenus?.onClicked.addListener(onClicked)

  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onAuthRequired
  chrome.webRequest.onAuthRequired.addListener(onAuthRequired, { urls: ['<all_urls>'] }, [
    'asyncBlocking',
  ])
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onCompleted
  chrome.webRequest.onCompleted.addListener(webRequestFinished, {
    urls: ['<all_urls>'],
  })
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onErrorOccurred
  chrome.webRequest.onErrorOccurred.addListener(webRequestFinished, {
    urls: ['<all_urls>'],
  })
})

// async function setUninstallURL() {
//   const manifest = chrome.runtime.getManifest()
//   if (!manifest.homepage_url) return console.warn('No manifest.homepage_url')
//   const url = new URL(manifest.homepage_url)
//   url.pathname = '/uninstall/'
//   url.searchParams.append('version', manifest.version)
//   await chrome.runtime.setUninstallURL(url.href)
// }

async function setDefaultOptions(defaultOptions: object) {
  console.log('setDefaultOptions', defaultOptions)
  const options = await getOptions()
  let changed = false
  for (const [key, value] of Object.entries(defaultOptions)) {
    // console.log(`${key}: default: ${value} current: ${options[key]}`)
    if (options[key] === undefined) {
      changed = true
      options[key] = value
      console.log(`Set %c${key}:`, 'color: Khaki', value)
    }
  }
  if (changed) {
    await chrome.storage.sync.set({ options })
    console.log('changed options:', options)
  }
  return options
}

async function onInstalled(details: chrome.runtime.InstalledDetails) {
  console.log('onInstalled:', details)

  const options = await setDefaultOptions(defaultOptions)
  console.debug('options:', options)

  if (options.contextMenu) createContextMenus()

  const config = getAppConfig()
  console.log('config:', config)

  await chrome.runtime.setUninstallURL(`${config.githubUrl}/issues`)

  const manifest = chrome.runtime.getManifest()
  console.debug('manifest:', manifest)

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // await chrome.runtime.openOptionsPage()
    // const hasPerms = await checkPerms(manifest)
    const hasPerms = await chrome.permissions.contains({
      origins: manifest.host_permissions,
    })
    console.debug('hasPerms:', hasPerms)
    if (hasPerms) {
      await chrome.runtime.openOptionsPage()
    } else {
      const url = chrome.runtime.getURL('permissions.html')
      await chrome.tabs.create({ active: true, url })
    }
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    if (options.showUpdate) {
      if (manifest.version !== details.previousVersion) {
        const url = `${manifest.homepage_url}/releases/tag/${manifest.version}`
        await chrome.tabs.create({ active: false, url })
      }
    }
  }
}

async function onStartup() {
  console.log('onStartup')
  if (isFirefox) {
    console.log('Firefox Startup Workarounds')
    // NOTE: Confirm these checks are still necessary...
    const options = await getOptions()
    console.debug('options:', options)
    if (options.contextMenu) createContextMenus()

    const manifest = chrome.runtime.getManifest()
    console.debug('manifest:', manifest)
    await chrome.runtime.setUninstallURL(`${manifest.homepage_url}/issues`)
  }
}

function onChanged(changes: object, namespace: string) {
  // console.debug('background/index.ts - onChanged:', changes, namespace)
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (namespace === 'sync' && key === 'options' && oldValue && newValue) {
      if (oldValue.contextMenu !== newValue.contextMenu) {
        if (newValue?.contextMenu) {
          console.log('%c Enabled contextMenu...', 'color: Lime')
          createContextMenus()
        } else {
          console.log('%c Disabled contextMenu...', 'color: OrangeRed')
          chrome.contextMenus?.removeAll().catch(console.warn)
        }
      }
    }
  }
}

function onMessage(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: Function,
) {
  const tabId = message.tabId || sender.tab?.id
  console.log(`onMessage: tabId: ${tabId} - message:`, message)

  // TODO: Refactor badgeColor
  if ('badgeColor' in message && tabId) {
    console.debug(`setBadgeBackgroundColor: ${message.badgeColor}`)
    chrome.action
      .setBadgeBackgroundColor({ tabId: tabId, color: message.badgeColor })
      .catch(console.warn)
  }
  // TODO: Refactor badgeText
  if ('badgeText' in message && tabId) {
    console.debug(`setBadgeText: ${message.badgeText}`)
    chrome.action
      .setBadgeText({ tabId: tabId, text: message.badgeText })
      .catch(console.warn)
  }

  if ('host' in message) {
    Hosts.get(message.host).then((creds) => sendResponse(creds))
    return true
  }
}

async function onCommand(command: string, tab?: chrome.tabs.Tab) {
  console.debug('onCommand:', command, tab)
  try {
    if (command === 'openOptions') {
      await chrome.runtime.openOptionsPage()
    } else if (command === 'openExtPanel') {
      await openExtPanel()
    } else if (command === 'openSidePanel') {
      openSidePanel()
    } else {
      console.warn(`Unknown Command: ${command}`)
    }
  } catch (e) {
    console.warn(e)
  }
}

async function onClicked(ctx: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
  console.debug('onClicked:', ctx, tab)
  try {
    if (ctx.menuItemId === 'openOptions') {
      await chrome.runtime.openOptionsPage()
    } else if (ctx.menuItemId === 'openPopup') {
      await openPopup()
    } else if (ctx.menuItemId === 'openExtPanel') {
      await openExtPanel()
    } else if (ctx.menuItemId === 'openSidePanel') {
      openSidePanel()
    } else {
      console.error(`Unknown ctx.menuItemId: ${ctx.menuItemId}`)
    }
  } catch (e) {
    console.warn(e)
  }
}
