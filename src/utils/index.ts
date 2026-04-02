import { showToast } from '@/composables/useToast.ts'

export function debounce(fn: Function, timeout = 250) {
  let timeoutID: ReturnType<typeof setTimeout>
  return (...args: unknown[]) => {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn(...args), timeout)
  }
}

export function copyToast(text: string, message: string, type = 'success') {
  console.log('copyToast:', text)
  navigator.clipboard
    .writeText(text)
    .then(() => showToast(message, type))
    .catch((e) => console.log(e))
}

export async function submitHost(
  host: string,
  user: string,
  pass: string,
  original?: string,
) {
  console.log('submitHost:', host, user, pass, original)
  try {
    // NOTE: Update Hosts.set to handle this logic...
    if (original) {
      await Hosts.edit(original, host, `${user}:${pass}`)
    } else {
      await Hosts.set(host, `${user}:${pass}`)
    }

    showToast(`Add/Edited: ${host}`, 'success')
  } catch (e) {
    if (e instanceof Error) showToast(`Add/Edit Error: ${e.message}`, 'danger')
  }
}
