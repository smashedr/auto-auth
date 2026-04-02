<script setup lang="ts">
import { ref } from 'vue'
import { Modal } from 'bootstrap'

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

async function importCredentials(data: any) {
  // NOTE: Cleanup this function, copied from VanillaJS
  console.debug('importCredentials:', data)
  const hosts: Record<string, string> = {}
  let count = 0
  let total
  if ('credentialsArray' in data) {
    // Basic Authentication (nanfgbiblbcagfodkfeinbbhijihckml)
    console.debug('Processing - %c Basic Authentication', 'color: SpringGreen')
    total = data.credentialsArray.length
    for (const item of data.credentialsArray) {
      try {
        // console.debug('item:', item)
        const key = getHost(item.url)
        hosts[key] = `${item.login}:${item.password}`
        count += 1
      } catch (e) {
        console.log(`Error processing item:`, 'color: Red', item, e)
      }
    }
  } else {
    console.debug('Processing - %c AutoAuth/Native', 'color: SpringGreen')
    total = Object.keys(data).length
    for (const [key, value] of Object.entries(data)) {
      // console.debug(`${key}:`, value)
      try {
        if (typeof value === 'object') {
          // AutoAuth (steffanschlein)
          const { username, password } = value as any
          console.debug('username, password:', username, password)
          if (!username || !password) {
            console.debug(`${key}: missing username or password`)
            continue
          }
          hosts[key] = `${username}:${password}`
        } else if (typeof value === 'string') {
          // Auto Auth (this extension)
          const [username, password] = value.split(':')
          if (value !== 'ignored' && (!username || !password)) {
            console.debug(`${key}: missing username or password`)
            continue
          }
          hosts[key] = value
        }
        count += 1
      } catch (e) {
        console.log(`Error processing: ${key}`, 'color: Red', e)
      }
    }
  }
  // console.debug('hosts:', hosts)
  await Hosts.update(hosts)
  const type = count ? 'success' : 'warning'
  showToast(`Imported/Updated ${count}/${total} Hosts.`, type)
}

function getHost(hostname: string) {
  let host = hostname.toLowerCase().trim()
  host = host.includes('://') ? host : 'https://' + host
  console.debug('host:', host)
  const url = new URL(host)
  console.debug('url.host:', url.host)
  if (!url.host) {
    throw new Error(`Invalid Hostname: ${hostname}`)
  }
  return url.host
}
</script>

<template>
  <div class="mb-1 small">
    <a id="export-hosts" class="link-body-emphasis text-decoration-none d-inline-block" role="button">
      Export <i class="fa-solid fa-right-from-bracket fa-rotate-90 ms-1"></i
    ></a>
    <span class="mx-1">&bull;</span>
    <input id="hosts-input" type="file" style="display: none" />
    <a id="import-file" class="link-body-emphasis text-decoration-none d-inline-block" role="button">
      Import File <i class="fa-solid fa-right-to-bracket fa-rotate-90 ms-1"></i
    ></a>
    <span class="mx-1">&bull;</span>
    <a
      class="link-body-emphasis text-decoration-none d-inline-block"
      role="button"
      data-bs-toggle="modal"
      data-bs-target="#import-modal"
    >
      Import Text <i class="fa-solid fa-align-left ms-1"></i
    ></a>
  </div>

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
