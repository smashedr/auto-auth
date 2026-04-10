<script setup lang="ts">
import { i18n } from '#imports'
import { onMounted } from 'vue'
import { debounce } from '@/utils/index.ts'
import { useTitle } from '@/composables/useTitle.ts'
import ToastAlerts from '@/components/ToastAlerts.vue'
import BackToTop from '@/components/BackToTop.vue'
import PanelHeader from '@/components/PanelHeader.vue'
import PanelFooter from '@/components/PanelFooter.vue'
import PermsCheck from '@/components/PermsCheck.vue'
import OptionsForm from '@/components/OptionsForm.vue'
import HostsTable from '@/components/HostsTable.vue'
import AddHostButton from '@/components/AddHostButton.vue'
import ImportText from '@/components/ImportText.vue'
import HorizontalRule from '@/components/HorizontalRule.vue'

console.debug('%c popout/App.vue', 'color: Lime')

useTitle('Panel')

async function windowResize() {
  const size = { panelWidth: window.outerWidth, panelHeight: window.outerHeight }
  console.debug('windowResize:', size)
  await chrome.storage.local.set(size).catch((e) => console.warn(e))
}

onMounted(() => {
  window.addEventListener('resize', debounce(windowResize))

  chrome.windows.getCurrent().then((window) => {
    chrome.storage.local.set({ lastPanelID: window.id }).then(() => {
      console.debug(`%c Set lastPanelID: ${window.id}`, 'color: Aqua')
    })
  })
})
</script>

<template>
  <header class="flex-shrink-0">
    <PanelHeader :panel-button="false" :side-button="false" :popup-button="false" />
  </header>

  <main class="flex-grow-1 overflow-auto p-1">
    <div class="d-grid gap-2">
      <PermsCheck />
      <div class="d-grid gap-2 d-sm-flex">
        <AddHostButton class="flex-sm-fill text-truncate" />
        <ImportText class="flex-sm-fill text-truncate" />
      </div>
      <HostsTable />
      <HorizontalRule>{{ i18n.t('options.extension') }}</HorizontalRule>
      <OptionsForm :close-window="true" :compact="true" :show="['switches', 'background']" />
    </div>
  </main>

  <footer class="flex-shrink-0">
    <PanelFooter />
  </footer>

  <ToastAlerts />
  <BackToTop />
</template>

<!--<style scoped></style>-->
