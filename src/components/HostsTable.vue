<script setup lang="ts">
import { Hosts } from '@/utils/hosts.ts'
import { onMounted } from 'vue'
import { showToast } from '@/composables/useToast.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { useHosts } from '@/composables/useHosts.ts'
import DeleteModal from '@/components/DeleteModal.vue'
import EditModal from '@/components/EditModal.vue'

const options = useOptions()
const hosts = useHosts()

const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)
const editModal = ref<InstanceType<typeof EditModal> | null>(null)

function deleteClick(host: string) {
  console.log('HostsTable.vue - deleteClick:', host)
  if (options.value.confirmDelete) {
    deleteModal.value?.show(host)
  } else {
    deleteHost(host)
  }
}

async function deleteHost(host: string) {
  console.log('HostsTable.vue - deleteHost:', host)
  console.log('hosts.value:', hosts.value)
  const creds = hosts.value[host]
  console.log('creds:', creds) // NOTE: Handle undefined creds, also, creds are not used
  try {
    await Hosts.delete(host)
    showToast(`Removed: ${host}`, 'success')
  } catch (e) {
    if (e instanceof Error) showToast(`Delete Host Error: ${e.message}`, 'danger')
  }
}

async function editHost(original: string, host: string, user: string, pass: string) {
  console.log('HostsTable.vue - editHost:', original, host, user, pass)
  await Hosts.edit(original, host, `${user}:${pass}`)
  showToast(`Edited: ${host}`, 'success')
}

onMounted(async () => {
  // NOTE: DO NOT USE - use now instead...
  const all = await Hosts.all()
  console.log('all:', all)
  // setTimeout(() => console.log('hosts.value:', hosts.value), 1000)
})
</script>

<template>
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
            @click.prevent="editModal?.show(host, creds)"
            ><i class="fa-solid fa-pen-to-square"></i
          ></a>
        </td>
      </tr>
    </tbody>
  </table>

  <DeleteModal ref="deleteModal" @delete="deleteHost" />
  <EditModal ref="editModal" @edit="editHost" />
</template>

<!--<style scoped></style>-->
