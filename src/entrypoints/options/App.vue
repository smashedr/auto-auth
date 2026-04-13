<script setup lang="ts">
import { i18n } from '#imports'
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
import ImportText from '@/components/ImportText.vue'
import AddHostButton from '@/components/AddHostButton.vue'
import PageHeader from '@/components/PageHeader.vue'

console.debug('%c options/App.vue', 'color: SpringGreen')

useTitle(i18n.t('options.title'))

useBackground()
</script>

<template>
  <div class="d-flex align-items-center justify-content-center h-100 w-100 p-1 p-md-3">
    <div class="m-auto pb-4 w-100">
      <div id="options-wrapper" class="glass-outline rounded rounded-3 w-100 m-auto p-2 p-md-3">
        <PageHeader />

        <KeyboardShortcuts />

        <HorizontalRule class="my-2">{{ i18n.t('options.extension') }}</HorizontalRule>
        <PermsCheck :show-info="true" :show-remove="false" class="my-3" />
        <OptionsForm />

        <HorizontalRule class="my-2">{{ i18n.t('options.savedCredentials') }}</HorizontalRule>
        <div class="d-grid gap-2 d-md-flex my-3">
          <AddHostButton class="flex-md-fill text-truncate" />
          <ImportText class="flex-md-fill text-truncate" />
        </div>

        <!--NOTE: Add fallthrough attributes-->
        <HostsTable />

        <CopySupport
          :message="i18n.t('options.copySupportMsg')"
          :tip="i18n.t('options.copySupportTip')"
          class="fst-italic small my-3"
          >{{ i18n.t('options.copySupport') }}</CopySupport
        >

        <hr class="my-2 my-md-3" />

        <PageFooter />
      </div>
      <!-- #options-wrapper -->
    </div>
  </div>

  <ToastAlerts />
  <BackToTop />
</template>
