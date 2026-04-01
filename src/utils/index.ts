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
