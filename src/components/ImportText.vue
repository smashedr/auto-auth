<script setup lang="ts">
import { ref } from 'vue'
import { Modal } from 'bootstrap'
import { importCredentials } from '@/utils/creds.ts'

const modalEl = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

async function importText(event: Event) {
  console.debug('importText:', event)
  if (!textareaRef.value) return
  console.debug('textareaRef.value.value:', textareaRef.value.value)
  if (!textareaRef.value.value) {
    textareaRef.value.focus()
    return
  }
  try {
    const data = JSON.parse(textareaRef.value.value)
    // console.debug('data:', data)
    await importCredentials(data)
    if (modalEl.value) Modal.getInstance(modalEl.value)?.hide()
    textareaRef.value.value = ''
  } catch (e) {
    console.debug('Import Error:', e)
    // TODO: Handle this error...
    // importModalEl.querySelector('.invalid-feedback').textContent =
    //   `Import Error: ${e.message}`
    // textareaRef.value.classList.add('is-invalid')
    // // showToast(`Import Error: ${e.message}`, 'danger')
  }
}
</script>

<template>
  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#import-modal">
    <i class="fa-solid fa-align-left ms-1"></i> Import Text
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
            <h1 class="modal-title fs-5" id="import-modal-label">Import Credentials</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" tabindex="-1"></button>
          </div>
          <div class="modal-body">
            <div class="">
              <label for="import-textarea" class="mb-1"> JSON Import <i class="fa-solid fa-code"></i> </label>
              <textarea
                ref="textareaRef"
                class="form-control"
                placeholder="Paste text to import here..."
                id="import-textarea"
                style="height: 100px"
              ></textarea>
              <div class="invalid-feedback"></div>
              <div>
                For data format, see the
                <a
                  href="https://github.com/cssnr/auto-auth?tab=readme-ov-file#Migration"
                  target="_blank"
                  rel="noopener"
                >
                  Migration Guide</a
                >
                on GitHub.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button id="import-text" type="button" class="btn btn-success me-auto" @click.prevent="importText">
              Import<i class="fa-solid fa-cloud-arrow-down ms-2"></i>
            </button>
            <button id="clear-import" type="button" class="btn btn-outline-warning">Clear</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!--<style scoped></style>-->
