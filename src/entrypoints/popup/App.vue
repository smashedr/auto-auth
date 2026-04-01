<script setup lang="ts">
import { computed } from 'vue'
import { isFirefox, isMobile } from '@/utils/system.ts'
import ToastAlerts from '@/components/ToastAlerts.vue'
import PanelHeader from '@/components/PanelHeader.vue'
import PermsCheck from '@/components/PermsCheck.vue'
import OptionsForm from '@/components/OptionsForm.vue'
import ButtonsList from '@/components/ButtonsList.vue'

console.debug('%c popup/App.vue', 'color: Lime')

const isBrowser = isFirefox ? '360px' : null
const width = computed(() => (isMobile ? '100%' : isBrowser))
console.log('width:', width.value)
</script>

<template>
  <div id="popupContainer">
    <PanelHeader :close-window="true" :popup-button="false" />

    <!--<PermsCheck />-->

    <div class="d-grid gap-2 p-1">
      <PermsCheck :close-window="true" />
      <ButtonsList :close-window="true" :popup-button="false" />
    </div>

    <OptionsForm :close-window="true" :compact="true" :show="['switches'" />

    <ToastAlerts />
  </div>
</template>

<style scoped>
#popupContainer {
  width: v-bind(width);
}
</style>
