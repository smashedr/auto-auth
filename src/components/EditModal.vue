<script setup lang="ts">
import { i18n } from '#imports'
import { onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'
import { copyToast } from '@/utils/index.ts'

withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const modalEl = ref<HTMLElement | null>(null)

const originalHost = ref('')
const hostRef = ref('')
const userRef = ref('')
const passRef = ref('')

const passwordShown = ref(false)

const emit = defineEmits(['edit'])

function show(host: string, creds: string) {
  if (!modalEl.value) return console.error('no modalEl')
  originalHost.value = host
  hostRef.value = host
  const [username, password] = creds.split(':')
  userRef.value = username
  passRef.value = password
  Modal.getOrCreateInstance(modalEl.value).show()
}

function hide() {
  if (!modalEl.value) return
  Modal.getInstance(modalEl.value)?.hide()
}

function onSave() {
  console.log('EditModal.vue - onSave:', hostRef.value, userRef.value, passRef.value)
  emit('edit', originalHost.value, hostRef.value, userRef.value, passRef.value)
  hide()
}

function onChange(e: Event) {
  // NOTE: ADD Validation Here... Copied from VanillaJS.
  console.log('EditModal.vue - onChange:', e)
  try {
    let host = hostRef.value.toLowerCase().trim()
    console.log('host:', host)
    host = host.includes('://') ? host : 'https://' + host
    console.debug('host:', host)
    const url = new URL(host)
    console.debug('url.host:', url.host)
    if (!url.host) return console.error(`Invalid Hostname: ${hostRef.value}`)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  modalEl.value?.addEventListener('hidden.bs.modal', (event) => {
    console.log('hidden.bs.modal', event)
    passwordShown.value = false
  })

  // TODO: Implement other modal listeners...

  // modalEl.value?.addEventListener('shown.bs.modal', () => {
  //   if (editForm.dataset.action === 'add') {
  //     editHostname.focus()
  //   } else {
  //     editUsername.focus()
  //   }
  // })

  // modalEl.value?.addEventListener('hide.bs.modal', () => {
  //   modalEl.value._config.backdrop = true
  //   editModalAlert.classList.add('d-none')
  // })

  // modalEl.value?.addEventListener('hidePrevented.bs.modal', () => {
  //   console.log('Changes Detected!')
  //   editModalAlert.classList.remove('d-none')
  // })
})

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <div ref="modalEl" class="modal fade" tabindex="-1" aria-labelledby="edit-modal-label" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="edit-modal-label">Edit Host</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" tabindex="-1"></button>
          </div>
          <div class="modal-body">
            <form id="edit-form" name="edit-form" class="mb-3" autocomplete="off">
              <label for="hostname" class="form-label" :class="compact ? 'visually-hidden' : ''"
                ><i class="fa-solid fa-globe me-2"></i> Hostname</label
              >
              <div class="input-group has-validation col-12 mb-3">
                <input
                  v-model="hostRef"
                  id="hostname"
                  placeholder="hostname"
                  aria-describedby="hostnameHelp hostnameValidation"
                  type="text"
                  class="form-control"
                  autocomplete="off"
                  required
                  @change="onChange"
                />
                <button
                  class="btn btn-outline-info"
                  type="button"
                  data-bs-toggle="tooltip"
                  tabindex="-1"
                  data-copy-input="#hostname"
                  data-copy-text="Hostname Copied."
                  data-bs-placement="bottom"
                  data-bs-trigger="hover"
                  data-bs-title="Copy Hostname"
                  v-bs
                  @click="copyToast(hostRef, 'Hostname Copied to Clipboard.')"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <!--<button class="btn btn-outline-info" type="button" data-bs-toggle="tooltip" tabindex="-1" data-paste-input="#hostname"-->
                <!--        data-bs-placement="bottom" data-bs-trigger="hover" data-bs-title="Paste Hostname">-->
                <!--    <i class="fa-regular fa-paste"></i>-->
                <!--</button>-->
                <div id="hostnameValidation" class="invalid-feedback"></div>
              </div>
              <div class="form-text visually-hidden" id="hostnameHelp">Basic Authentication Hostname.</div>

              <label for="username" class="form-label" :class="compact ? 'visually-hidden' : ''"
                ><i class="fa-solid fa-user me-2"></i> Username</label
              >
              <div class="input-group has-validation col-12 mb-3">
                <input
                  v-model="userRef"
                  id="username"
                  placeholder="username"
                  aria-describedby="usernameHelp usernameValidation"
                  type="text"
                  class="form-control"
                  autocomplete="off"
                  required
                />
                <button
                  class="btn btn-outline-info"
                  type="button"
                  data-bs-toggle="tooltip"
                  tabindex="-1"
                  data-copy-input="#username"
                  data-copy-text="Username Copied."
                  data-bs-placement="bottom"
                  data-bs-trigger="hover"
                  data-bs-title="Copy Username"
                  v-bs
                  @click="copyToast(userRef, 'Username Copied to Clipboard.')"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <!--<button class="btn btn-outline-info" type="button" data-bs-toggle="tooltip" tabindex="-1" data-paste-input="#username"-->
                <!--        data-bs-placement="bottom" data-bs-trigger="hover" data-bs-title="Paste Username">-->
                <!--    <i class="fa-regular fa-paste"></i>-->
                <!--</button>-->
                <div id="usernameValidation" class="invalid-feedback"></div>
              </div>
              <div class="form-text visually-hidden" id="usernameHelp">Basic Authentication Username.</div>
              <div class="form-check form-switch ms-2 mb-3">
                <input class="form-check-input" type="checkbox" role="switch" id="usernameSwitch" tabindex="-1" />
                <label class="form-check-label" for="usernameSwitch">No Username</label>
              </div>

              <label for="password" class="form-label" :class="compact ? 'visually-hidden' : ''"
                ><i class="fa-solid fa-key me-2"></i> Password</label
              >
              <div class="input-group has-validation col-12 mb-3">
                <input
                  v-model="passRef"
                  id="password"
                  placeholder="password"
                  aria-describedby="passwordHelp passwordValidation"
                  :type="passwordShown ? 'text' : 'password'"
                  class="form-control"
                  autocomplete="off"
                  required
                />
                <button
                  class="btn"
                  :class="passwordShown ? 'btn-warning' : 'btn-outline-success'"
                  type="button"
                  data-bs-toggle="tooltip"
                  data-show-hide="#password"
                  tabindex="-1"
                  data-bs-placement="bottom"
                  data-bs-trigger="hover"
                  data-bs-title="Show/Hide Password"
                  v-bs
                  @click.prevent="() => (passwordShown = !passwordShown)"
                >
                  <i class="fa-regular fa-eye"></i>
                </button>
                <button
                  class="btn btn-outline-info"
                  type="button"
                  data-bs-toggle="tooltip"
                  tabindex="-1"
                  data-copy-input="#password"
                  data-copy-text="Password Copied."
                  data-bs-placement="bottom"
                  data-bs-trigger="hover"
                  data-bs-title="Copy Password"
                  v-bs
                  @click="copyToast(passRef, 'Password Copied to Clipboard.')"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <!--<button id="passwordCopy" class="btn btn-outline-info" type="button" tabindex="-1" data-paste-input="#password"-->
                <!--        data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-trigger="hover" data-bs-title="Paste Password">-->
                <!--    <i class="fa-regular fa-paste"></i>-->
                <!--</button>-->
                <div id="passwordValidation" class="invalid-feedback"></div>
              </div>
              <div class="form-text visually-hidden" id="passwordHelp">Basic Authentication Password.</div>
            </form>

            <!--TODO: Implement alert-->
            <div class="alert alert-warning text-center p-2 mb-2 d-none" role="alert">Unsaved Changes Detected.</div>
          </div>

          <div class="modal-footer">
            <button type="submit" form="edit-form" class="btn btn-success me-auto" @click.prevent="onSave">
              {{ i18n.t('ui.action.save') }} <i class="fa-regular fa-floppy-disk ms-2"></i>
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ i18n.t('ui.action.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!--<style scoped></style>-->
