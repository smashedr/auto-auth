<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { isFirefox, isMobile } from '@/utils/system.ts'
import { openOptions } from '@/utils/extension.ts'
import { showToast } from '@/composables/useToast.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { useSiteInfo } from '@/composables/useSiteInfo.ts'
import { Hosts } from '@/utils/hosts.ts'
import ToastAlerts from '@/components/ToastAlerts.vue'
import PanelHeader from '@/components/PanelHeader.vue'
import PermsCheck from '@/components/PermsCheck.vue'
import OptionsForm from '@/components/OptionsForm.vue'
import DeleteModal from '@/components/DeleteModal.vue'

console.debug('%c popup/App.vue', 'color: Lime')

const options = useOptions()
const siteInfo = useSiteInfo()

const hostnameRef = ref('') // tab hostname
const usernameRef = ref('') // saved username
const savedCreds = ref(false) // has credentials

const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)

// DUPLICATION: Copied from HostsTable.vue
function deleteClick(host: string) {
  console.log('HostsTable.vue - deleteClick:', host)
  if (options.value.confirmDelete) {
    console.log('deleteModal.value:', deleteModal.value)
    deleteModal.value?.show(host)
  } else {
    deleteHost(host)
  }
}

async function deleteHost(host: string) {
  console.log('HostsTable.vue - deleteHost:', host)
  const creds = await Hosts.get(host)
  // DUPLICATION: Copied from HostsTable.vue
  console.log('creds:', creds) // NOTE: Handle undefined creds, also, creds are not used
  if (!creds) return showToast('Credentials Not Found')
  try {
    await Hosts.delete(host)
    hostnameRef.value = ''
    usernameRef.value = ''
    savedCreds.value = false
    showToast(`Removed: ${host}`, 'success')
  } catch (e) {
    if (e instanceof Error) showToast(`Delete Host Error: ${e.message}`, 'danger')
  }
}

watch(
  siteInfo,
  async (info) => {
    console.log('popup/App.vue %c watch: siteInfo:', 'color: OrangeRed', info)
    console.log('info.hostname:', info?.hostname)
    if (!info?.hostname) return
    hostnameRef.value = info.hostname
    const creds = await Hosts.get(hostnameRef.value)
    console.log('creds:', creds)
    if (!creds) return
    savedCreds.value = true
    usernameRef.value = creds.split(':')[0]
    console.log('usernameRef.value:', usernameRef.value)
  },
  { once: true },
)

// function deleteCreds() {
//   console.log('deleteCreds:', hostnameRef.value)
//   showToast('INOP - Use Options Page', 'warning')
//   // TODO: check options.confirmDelete and show DeleteModal or Delete Creds...
// }

const isBrowser = isFirefox ? '360px' : null
const width = computed(() => (isMobile ? '100%' : isBrowser))
console.log('width:', width.value)

onMounted(async () => {
  const all = await Hosts.all()
  console.log('all:', all)
})
</script>

<template>
  <div id="popupContainer">
    <PanelHeader :close-window="true" :popup-button="false" />

    <div class="d-grid gap-2 p-1">
      <PermsCheck :close-window="true" />

      <div v-if="!siteInfo" class="text-center rounded border border-2 border-danger-subtle text-ellipsis p-1">
        No Access to the Current Tab.
      </div>
      <div v-if="siteInfo && !savedCreds" class="text-center rounded border border-2 text-ellipsis p-1">
        No Saved Credentials Found.
      </div>
      <template v-if="savedCreds">
        <div
          id="username"
          class="text-center rounded border border-2 text-ellipsis p-1"
          :class="usernameRef === 'ignored' ? 'border-warning-subtle' : 'border-success-subtle'"
        >
          Username:
          <span
            class="fw-bold"
            :class="usernameRef === 'ignored' ? 'text-warning-emphasis' : 'text-success-emphasis'"
            >{{ usernameRef === 'ignored' ? 'Host Ignored' : usernameRef }}</span
          >
        </div>
        <button class="btn btn-outline-warning" @click="deleteClick(hostnameRef)">
          <i class="fa-regular fa-trash-can me-1"></i>
          <span>Delete Saved Credentials</span>
        </button>
      </template>

      <OptionsForm :close-window="true" :compact="true" :show="['switches']" class="px-1" />

      <a class="btn btn-outline-info w-100" href="/options.html" @click.prevent="openOptions(true)">
        <i class="fa-solid fa-sliders me-1"></i> More Options</a
      >
    </div>

    <DeleteModal ref="deleteModal" @delete="deleteHost" />
    <ToastAlerts />
  </div>
</template>

<style scoped>
#popupContainer {
  width: v-bind(width);
}
</style>
