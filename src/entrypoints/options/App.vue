<script setup lang="ts">
import { i18n } from '#imports'
import { clickOpen } from '@/utils/extension.ts'
import { useTitle } from '@/composables/useTitle.ts'
import { isFirefox } from '@/utils/system.ts'
import BackToTop from '@/components/BackToTop.vue'
import PermsCheck from '@/components/PermsCheck.vue'
import ToastAlerts from '@/components/ToastAlerts.vue'
import OptionsForm from '@/components/OptionsForm.vue'
import KeyboardShortcuts from '@/components/KeyboardShortcuts.vue'
import PageFooter from '@/components/PageFooter.vue'
import HorizontalRule from '@/components/HorizontalRule.vue'
import CopySupport from '@/components/CopySupport.vue'
import HostsTable from '@/components/HostsTable.vue'

console.debug('%c options/App.vue', 'color: Lime')

const manifest = chrome.runtime.getManifest()

useTitle(i18n.t('options.title'))
</script>

<template>
  <div class="d-flex align-items-center justify-content-center p-1 p-sm-3 h-100 w-100">
    <div class="m-auto pb-4 w-100">
      <div id="options-wrapper" class="glass-outline blur rounded rounded-3 p-2 p-sm-3 m-auto w-100">
        <div class="d-flex flex-row justify-content-center align-items-center">
          <img :src="'/icons/48.png'" class="me-1" height="48" width="48" :alt="manifest.name" :title="manifest.name" />
          <div>
            <a
              class="link-body-emphasis text-decoration-none fs-1"
              :title="i18n.t('ui.homePage')"
              :href="manifest.homepage_url"
              target="_blank"
              rel="nofollow"
              @click.prevent="clickOpen"
            >
              {{ manifest.name }}</a
            >
            <a
              class="link-body-emphasis text-decoration-none small"
              :title="i18n.t('ui.releaseNotes')"
              :href="`${manifest.homepage_url}/releases/tag/${manifest.version}`"
              target="_blank"
              rel="nofollow"
              @click.prevent="clickOpen"
            >
              v<span class="version">{{ manifest.version }}</span></a
            >
          </div>
        </div>

        <HorizontalRule>{{ i18n.t('ui.keyboard.shortcut') }}</HorizontalRule>
        <KeyboardShortcuts />

        <HorizontalRule>{{ i18n.t('options.extension') }}</HorizontalRule>
        <OptionsForm />

        <HostsTable />

        <PermsCheck :show-info="true" :show-remove="isFirefox" class="my-3" />

        <CopySupport
          :message="i18n.t('options.copySupportMsg')"
          :tip="i18n.t('options.copySupportTip')"
          class="fst-italic small"
          >{{ i18n.t('options.copySupport') }}</CopySupport
        >

        <hr class="mt-0" />

        <PageFooter />
      </div>
      <!-- #options-wrapper -->
    </div>
  </div>

  <ToastAlerts />
  <BackToTop />
</template>

<!--<style scoped></style>-->
