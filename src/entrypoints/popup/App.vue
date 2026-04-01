<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { isFirefox, isMobile } from '@/utils/system.ts'
import { openOptions } from '@/utils/extension.ts'
import { showToast } from '@/composables/useToast.ts'
import { useSiteInfo } from '@/composables/useSiteInfo.ts'
import ToastAlerts from '@/components/ToastAlerts.vue'
import PanelHeader from '@/components/PanelHeader.vue'
import PermsCheck from '@/components/PermsCheck.vue'
import OptionsForm from '@/components/OptionsForm.vue'
import { Hosts } from '@/utils/hosts.ts'

console.debug('%c popup/App.vue', 'color: Lime')

const siteInfo = useSiteInfo()

const hostnameRef = ref('') // tab hostname
const usernameRef = ref('') // saved username
const savedCreds = ref(false) // has credentials

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

function deleteCreds() {
  console.log('deleteCreds:', hostnameRef.value)
  showToast('INOP - Use Options Page', 'warning')
  // TODO: check options.confirmDelete and show DeleteModal or Delete Creds...
}

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
        <div id="username" class="text-center rounded border border-2 border-success-subtle text-ellipsis p-1">
          Username: <span class="fw-bold text-success-emphasis">{{ usernameRef }}</span>
        </div>
        <button class="btn btn-outline-warning" @click="deleteCreds">
          <i class="fa-regular fa-trash-can me-1"></i>
          <span>Delete Saved Credentials</span>
        </button>
      </template>

      <OptionsForm :close-window="true" :compact="true" :show="['switches']" class="px-1" />

      <a class="btn btn-outline-info w-100" href="/options.html" @click.prevent="openOptions(true)">
        <i class="fa-solid fa-sliders me-1"></i> More Options</a
      >
    </div>

    <ToastAlerts />
  </div>
</template>

<style scoped>
#popupContainer {
  width: v-bind(width);
}
</style>
