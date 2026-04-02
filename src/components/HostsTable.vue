<script setup lang="ts">
import { showToast } from '@/composables/useToast.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { useHosts } from '@/composables/useHosts.ts'
import { Hosts } from '@/utils/hosts.ts'
import DeleteModal from '@/components/DeleteModal.vue'
import HostModal from '@/components/HostModal.vue'

const options = useOptions()
const hosts = useHosts()

const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)
const hostModal = ref<InstanceType<typeof HostModal> | null>(null)

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

// DUPLICATION: popup/App.vue
async function submitHost(original: string | false, host: string, user: string, pass: string) {
  console.log('HostsTable.vue - submitHost:', original, host, user, pass)
  try {
    // NOTE: Update Hosts.set to handle this logic...
    if (original === false) {
      await Hosts.set(host, `${user}:${pass}`)
    } else {
      await Hosts.edit(original, host, `${user}:${pass}`)
    }

    showToast(`Add/Edited: ${host}`, 'success')
  } catch (e) {
    if (e instanceof Error) showToast(`Add/Edit Error: ${e.message}`, 'danger')
  }
}
</script>

<template>
  <button class="btn btn-success" @click="hostModal?.show()">Add Host</button>

  <table id="history-table" class="table table-sm table-striped" style="table-layout: fixed">
    <thead>
      <tr>
        <th class="text-center" style="width: 36px"><i class="fa-solid fa-trash-can"></i></th>
        <th>Host</th>
        <th>Username</th>
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
        <td class="">{{ host }}</td>
        <td class="">{{ creds }}</td>
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

  <DeleteModal ref="deleteModal" @delete="deleteHost" />
  <HostModal ref="hostModal" @submit="submitHost" />
</template>

<!--<style scoped></style>-->
