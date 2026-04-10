<script setup lang="ts">
import { ref } from 'vue'
import { submitHost } from '@/utils/index.ts'
import { parseCreds } from '@/utils/creds.ts'
import { saveKeyValue } from '@/utils/options.ts'
import { showToast } from '@/composables/useToast.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { useHosts } from '@/composables/useHosts.ts'
import { Hosts, validateHostname } from '@/utils/hosts.ts'
import DeleteModal from '@/components/DeleteModal.vue'
import HostModal from '@/components/HostModal.vue'
import ImportExport from '@/components/ImportExport.vue'
import InputCell from '@/components/InputCell.vue'

withDefaults(
  defineProps<{
    showImport?: boolean
  }>(),
  {
    showImport: true,
  },
)

const options = useOptions()
const hosts = useHosts()

const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)
const hostModal = ref<InstanceType<typeof HostModal> | null>(null)

const computedHosts = computed(() =>
  Object.entries(hosts.value).map(([host, creds]) => {
    const [user, pass] = parseCreds(creds)
    return { host, creds, user, pass }
  }),
)

// DUPLICATION: popup/App.vue
function deleteClick(host: string) {
  console.log('HostsTable.vue - deleteClick:', host)
  if (options.value.confirmDelete) {
    deleteModal.value?.show(host)
  } else {
    deleteHost(host)
  }
}

// DUPLICATION: popup/App.vue
async function deleteHost(host: string) {
  console.log('HostsTable.vue - deleteHost:', host)
  const creds = hosts.value[host]
  console.log('creds:', creds) // NOTE: Check if validation is needed...
  try {
    await Hosts.delete(host)
    showToast(`${i18n.t('ui.text.removed')}: ${host}`, 'success')
  } catch (e) {
    if (e instanceof Error) showToast(`${i18n.t('ui.text.deleteHostError')}: ${e.message}`, 'danger')
  }
}

function onEdit(host: string, field: string, value: string) {
  console.log('HostsTable.vue - onEdit:', host, field, value)
  const creds = hosts.value[host]
  console.log('creds:', creds)
  if (!creds) return showToast('Credentials Not Found.', 'warning')
  const [username, password] = parseCreds(creds)
  console.log('username, password:', username, password)
  switch (field) {
    case 'host': {
      if (!value) return showToast('Hostname is Required.', 'warning')
      const hostname = validateHostname(value)
      if (!hostname) return showToast('Invalid Hostname.', 'warning')
      submitHost(hostname, username, password, host)
      break
    }
    case 'user': {
      submitHost(host, value, password, host)
      break
    }
    case 'pass': {
      if (!value) return showToast('Password is Required.', 'warning')
      submitHost(host, username, value, host)
      break
    }
    default: {
      showToast(`Unknown Field: ${field}`, 'warning')
    }
  }
}

function columnsChange(event: Event) {
  console.debug('HostsTable.vue - columnsChange:', event)
  const target = event.target as HTMLInputElement
  console.debug('target.id:', target.id)
  console.debug('target.checked:', target.checked)
  saveKeyValue(target.id, target.checked)
}
</script>

<template>
  <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
    <ImportExport v-if="showImport" />

    <div class="dropdown ms-sm-auto mt-2 mt-sm-0">
      <a
        role="button"
        class="link-body-emphasis text-decoration-none d-inline-block"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        data-bs-auto-close="outside"
      >
        <i class="fa-solid fa-table-columns"></i> Columns
      </a>

      <div class="dropdown-menu dropstart">
        <form class="px-2" @change="columnsChange">
          <div class="form-check">
            <input v-model="options.usernameShown" type="checkbox" class="form-check-input" id="usernameShown" />
            <label class="form-check-label text-nowrap" for="usernameShown"> Username </label>
          </div>
          <div class="form-check ms-4">
            <input v-model="options.usernameVisible" type="checkbox" class="form-check-input" id="usernameVisible" />
            <label class="form-check-label text-nowrap" for="usernameVisible"> Visible </label>
          </div>
          <div class="form-check">
            <input v-model="options.passwordShown" type="checkbox" class="form-check-input" id="passwordShown" />
            <label class="form-check-label text-nowrap" for="passwordShown"> Password </label>
          </div>
          <div class="form-check ms-4">
            <input v-model="options.passwordVisible" type="checkbox" class="form-check-input" id="passwordVisible" />
            <label class="form-check-label text-nowrap" for="passwordVisible"> Visible </label>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div class="rounded rounded-3 overflow-hidden">
    <table id="history-table" class="table table-sm table-hover transparent-table" style="table-layout: fixed">
      <thead>
        <tr>
          <th class="text-center" style="width: 36px"><i class="fa-solid fa-trash-can"></i></th>
          <th class="text-truncate">{{ i18n.t('ui.text.hostname') }}</th>
          <th v-if="options.usernameShown" class="text-truncate">{{ i18n.t('ui.text.username') }}</th>
          <th v-if="options.passwordShown" class="text-truncate">Password</th>
          <th class="text-center" style="width: 36px"><i class="fa-solid fa-pen-to-square"></i></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ host, creds, user, pass } in computedHosts" :key="host">
          <!-- Delete -->
          <td class="text-center">
            <a :title="i18n.t('ui.action.delete')" class="link-danger" role="button" @click.prevent="deleteClick(host)"
              ><i class="fa-regular fa-trash-can"></i
            ></a>
          </td>

          <!-- Host -->
          <InputCell :host="host" field="host" :value="host" :visible="true" @edit="onEdit" />

          <!-- User -->
          <template v-if="options.usernameShown">
            <td v-if="creds === 'ignored'" class="text-truncate text-warning fst-italic fw-bold">
              {{ i18n.t('ui.text.ignored') }}
            </td>
            <InputCell
              v-else
              :host="host"
              field="user"
              :value="user"
              empty="None"
              :visible="options.usernameVisible"
              @edit="onEdit"
            />
          </template>
          <InputCell
            v-if="options.passwordShown"
            :host="host"
            field="pass"
            :value="pass"
            :visible="options.passwordVisible"
            @edit="onEdit"
          />

          <!-- Edit -->
          <td class="text-center">
            <a
              :title="i18n.t('ui.action.edit')"
              class="link-warning"
              role="button"
              @click.prevent="hostModal?.show(host, creds)"
              ><i class="fa-solid fa-pen-to-square"></i
            ></a>
          </td>
        </tr>

        <tr v-if="!computedHosts.length">
          <td class="text-center text-warning-emphasis fst-italic" colspan="4">
            {{ i18n.t('ui.text.noSavedCreds') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <DeleteModal ref="deleteModal" @delete="deleteHost" />
  <HostModal ref="hostModal" @submit="submitHost" />
</template>

<!--<style scoped></style>-->
