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
const modal = ref<Modal | any | null>(null) // NOTE: Lazy Typing...

const hostnameEl = ref<HTMLInputElement | null>(null)
const usernameEl = ref<HTMLInputElement | null>(null)
const passwordEl = ref<HTMLInputElement | null>(null)

const originalHost = ref('')
const hostRef = ref('')
const userRef = ref('')
const passRef = ref('')

const passwordShown = ref(false)
const unsavedChanges = ref(false)
const showAlert = ref(false)
const isAdding = ref(false)
const noUsername = ref(false)

const emit = defineEmits(['submit'])

function show(host?: string, creds?: string) {
  if (!modalEl.value) return console.error('no modalEl')

  if (host && creds) {
    originalHost.value = host
    hostRef.value = host
    const [username, password] = creds.split(':')
    userRef.value = username
    passRef.value = password
  } else {
    isAdding.value = true
  }

  Modal.getOrCreateInstance(modalEl.value).show()
}

function hide() {
  if (!modalEl.value) return
  Modal.getInstance(modalEl.value)?.hide()
}

function onSubmit() {
  console.log('HostModal.vue - onSubmit:', hostRef.value, userRef.value, passRef.value, originalHost.value)
  emit('submit', hostRef.value, userRef.value, passRef.value, originalHost.value)
  hide()
}

function hostnameChange() {
  // NOTE: Copied from VanillaJS. ADD Validation Here...
  console.log('HostModal.vue - hostnameChange')
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

function onceChange() {
  console.log('HostModal.vue - onceChange')
  if (!modal.value) return
  modal.value._config.backdrop = 'static'
  unsavedChanges.value = true
}

onMounted(() => {
  if (!modalEl.value) return

  modal.value = Modal.getOrCreateInstance(modalEl.value)
  console.log('modal:', modal.value)

  modalEl.value?.addEventListener('shown.bs.modal', () => {
    if (isAdding.value) {
      hostnameEl.value?.focus()
    } else if (!userRef.value) {
      passwordEl.value?.focus()
      noUsername.value = true
    } else {
      usernameEl.value?.focus()
    }
  })

  modalEl.value?.addEventListener('hidePrevented.bs.modal', () => {
    console.log('hidePrevented.bs.modal')
    showAlert.value = true
  })

  modalEl.value?.addEventListener('hide.bs.modal', () => {
    console.log('hide.bs.modal')
  })

  modalEl.value.addEventListener('hidden.bs.modal', (event) => {
    console.log('hidden.bs.modal', event)
    originalHost.value = ''
    hostRef.value = ''
    userRef.value = ''
    passRef.value = ''
    passwordShown.value = false
    unsavedChanges.value = false
    showAlert.value = false
    isAdding.value = false
    noUsername.value = false
    modal.value._config.backdrop = true
  })
})

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <div ref="modalEl" class="modal fade" tabindex="-1" aria-labelledby="edit-modal-label" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="edit-modal-label">{{ isAdding ? 'Add' : 'Edit' }} Host</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" tabindex="-1"></button>
          </div>
          <div class="modal-body">
            <form id="edit-form" name="edit-form" class="mb-3" autocomplete="off" @submit.prevent="onSubmit">
              <label for="hostname" class="form-label" :class="compact ? 'visually-hidden' : ''"
                ><i class="fa-solid fa-globe me-2"></i> {{ i18n.t('ui.text.hostname') }}</label
              >
              <div class="input-group has-validation col-12 mb-3">
                <input
                  v-model="hostRef"
                  ref="hostnameEl"
                  id="hostname"
                  placeholder="hostname"
                  aria-describedby="hostnameHelp hostnameValidation"
                  type="text"
                  class="form-control"
                  autocomplete="off"
                  required
                  @change="hostnameChange"
                  @change.once="onceChange"
                />
                <button
                  class="btn btn-outline-info"
                  type="button"
                  data-bs-toggle="tooltip"
                  tabindex="-1"
                  data-bs-placement="bottom"
                  data-bs-trigger="hover"
                  :data-bs-title="i18n.t('ui.text.copyHostname')"
                  v-bs
                  @click="copyToast(hostRef, i18n.t('ui.action.hostnameCopied'))"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <div id="hostnameValidation" class="invalid-feedback"></div>
              </div>
              <div class="form-text visually-hidden" id="hostnameHelp">Basic Authentication Hostname.</div>

              <label for="username" class="form-label" :class="compact ? 'visually-hidden' : ''"
                ><i class="fa-solid fa-user me-2"></i> {{ i18n.t('ui.text.username') }}</label
              >
              <div class="input-group has-validation col-12 mb-3">
                <input
                  v-model="userRef"
                  ref="usernameEl"
                  id="username"
                  :placeholder="i18n.t('auth.passwordPlaceholder')"
                  aria-describedby="usernameHelp usernameValidation"
                  type="text"
                  class="form-control"
                  autocomplete="off"
                  :required="!noUsername"
                  @change.once="onceChange"
                />
                <button
                  class="btn btn-outline-info"
                  type="button"
                  data-bs-toggle="tooltip"
                  tabindex="-1"
                  data-bs-placement="bottom"
                  data-bs-trigger="hover"
                  :data-bs-title="i18n.t('ui.text.copyUsername')"
                  v-bs
                  @click="copyToast(userRef, i18n.t('ui.action.usernameCopied'))"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <div id="usernameValidation" class="invalid-feedback"></div>
              </div>
              <div class="form-text visually-hidden" id="usernameHelp">{{ i18n.t('auth.usernameHelp') }}</div>
              <div class="form-check form-switch ms-2 mb-3">
                <input
                  v-model="noUsername"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="usernameSwitch"
                  tabindex="-1"
                />
                <label class="form-check-label" for="usernameSwitch">{{ i18n.t('auth.noUsername') }}</label>
              </div>

              <label for="password" class="form-label" :class="compact ? 'visually-hidden' : ''"
                ><i class="fa-solid fa-key me-2"></i> {{ i18n.t('ui.text.password') }}</label
              >
              <div class="input-group has-validation col-12 mb-3">
                <input
                  v-model="passRef"
                  ref="passwordEl"
                  id="password"
                  :placeholder="i18n.t('auth.passwordPlaceholder')"
                  aria-describedby="passwordHelp passwordValidation"
                  :type="passwordShown ? 'text' : 'password'"
                  class="form-control"
                  autocomplete="off"
                  required
                  @change.once="onceChange"
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
                  :data-bs-title="i18n.t('ui.text.showHidePassword')"
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
                  data-bs-placement="bottom"
                  data-bs-trigger="hover"
                  :data-bs-title="i18n.t('ui.text.copyPassword')"
                  v-bs
                  @click="copyToast(passRef, i18n.t('ui.action.passwordCopied'))"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <div id="passwordValidation" class="invalid-feedback"></div>
              </div>
              <div class="form-text visually-hidden" id="passwordHelp">{{ i18n.t('auth.passwordHelp') }}</div>
            </form>

            <div v-if="showAlert" class="alert alert-warning text-center p-2 mb-2" role="alert">
              {{ i18n.t('ui.text.unsavedChanges') }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="submit" form="edit-form" class="btn btn-success me-auto">
              <i :class="isAdding ? 'fa-solid fa-square-plus' : 'fa-regular fa-floppy-disk me-2'"></i>
              {{ isAdding ? i18n.t('ui.action.add') : i18n.t('ui.action.save') }}
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
