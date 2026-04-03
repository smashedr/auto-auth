<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'
import { importCredentials } from '@/utils/creds.ts'

const modalEl = ref<HTMLElement | null>(null)
const textareaEl = ref<HTMLTextAreaElement | null>(null)
const textRef = ref('')
const invalidText = ref('')

async function importClick(event: Event) {
  console.debug('importClick:', event)
  console.debug('textRef:', textRef.value)
  if (!textRef.value) {
    textareaEl.value?.focus()
    return
  }
  try {
    const data = JSON.parse(textRef.value)
    await importCredentials(data)
    if (modalEl.value) Modal.getInstance(modalEl.value)?.hide()
    textRef.value = ''
  } catch (e) {
    console.debug('Import Error:', e)
    if (e instanceof Error) invalidText.value = e.message
  }
}

function clearClick() {
  textRef.value = ''
  invalidText.value = ''
  textareaEl.value?.focus()
}

onMounted(() => {
  if (!modalEl.value) return
  // const modal = Modal.getOrCreateInstance(modalEl.value)
  // console.log('modal:', modal)
  modalEl.value?.addEventListener('shown.bs.modal', () => {
    textareaEl.value?.focus()
    textareaEl.value?.select()
  })
  modalEl.value.addEventListener('hidden.bs.modal', () => {
    console.log('hidden.bs.modal')
    invalidText.value = ''
  })
})
</script>

<template>
  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#import-modal">
    <i class="fa-solid fa-align-left ms-1"></i> {{ i18n.t('import.importText') }}
  </button>

  <Teleport to="body">
    <div
      ref="modalEl"
      class="modal fade"
      id="import-modal"
      tabindex="-1"
      aria-labelledby="import-modal-label"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="import-modal-label">{{ i18n.t('import.importCredentials') }}</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              :aria-label="i18n.t('ui.action.close')"
              tabindex="-1"
            ></button>
          </div>
          <div class="modal-body">
            <div class="">
              <label for="import-textarea" class="mb-1">
                {{ i18n.t('import.jsonImport') }} <i class="fa-solid fa-code"></i>
              </label>
              <textarea
                v-model="textRef"
                ref="textareaEl"
                class="form-control"
                :class="{ 'is-invalid': invalidText }"
                :placeholder="i18n.t('import.placeholder')"
                id="import-textarea"
                style="height: 100px"
                @input="invalidText = ''"
              ></textarea>
              <div class="invalid-feedback">{{ invalidText }}</div>
              <div>
                {{ i18n.t('import.formatSee') }}
                <a
                  href="https://github.com/cssnr/auto-auth?tab=readme-ov-file#Migration"
                  target="_blank"
                  rel="noopener"
                >
                  {{ i18n.t('import.migrationGuide') }}</a
                >
                {{ i18n.t('import.onGithub') }}.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button id="import-text" type="button" class="btn btn-success me-auto" @click.prevent="importClick">
              {{ i18n.t('import.import') }} <i class="fa-solid fa-cloud-arrow-down ms-2"></i>
            </button>
            <button id="clear-import" type="button" class="btn btn-outline-warning" @click="clearClick">
              {{ i18n.t('ui.action.clear') }}
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ i18n.t('ui.action.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!--<style scoped></style>-->
