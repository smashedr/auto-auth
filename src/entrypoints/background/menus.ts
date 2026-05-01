import { i18n } from '#imports'

const config: chrome.contextMenus.CreateProperties[] = [
  { contexts: ['action', 'page'], id: 'openPopup' },
  { contexts: ['action', 'page'], id: 'openSidePanel' },
  { contexts: ['action', 'page'], id: 'openExtPanel' },
  { contexts: ['action', 'page'], id: 'separator' },
  { contexts: ['action', 'page'], id: 'openOptions' },
]

const contexts: chrome.contextMenus.CreateProperties[] = config.map((entry) => ({
  ...entry,
  ...(entry.id === 'separator'
    ? { type: 'separator', id: crypto.randomUUID() }
    : { title: i18n.t(`ctx.${entry.id}` as any) }),
}))

export async function updateContextMenus(enabled?: boolean) {
  console.debug('%cupdateContextMenus:', `color: ${enabled ? 'Lime' : 'Yellow'}`, enabled)
  if (!chrome.contextMenus) return console.debug('Skipping: chrome.contextMenus')

  chrome.contextMenus.removeAll().then(() => {
    contexts.forEach((item) => {
      const entry = { ...item }
      const contexts = [...(entry.contexts ?? [])]
      // console.log('contexts:', contexts)
      if (!enabled) {
        const idx = contexts?.indexOf('page')
        if (idx !== undefined && idx != -1) contexts?.splice(idx, 1)
      }
      entry.contexts = contexts as [chrome.contextMenus.ContextType]
      console.log(`entry: ${entry.id}`, entry.contexts)
      chrome.contextMenus.create(entry)
    })
  })
}
