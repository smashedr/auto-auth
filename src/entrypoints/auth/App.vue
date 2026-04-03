<script setup lang="ts">
import { i18n } from '#imports'
import { onMounted, ref } from 'vue'
import { copyToast } from '@/utils/index.ts'
import { openOptions } from '@/utils/extension.ts'
import { getSession } from '@/utils/options.ts'
import { useOptions } from '@/composables/useOptions.ts'
import ToastAlerts from '@/components/ToastAlerts.vue'
import BackToTop from '@/components/BackToTop.vue'
import OptionsOffscreen from '@/components/OptionsOffscreen.vue'

console.debug('%c auth/App.vue', 'color: SpringGreen')

const options = useOptions()

const userRef = ref('')
const passRef = ref('')
const hostRef = ref('')
const hrefRef = ref('')

const saveCreds = ref(false)
const hasSavedCreds = ref(false)
const isFailure = ref(false)
const userRequired = ref(true)

const passwordShown = ref(false)
const usernameEl = ref<HTMLInputElement | null>(null)
const passwordEl = ref<HTMLInputElement | null>(null)

const ignoreModal = ref<HTMLElement | null>(null)

watch(
  options,
  (opts) => {
    // NOTE: This needs to be combined with the tempSave logic below
    console.log('auth/App.vue %c watch: options:', 'color: OrangeRed', opts)
    setBackground(opts)

    if (saveCreds.value) return
    // NOTE: This needs to be combined with the watch logic above
    const tempSave = sessionStorage.getItem(hostRef.value)
    console.log('tempSave:', tempSave)
    if (tempSave) {
      console.log('%c SETTING SAVED VALUE', 'color: Yellow')
      saveCreds.value = !!Number.parseInt(tempSave)
    } else {
      console.log('%c SETTING OPTIONS VALUE', 'color: Lime')
      saveCreds.value = opts.defaultSave
    }
    if (!saveCreds.value) {
      console.log('RALF BROKE IT')
      // document.getElementById('save-session').classList.remove('d-none')
      // if (creds) {
      //   document.getElementById('temp-alert').classList.remove('d-none')
      // }
    }
  },
  { once: true },
)

function saveCredsChange(event: Event) {
  console.debug('saveCredsChange:', event)
  sessionStorage.setItem(hostRef.value, saveCreds.value ? '1' : '0')
}

async function submitAuth(event: Event) {
  console.debug('submitAuth:', event)
  // event.submitter.classList.add('disabled')
  // document.getElementById('icon').className = 'fa-solid fa-sync fa-spin ms-2'

  console.debug('hostRef.value:', hostRef.value)
  console.debug('userRef.value:', userRef.value)
  console.debug('passRef.value:', passRef.value)

  console.debug('options.value.defaultSave:', options.value.defaultSave)
  console.debug('saveCreds.value:', saveCreds.value)

  if (saveCreds.value) {
    await Hosts.set(hostRef.value, `${userRef.value}:${passRef.value}`)
    console.log('%cCredentials Saved.', 'color: LimeGreen', `Loading: ${hrefRef.value}`)
  } else {
    const session = await getSession()
    console.log('session:', session)

    session[hostRef.value] = `${userRef.value}:${passRef.value}`
    console.log('session:', session)
    await chrome.storage.session.set({ session })
    console.log('%cCredentials Saved for Session Only.', 'color: SpringGreen', `Loading: ${hrefRef.value}`)
  }
  const tab = await chrome.tabs.getCurrent()
  console.debug('tab:', tab)
  if (!tab?.id) return console.error('no tab.id') // NOTE: HANDLE ERROR
  await chrome.tabs.update(tab.id, { url: hrefRef.value })
}

async function ignoreHost(_event: Event) {
  console.debug('ignoreHost:', hostRef.value)
  await Hosts.set(hostRef.value, 'ignored')

  // document.body.remove() // NOTE: Determine why this was called...
  const tab = await chrome.tabs.getCurrent()
  console.debug('tab:', tab)
  if (!tab?.id) return console.error('no tab.id') // NOTE: HANDLE ERROR
  await chrome.tabs.update(tab.id, { url: hrefRef.value })
}

// function showHidePassword(el: HTMLInputElement | null) {
//   console.debug('showHidePassword:', el)
//   if (!el) return
//   el.type = el.type === 'password' ? 'text' : 'password'
//   passwordShown.value = !passwordShown.value
// }

// function showModal() {
//   if (!ignoreModal.value) return console.error('no ignoreModal') // NOTE: HANDLE ERROR
//   Modal.getOrCreateInstance(ignoreModal.value).show()
// }

function setBackground(options: Options) {
  // NOTE: Copied from VanillaJS. Refactor this method...
  console.log('setBackground:', options.radioBackground)
  const video = document.querySelector('video')
  console.log('video:', video)
  if (!video) return console.error('no video element') // NOTE: Handle Error

  if (options.radioBackground === 'bgPicture') {
    const url = options.pictureURL || 'https://picsum.photos/1920/1080'
    document.body.style.background = `url('${url}') no-repeat center fixed`
    document.body.style.backgroundSize = 'cover'
    video.classList.add('d-none')
  } else if (options.radioBackground === 'bgVideo') {
    video.src = options.videoURL
    video.classList.remove('d-none')
    document.body.style.cssText = ''
  } else {
    document.body.style.cssText = ''
    video.classList.add('d-none')
  }
}

// watch(
//   options,
//   (opts) => {
//     console.log('auth/App.vue %c watch2: options:', 'color: Yellow', opts)
//   },
//   { deep: true },
// )

function onChanged(changes: object) {
  // NOTE: Copied, add a re-usable watchOptions function...
  console.log('auth/App.vue - onChanged:', changes)
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === 'options' && oldValue && newValue) {
      if (
        oldValue.radioBackground !== newValue.radioBackground ||
        oldValue.pictureURL !== newValue.pictureURL ||
        oldValue.videoURL !== newValue.videoURL
      ) {
        console.log('%c Background Option Change', 'color: Yellow', newValue.radioBackground)
        setBackground(newValue)
      }
    }
  }
}

if (!chrome.storage.sync.onChanged.hasListener(onChanged)) {
  chrome.storage.sync.onChanged.addListener(onChanged)
}

// const manifest = chrome.runtime.getManifest()
// console.debug('manifest:', manifest)
const config = getAppConfig()
console.log('config:', config)

onMounted(async () => {
  // NOTE: Copied from VanillaJS...
  const searchParams = new URLSearchParams(window.location.search)
  const fail = searchParams.get('fail')
  console.log('fail:', fail)
  isFailure.value = !!fail
  console.log('isFailure.value:', isFailure.value)
  const urlParam = searchParams.get('url')
  console.log('urlParam:', urlParam)
  if (!urlParam) return

  const url = new URL(urlParam)
  console.log('url:', url)
  hostRef.value = url.host
  hrefRef.value = url.href

  document.title = `${i18n.t('auth.loginFor')} ${hostRef.value}`

  const creds = await Hosts.get(hostRef.value)
  console.log('creds:', creds)

  const session = await getSession()
  console.log('session:', session)

  if (creds) {
    console.log('if creds:', creds)
    hasSavedCreds.value = true
    if (creds !== 'ignored') {
      const [username, password] = creds.split(':')
      userRef.value = username
      console.log('usernameEl.value:', usernameEl.value)
      await nextTick()
      usernameEl.value?.select()
      passRef.value = password
    }
  } else if (hostRef.value in session) {
    console.log('else hostRef.value in session:', hostRef.value)
    const [username, password] = session[hostRef.value].split(':')
    userRef.value = username
    console.log('usernameEl.value:', usernameEl.value)
    await nextTick()
    usernameEl.value?.select()
    passRef.value = password
  }

  const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]')
  console.debug('link:', link)
  if (!link) return
  link.href = `${url.origin}/favicon.ico`
  console.debug('link.href:', link.href)
})
</script>

<template>
  <main class="flex-grow-1 overflow-auto">
    <div class="container-fluid pt-3 px-0 px-sm-4">
      <div id="auth-outer" class="rounded rounded-4 w-100 mx-auto mb-4 p-3">
        <div class="text-center fs-4">
          <kbd class="text-ellipsis host" role="button" @click="copyToast(hostRef, 'Hostname Copied to Clipboard.')">{{
            hostRef
          }}</kbd>
        </div>
        <div class="text-center mb-2">
          <i class="fa-regular fa-copy me-2" role="button" @click="copyToast(hrefRef, 'URL Copied to Clipboard.')"> </i
          ><a id="link" class="text-break" :href="hrefRef" target="_blank" rel="noopener">{{ hrefRef }}</a>
        </div>

        <div v-if="isFailure" id="fail" class="alert alert-warning text-center p-2 mb-2" role="alert">
          <b>Authentication Failed.</b> Please Try Again...
        </div>

        <form id="auth-form" class="mb-3" autocomplete="off" @submit.prevent="submitAuth">
          <label for="username" class="form-label"><i class="fa-solid fa-user me-2"></i> Username</label>
          <div class="input-group input-group-lg col-12">
            <input
              v-model="userRef"
              ref="usernameEl"
              id="username"
              placeholder="username"
              aria-describedby="usernameHelp"
              type="text"
              class="form-control"
              autocomplete="off"
              :required="userRequired"
              autofocus
            />
            <!--<button class="btn btn-outline-info" type="button" data-bs-toggle="tooltip" tabindex="-1" data-paste-input="#username"-->
            <!--        data-bs-placement="bottom" data-bs-trigger="hover" data-bs-title="Paste Username">-->
            <!--    <i class="fa-regular fa-paste"></i>-->
            <!--</button>-->
          </div>
          <div class="form-text ms-2" id="usernameHelp">Basic Authentication Username.</div>
          <div class="form-check form-switch ms-2 mb-3">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              id="usernameSwitch"
              tabindex="-1"
              @change="() => (userRequired = !userRequired)"
            />
            <label class="form-check-label" for="usernameSwitch">No Username</label>
          </div>

          <label for="password" class="form-label"><i class="fa-solid fa-key me-2"></i> Password</label>
          <div class="input-group input-group-lg col-12">
            <input
              v-model="passRef"
              ref="passwordEl"
              id="password"
              placeholder="password"
              aria-describedby="passwordHelp"
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
              data-class-on="btn-outline-warning"
              data-class-off="btn-outline-success"
              @click.prevent="() => (passwordShown = !passwordShown)"
            >
              <i class="fa-regular fa-eye"></i>
            </button>
            <!--<button id="passwordCopy" class="btn btn-outline-info" type="button" tabindex="-1" data-paste-input="#password"-->
            <!--        data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-trigger="hover" data-bs-title="Paste Password">-->
            <!--    <i class="fa-regular fa-paste"></i>-->
            <!--</button>-->
          </div>
          <div class="form-text ms-2 mb-3" id="passwordHelp">Basic Authentication Password.</div>

          <div class="form-check form-switch fs-4 mb-3">
            <input
              v-model="saveCreds"
              class="form-check-input"
              type="checkbox"
              role="switch"
              id="saveCreds"
              name="saveCreds"
              @change="saveCredsChange"
            />
            <label class="form-check-label" for="saveCreds">Save Login</label>
            <span v-if="!saveCreds" id="save-session" class="text-warning-emphasis fs-6 ms-2">
              <i class="fa-solid fa-triangle-exclamation me-1"></i>
              Credentials will not be saved!
            </span>
          </div>

          <div v-if="!saveCreds && hasSavedCreds" id="temp-alert" class="alert alert-warning p-2">
            Credentials are already saved for this host and temporary credentials <b>will have no effect</b>!
            <br />
            Until this is fixed you can enable <b>Save Login</b> or
            <a class="alert-link" href="/options.html" @click.prevent="openOptions()">delete the saved credentials</a>.
          </div>

          <div class="row">
            <div class="col-12 col-sm-6 mb-2 mb-sm-0">
              <button class="btn btn-lg btn-success w-100" type="submit">
                Login
                <i id="icon" class="fa-solid fa-right-to-bracket ms-2"></i>
              </button>
            </div>
            <div class="col-12 col-sm-6">
              <button
                class="btn btn-lg btn-outline-warning w-100"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#ignore-modal"
              >
                Ignore Host
                <i class="fa-solid fa-ban ms-2"></i>
              </button>
            </div>
          </div>
        </form>
        <!-- auth-form -->

        <hr />

        <div class="text-center">
          <a
            class="link-body-emphasis text-decoration-none d-inline-block"
            href="/options.html"
            @click.prevent="openOptions()"
            >{{ i18n.t('ctx.openOptions') }}</a
          >
          <span class="mx-2">&bull;</span>
          <a
            class="link-body-emphasis text-decoration-none d-inline-block"
            target="_blank"
            rel="noopener"
            :href="`${config.githubUrl}?tab=readme-ov-file#support`"
            >{{ i18n.t('auth.getSupport') }}</a
          >
        </div>
      </div>
      <!-- auth-outer -->
    </div>
  </main>

  <div
    ref="ignoreModal"
    id="ignore-modal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="ignore-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="ignore-modal-label">Confirm Ignore Host</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" tabindex="-1"></button>
        </div>
        <div class="modal-body">
          <p>Ignore host and remove any saved credentials?</p>
          <p class="text-center">
            <kbd class="ms-2">{{ hostRef }}</kbd>
          </p>
          <p class="mb-0">
            Ignored hosts can be removed from the
            <a href="/options.html" @click.prevent="openOptions()">Options Page</a>.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-warning me-auto" @click.prevent="ignoreHost">Confirm Ignore</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <OptionsOffscreen />

  <ToastAlerts />
  <BackToTop />
</template>

<!--<style scoped></style>-->
