<script setup lang="ts">
import { useOptions } from '@/composables/useOptions.ts'
import FormSwitch from '@/components/FormSwitch.vue'

withDefaults(
  defineProps<{
    compact?: boolean
    show?: string[]
    switches?: string[]
  }>(),
  {
    compact: false,
    show: () => ['switches'],
    switches: () => ['tempDisabled', 'ignoreProxy', 'defaultSave', 'confirmDelete', 'contextMenu', 'showUpdate'],
  },
)

const options = useOptions()
</script>

<template>
  <form>
    <!-- switches -->
    <div v-if="show.includes('switches')" class="row m-0">
      <template v-for="id in switches" :key="id">
        <FormSwitch :id="id" v-model="options[id]" />
      </template>
    </div>
  </form>
</template>

<!--<style scoped></style>-->
