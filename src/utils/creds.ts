import { i18n } from '#imports'
import { showToast } from '@/composables/useToast.ts'
import { Hosts } from '@/utils/hosts.ts'

// TODO: Cleanup this function...
export async function importCredentials(data: any) /* NOSONAR */ {
  // NOTE: Copied from VanillaJS...
  console.debug('importCredentials:', data)
  const hosts: Record<string, string> = {}
  let count = 0
  let total
  if (data?.credentialsArray) {
    // Basic Authentication (nanfgbiblbcagfodkfeinbbhijihckml)
    console.debug('Processing - %c Basic Authentication', 'color: SpringGreen')
    total = data.credentialsArray.length
    for (const item of data.credentialsArray) {
      try {
        // console.debug('item:', item)
        const key = getHost(item.url)
        hosts[key] = `${item.login}:${item.password}`
        count += 1
      } catch (e) {
        console.log(`Error processing item:`, 'color: Red', item, e)
      }
    }
  } else {
    console.debug('Processing - %c AutoAuth/Native', 'color: SpringGreen')
    total = Object.keys(data).length
    for (const [key, value] of Object.entries(data)) {
      // console.debug(`key: "${key}":`, value)
      if (!key) {
        console.debug(`No hostname for value: ${value}`)
        continue
      }
      try {
        if (typeof value === 'object') {
          // AutoAuth (steffanschlein)
          const { username, password } = value as any
          console.debug('username, password:', username, password)
          if (!username || !password) {
            console.debug(`${key}: missing username or password`)
            continue
          }
          hosts[key] = `${username}:${password}`
        } else if (typeof value === 'string') {
          // Auto Auth (this extension)
          // const [username, password] = value.split(':', 1)
          const password = parseCreds(value)[1]
          if (value !== 'ignored' && !password) {
            console.debug(`${key}: missing password`)
            continue
          }
          hosts[key] = value
        }
        count += 1
      } catch (e) {
        console.log(`%cError processing: ${key}`, 'color: Red', e)
      }
    }
  }
  // console.debug('hosts:', hosts)
  await Hosts.update(hosts)
  const type = count ? 'success' : 'warning'
  showToast(
    `${i18n.t('ui.action.importUpdate')} ${count}/${total} ${i18n.t('ui.text.hosts')}.`,
    type,
  )
}

function getHost(hostname: string) {
  let host = hostname.toLowerCase().trim()
  host = host.includes('://') ? host : 'https://' + host
  // console.debug('host:', host)
  const url = new URL(host)
  console.debug('url.host:', url.host)
  if (!url.host) {
    throw new Error(`Invalid Hostname: ${hostname}`)
  }
  return url.host
}

export function parseCreds(creds: string): [string, string] {
  // console.log('parseCreds:', creds)
  const i = creds.indexOf(':')
  if (i === -1) return [creds, '']
  const username = creds.slice(0, i)
  const password = creds.slice(i + 1)
  // console.log('username:', username)
  // console.log('password:', password)
  return [username, password]
}
