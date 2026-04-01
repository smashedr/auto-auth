// composables/useHosts.ts
import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { HostsRecord } from '@/utils/hosts.ts'

export function useHosts(): Ref<HostsRecord> {
  const hosts = ref<HostsRecord>({})

  // NOTE: Consider improving listener to only trigger on hosts changes
  const listener = async () => (hosts.value = await Hosts.all())

  if (!chrome.storage.onChanged.hasListener(listener)) {
    chrome.storage.onChanged.addListener(listener)
  }

  onMounted(() => Hosts.all().then(async (results) => (hosts.value = results)))
  onUnmounted(() => chrome.storage.onChanged.removeListener(listener))

  return hosts
}
