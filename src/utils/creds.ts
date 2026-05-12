import { i18n } from '#imports'
import { debug } from '@/utils/logger.ts'
import { showToast } from '@/composables/useToast.ts'
import { Hosts } from '@/utils/hosts.ts'

// TODO: Logging

export async function importCredentials(data: any) /* NOSONAR */ {
  // NOTE: Copied from VanillaJS...
  debug('importCredentials:', data)
  const hosts: Record<string, string> = {}
  let count = 0
  let total
  if (data?.credentialsArray) {
    // Basic Authentication (nanfgbiblbcagfodkfeinbbhijihckml)
    console.log('Processing - %c Basic Authentication', 'color: Gold')
    total = data.credentialsArray.length
    for (const item of data.credentialsArray) {
      debug('item:', item)
      try {
        const key = getHost(item.url)
        hosts[key] = `${item.login}:${item.password}`
        count += 1
      } catch (e) {
        const message = e instanceof Error ? e.message : i18n.t('import.errorUnknown')
        console.log(`%c${message}:`, 'color: Red')
      }
    }
  } else {
    console.log('Processing - %c AutoAuth/Native', 'color: SpringGreen')
    total = Object.keys(data).length
    for (const [key, value] of Object.entries(data)) {
      debug(`key: "${key}":`, value)
      if (!key) {
        console.log(`No hostname for value: ${value}`)
        continue
      }
      try {
        if (typeof value === 'object') {
          // AutoAuth (steffanschlein)
          const { username, password } = value as any
          debug('username, password:', username, password)
          if (!username || !password) {
            console.log(`${key}: missing username or password`)
            continue
          }
          hosts[key] = `${username}:${password}`
        } else if (typeof value === 'string') {
          // Auto Auth (this extension)
          // const [username, password] = value.split(':', 1)
          const password = parseCreds(value)[1]
          if (value !== 'ignored' && !password) {
            console.log(`${key}: missing password`)
            continue
          }
          hosts[key] = value
        }
        count += 1
      } catch (e) {
        const message = e instanceof Error ? e.message : i18n.t('import.errorUnknown')
        console.log(`${key}: %c${message}`, 'color: Red')
      }
    }
  }
  debug('hosts:', hosts)
  await Hosts.update(hosts)
  const message = `${i18n.t('ui.action.importUpdate')} ${count}/${total} ${i18n.t('ui.text.hosts')}.`
  showToast(message, count ? 'success' : 'warning')
}

function getHost(hostname: string) {
  let host = hostname.toLowerCase().trim()
  host = host.includes('://') ? host : 'https://' + host
  // debug('host:', host)
  const url = new URL(host)
  // debug('url.host:', url.host)
  if (!url.host) throw new Error(`Invalid Hostname: ${hostname}`)
  return url.host
}

export function parseCreds(creds: string): [string, string] {
  // debug('parseCreds:', creds)
  const i = creds.indexOf(':')
  if (i === -1) return [creds, '']
  const username = creds.slice(0, i)
  const password = creds.slice(i + 1)
  // debug('username:', username)
  // debug('password:', password)
  return [username, password]
}
