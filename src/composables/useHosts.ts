import { ref, onMounted, onUnmounted } from 'vue'
import type { HostsRecord } from '@/utils/hosts.ts'
import type { Ref } from 'vue'

export function useHosts(): Ref<HostsRecord> {
  console.debug('%cLOADED composables/useHosts.ts', 'color: Yellow')

  const hosts = ref<HostsRecord>({})

  // NOTE: Consider improving listener to only trigger on hosts changes
  const onChanged = async (changes: any) => {
    // console.log('useHosts - onChanged:', changes)
    const keys = Object.keys(changes)
    // console.log('useHosts - keys:', keys)
    if (keys.some((key) => key.length === 1)) {
      console.log('%c composables/useHosts.ts - CHANGE DETECTED ', 'color: Yellow')
      hosts.value = await Hosts.all()
    }
  }

  if (!chrome.storage.sync.onChanged.hasListener(onChanged)) {
    // console.debug('%c useHosts - addListener', 'color: Lime')
    chrome.storage.sync.onChanged.addListener(onChanged)
  }

  onMounted(() => Hosts.all().then(async (results) => (hosts.value = results)))
  onUnmounted(() => chrome.storage.sync.onChanged.removeListener(onChanged))

  return hosts
}
