import { type Options, getOptions } from '@/utils/options.ts'

const getIcons = (name = '') => {
  // NOTE: Should be reusable for wxt.config.ts manifest generation...
  return {
    16: `/icons/${name}16.png`,
    24: `/icons/${name}24.png`,
    32: `/icons/${name}32.png`,
    48: `/icons/${name}48.png`,
    96: `/icons/${name}96.png`,
    128: `/icons/${name}128.png`,
  }
}

export async function updateIcon(options?: Options) {
  // TODO: Cleanup this logic and improve arguments...
  if (!options) options = await getOptions()
  console.debug('options.tempDisabled:', options.tempDisabled)
  const manifest = chrome.runtime.getManifest()
  // NOTE: origins defined: background/index.ts, components/PermsCheck.vue
  const hasPerms = await chrome.permissions.contains({
    origins: manifest.host_permissions,
  })
  console.debug('hasPerms:', hasPerms)
  let color = '' // green
  if (!hasPerms) {
    color = 'red'
  } else if (options.tempDisabled) {
    color = 'yellow'
  }
  console.debug('color:', color || 'green')
  await chrome.action.setIcon({ path: getIcons(color) })
}
