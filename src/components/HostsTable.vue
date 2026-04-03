<script setup lang="ts">
import { submitHost } from '@/utils/index.ts'
import { showToast } from '@/composables/useToast.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { useHosts } from '@/composables/useHosts.ts'
import { Hosts } from '@/utils/hosts.ts'
import DeleteModal from '@/components/DeleteModal.vue'
import HostModal from '@/components/HostModal.vue'
import ImportText from '@/components/ImportText.vue'
import ImportExport from '@/components/ImportExport.vue'

const options = useOptions()
const hosts = useHosts()

const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)
const hostModal = ref<InstanceType<typeof HostModal> | null>(null)

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
    showToast(`Removed: ${host}`, 'success')
  } catch (e) {
    if (e instanceof Error) showToast(`Delete Host Error: ${e.message}`, 'danger')
  }
}
</script>

<template>
  <div class="d-flex gap-2 my-2">
    <!--TODO: Add prop to make optional or make a component-->
    <button class="btn btn-success" @click="hostModal?.show()">
      <i class="fa-solid fa-table-cells-row-lock me-2"></i> Add Credentials
    </button>

    <!--TODO: Add prop to make optional-->
    <ImportText />
  </div>

  <!--TODO: Add prop to make optional-->
  <ImportExport class="my-2" />

  <div class="rounded rounded-3 overflow-hidden">
    <table id="history-table" class="table table-sm table-hover transparent-table" style="table-layout: fixed">
      <thead>
        <tr>
          <th class="text-center" style="width: 36px"><i class="fa-solid fa-trash-can"></i></th>
          <th>{{ i18n.t('ui.text.hostname') }}</th>
          <th>{{ i18n.t('ui.text.username') }}</th>
          <th class="text-center" style="width: 36px"><i class="fa-solid fa-pen-to-square"></i></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(creds, host) of hosts" :key="host">
          <td class="text-center">
            <!--@click="showDeleteModal(loc.id?.toString() ?? '')"-->
            <a :title="i18n.t('ui.action.delete')" class="link-danger" role="button" @click.prevent="deleteClick(host)"
              ><i class="fa-regular fa-trash-can"></i
            ></a>
          </td>
          <td class="text-truncate">{{ host }}</td>
          <td class="text-truncate">{{ creds }}</td>
          <td class="text-center">
            <!--@click="showDeleteModal(loc.id?.toString() ?? '')"-->
            <a
              :title="i18n.t('ui.action.edit')"
              class="link-warning"
              role="button"
              @click.prevent="hostModal?.show(host, creds)"
              ><i class="fa-solid fa-pen-to-square"></i
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <DeleteModal ref="deleteModal" @delete="deleteHost" />
  <HostModal ref="hostModal" @submit="submitHost" />
</template>

<!--<style scoped></style>-->
