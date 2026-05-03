import { i18n } from '#imports'
import { showToast } from '@/composables/useToast.ts'
import { Hosts } from '@/utils/hosts.ts'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function debounce(fn: Function, timeout = 250) {
  let timeoutID: ReturnType<typeof setTimeout>
  return (...args: unknown[]) => {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn(...args), timeout)
  }
}

// TODO: Functions that showToast or use navigator should be isolated...

export function copyToast(text: string, message: string, type = 'success') {
  // console.log('copyToast:', text)
  navigator.clipboard
    .writeText(text)
    .then(() => showToast(message, type))
    .catch(console.log)
}

// NOTE: Temporary helper function until Hosts is updated...
export async function submitHost(
  host: string,
  user: string,
  pass: string,
  original?: string,
) {
  // console.log('submitHost:', host, user, pass, original)
  try {
    // NOTE: Update Hosts.set to handle this logic...
    if (original) {
      await Hosts.edit(original, host, `${user}:${pass}`)
    } else {
      await Hosts.set(host, `${user}:${pass}`)
    }
    showToast(`${i18n.t('ui.action.addEdit')}: ${host}`, 'success')
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error'
    showToast(`${i18n.t('ui.text.addEditError')}: ${message}`, 'danger')
  }
}
