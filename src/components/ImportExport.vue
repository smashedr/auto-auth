<script setup lang="ts">
import { ref } from 'vue'
import { importCredentials } from '@/utils/creds.ts'
import { showToast } from '@/composables/useToast.ts'
import { Hosts } from '@/utils/hosts.ts'

const hostsInput = ref()

async function exportHosts(event: Event) {
  console.debug('exportHosts:', event)
  event.preventDefault()
  const hosts = await Hosts.all()
  // console.debug('hosts:', hosts)
  if (Object.keys(hosts).length === 0) {
    return showToast(i18n.t('ui.text.noCredentialsExport'), 'warning')
  }
  const json = JSON.stringify(hosts, null, 2)
  textFileDownload('auto-auth-secrets.txt', json)
}

function textFileDownload(filename: string, text: string) {
  console.debug(`textFileDownload: ${filename}`)
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)
  element.classList.add('d-none')
  document.body.appendChild(element)
  element.click()
  element.remove()
}

async function importHostsClick(event: Event) {
  console.debug('importHostsClick:', event)
  console.debug('hostsInput.value:', hostsInput.value)
  hostsInput.value?.click()
}

async function hostsInputChange(event: Event) {
  console.debug('hostsInputChange:', event, hostsInput)
  try {
    const target = event.currentTarget as HTMLInputElement
    const file = target.files?.item(0)
    if (!file) return showToast(i18n.t('ui.text.errorReadingFile'), 'error')
    const text = await file.text()
    const data = JSON.parse(text)
    console.debug('data:', data)
    await importCredentials(data)
  } catch (e) {
    console.log('Import error:', e)
    if (e instanceof Error) showToast(`${i18n.t('ui.text.importError')}: ${e.message}`, 'warning')
  }
}
</script>

<template>
  <div>
    <a
      id="export-hosts"
      class="link-body-emphasis text-decoration-none d-inline-block"
      role="button"
      @click="exportHosts"
    >
      {{ i18n.t('import.exportAll') }} <i class="fa-solid fa-right-from-bracket fa-rotate-90 ms-1"></i
    ></a>
    <span class="mx-2">&bull;</span>
    <input ref="hostsInput" type="file" style="display: none" @change.prevent="hostsInputChange" />
    <a
      id="import-file"
      class="link-body-emphasis text-decoration-none d-inline-block"
      role="button"
      @click.prevent="importHostsClick"
    >
      {{ i18n.t('import.importFile') }} <i class="fa-solid fa-right-to-bracket fa-rotate-90 ms-1"></i
    ></a>
  </div>
</template>
