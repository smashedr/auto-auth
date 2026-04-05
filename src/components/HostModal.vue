<script setup lang="ts">
import { i18n } from '#imports'
import { onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'
import { copyToast, parseCreds } from '@/utils/index.ts'

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

const hostInvalid = ref('')
const passInvalid = ref('')

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
    const [username, password] = parseCreds(creds)
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

function validateHostname(): string | undefined {
  let value = hostRef.value
  console.debug('value1:', value)
  if (!value.includes('://')) {
    value = `https://${value}`
  }
  console.debug('value2:', value)
  let url
  try {
    url = new URL(value)
  } catch (e) {
    console.debug(e)
    hostInvalid.value = 'Invalid Hostname or URL.'
    return
  }
  console.log(`url.hostname: "${url.hostname}"`, url)
  return url.hostname
}

async function onSubmit() {
  console.log('HostModal.vue - onSubmit:', hostRef.value, userRef.value, passRef.value, originalHost.value)

  // hostname
  const hostname = validateHostname()
  if (!hostname) {
    hostnameEl.value?.focus()
    hostnameEl.value?.select()
    hostInvalid.value = 'Invalid Hostname or URL.'
    return
  }
  hostRef.value = hostname

  // existing
  if (isAdding.value) {
    const existing = await Hosts.get(hostRef.value)
    console.debug('existing:', existing)
    if (existing) {
      console.debug('Existing Host:', hostRef.value)
      hostnameEl.value?.focus()
      hostnameEl.value?.select()
      hostInvalid.value = 'Hostname Already Exists. Edit or Delete First.'
      return
    }
  }

  // username
  console.log('username:', userRef.value)
  // NOTE: Consider validating username as a convince to the user...

  // password
  console.log('password:', passRef.value)
  if (!passRef.value) {
    console.debug('No password')
    passwordEl.value?.focus()
    passInvalid.value = 'Password Required.'
    return
  }

  console.log('Adding Host:', hostRef.value)
  emit('submit', hostRef.value, userRef.value, passRef.value, originalHost.value)
  hide()
}

function hostnameChange() {
  console.log('HostModal.vue - hostnameChange')
  onceChange()
  validateHostname()
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
    hostInvalid.value = ''
    passInvalid.value = ''
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
            <h1 class="modal-title fs-5" id="edit-modal-label">
              {{ isAdding ? i18n.t('ui.action.add') : i18n.t('ui.action.edit') }} {{ i18n.t('ui.text.host') }}
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              :aria-label="i18n.t('ui.action.close')"
              tabindex="-1"
            ></button>
          </div>
          <div class="modal-body">
            <form id="edit-form" name="edit-form" class="mb-3" autocomplete="off" @submit.prevent="onSubmit">
              <label for="hostname" class="form-label" :class="{ 'visually-hidden': compact }"
                ><i class="fa-solid fa-globe me-2"></i> {{ i18n.t('ui.text.hostname') }}</label
              >
              <div class="input-group has-validation col-12 mb-3">
                <input
                  v-model="hostRef"
                  ref="hostnameEl"
                  id="hostname"
                  :placeholder="i18n.t('form.host.hostnamePlaceholder')"
                  aria-describedby="hostnameHelp hostnameValidation"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': hostInvalid }"
                  autocomplete="off"
                  required
                  @input="hostInvalid = ''"
                  @change="hostnameChange"
                />
                <button
                  class="btn btn-outline-info"
                  type="button"
                  data-bs-toggle="tooltip"
                  tabindex="-1"
                  data-bs-placement="bottom"
                  data-bs-trigger="hover"
                  :data-bs-title="i18n.t('ui.text.copyHostname')"
                  @click="copyToast(hostRef, i18n.t('ui.action.hostnameCopied'))"
                  v-bs
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <div id="hostnameValidation" class="invalid-feedback">{{ hostInvalid }}</div>
              </div>
              <div class="form-text visually-hidden" id="hostnameHelp">{{ i18n.t('form.host.hostnameHelp') }}</div>

              <label for="username" class="form-label" :class="{ 'visually-hidden': compact }"
                ><i class="fa-solid fa-user me-2"></i> {{ i18n.t('ui.text.username') }}</label
              >
              <div class="input-group has-validation col-12 mb-3">
                <input
                  v-model="userRef"
                  ref="usernameEl"
                  id="username"
                  :placeholder="i18n.t('form.host.usernamePlaceholder')"
                  aria-describedby="usernameHelp usernameValidation"
                  type="text"
                  class="form-control"
                  autocomplete="off"
                  :required="!noUsername"
                  @change="onceChange"
                />
                <button
                  class="btn btn-outline-info"
                  type="button"
                  data-bs-toggle="tooltip"
                  tabindex="-1"
                  data-bs-placement="bottom"
                  data-bs-trigger="hover"
                  :data-bs-title="i18n.t('ui.text.copyUsername')"
                  @click="copyToast(userRef, i18n.t('ui.action.usernameCopied'))"
                  v-bs
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <div id="usernameValidation" class="invalid-feedback"></div>
              </div>
              <div class="form-text visually-hidden" id="usernameHelp">{{ i18n.t('form.host.usernameHelp') }}</div>
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

              <label for="password" class="form-label" :class="{ 'visually-hidden': compact }"
                ><i class="fa-solid fa-key me-2"></i> {{ i18n.t('ui.text.password') }}</label
              >
              <div class="input-group has-validation col-12 mb-3">
                <input
                  v-model="passRef"
                  ref="passwordEl"
                  id="password"
                  :placeholder="i18n.t('form.host.passwordPlaceholder')"
                  aria-describedby="passwordHelp passwordValidation"
                  :type="passwordShown ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': passInvalid }"
                  autocomplete="off"
                  required
                  @input="passInvalid = ''"
                  @change="onceChange"
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
                  @click.prevent="() => (passwordShown = !passwordShown)"
                  v-bs
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
                  @click="copyToast(passRef, i18n.t('ui.action.passwordCopied'))"
                  v-bs
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <div id="passwordValidation" class="invalid-feedback">{{ passInvalid }}</div>
              </div>
              <div class="form-text visually-hidden" id="passwordHelp">{{ i18n.t('form.host.passwordHelp') }}</div>
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
