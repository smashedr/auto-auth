<!--TODO: UPDATE MERGE - NOT USED-->
<script setup lang="ts">
import { i18n } from '#imports'
import { useId } from 'vue'
import ThemeSwitch from '@/components/ThemeSwitch.vue'
import HostsTable from '@/components/HostsTable.vue'
import AddHostButton from '@/components/AddHostButton.vue'
import ImportText from '@/components/ImportText.vue'

const id = useId()
</script>

<template>
  <button
    id="toggle-button"
    class="btn btn-success opacity-75"
    type="button"
    data-bs-toggle="offcanvas"
    :data-bs-target="`#${id}-offcanvas`"
    :aria-controls="`${id}-offcanvas`"
  >
    <i class="fa-solid fa-list-ul"></i>
  </button>

  <div class="offcanvas offcanvas-start glass" tabindex="-1" :id="`${id}-offcanvas`" :aria-labelledby="`${id}-label`">
    <div class="offcanvas-header">
      <ThemeSwitch />
      <h5 class="offcanvas-title ms-2" :id="`${id}-label`">{{ i18n.t('options.savedCredentials') }}</h5>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        :aria-label="i18n.t('ui.action.close')"
      ></button>
    </div>
    <div class="offcanvas-body p-2">
      <div>
        <AddHostButton class="me-2 mb-2" />
        <ImportText class="me-2 mb-2" />
      </div>
      <HostsTable />
    </div>
  </div>
</template>

<style scoped>
#toggle-button {
  position: fixed;
  bottom: 80px;
  /*right: 0;*/
  z-index: 3;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
}
</style>
