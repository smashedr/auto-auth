<script setup lang="ts">
import { i18n } from '#imports'
import { clickOpen } from '@/utils/extension.ts'
import { useTitle } from '@/composables/useTitle.ts'
import { useBackground } from '@/composables/useBackground.ts'
import BackToTop from '@/components/BackToTop.vue'
import PermsCheck from '@/components/PermsCheck.vue'
import ToastAlerts from '@/components/ToastAlerts.vue'
import OptionsForm from '@/components/OptionsForm.vue'
import KeyboardShortcuts from '@/components/KeyboardShortcuts.vue'
import PageFooter from '@/components/PageFooter.vue'
import HorizontalRule from '@/components/HorizontalRule.vue'
import CopySupport from '@/components/CopySupport.vue'
import HostsTable from '@/components/HostsTable.vue'

console.debug('%c options/App.vue', 'color: SpringGreen')

useBackground()

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
              :title="i18n.t('ui.text.homePage')"
              :href="manifest.homepage_url"
              target="_blank"
              rel="nofollow"
              @click.prevent="clickOpen"
            >
              {{ manifest.name }}</a
            >
            <a
              class="link-body-emphasis text-decoration-none small"
              :title="i18n.t('ui.text.releaseNotes')"
              :href="`${manifest.homepage_url}/releases/tag/${manifest.version}`"
              target="_blank"
              rel="nofollow"
              @click.prevent="clickOpen"
            >
              v<span class="version">{{ manifest.version }}</span></a
            >
          </div>
        </div>

        <!--TODO: Update Trans-->
        <HorizontalRule>{{ i18n.t('keyboard.shortcuts') }}</HorizontalRule>
        <KeyboardShortcuts />

        <HorizontalRule>{{ i18n.t('options.extension') }}</HorizontalRule>
        <OptionsForm />

        <PermsCheck :show-info="true" :show-remove="false" class="my-3" />

        <HorizontalRule>{{ i18n.t('options.savedCredentials') }}</HorizontalRule>
        <!--NOTE: Add fallthrough attributes-->
        <HostsTable />

        <CopySupport
          :message="i18n.t('options.copySupportMsg')"
          :tip="i18n.t('options.copySupportTip')"
          class="fst-italic small"
          >{{ i18n.t('options.copySupport') }}</CopySupport
        >

        <hr />

        <PageFooter />
      </div>
      <!-- #options-wrapper -->
    </div>
  </div>

  <ToastAlerts />
  <BackToTop />
</template>

<!--<style scoped></style>-->
