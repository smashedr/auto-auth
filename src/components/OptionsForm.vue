<script setup lang="ts">
import { useOptions } from '@/composables/useOptions.ts'
import FormSwitch from '@/components/FormSwitch.vue'
import BackgroundForm from '@/components/BackgroundForm.vue'

withDefaults(
  defineProps<{
    compact?: boolean // NOTE: Not Used
    show?: string[]
    switches?: string[]
  }>(),
  {
    compact: false,
    show: () => ['switches', 'background'],
    switches: () => ['tempDisabled', 'ignoreProxy', 'defaultSave', 'confirmDelete', 'contextMenu', 'showUpdate'],
  },
)

const options = useOptions()
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <div v-if="show.includes('switches')" class="row m-0">
      <form class="p-0">
        <template v-for="id in switches" :key="id">
          <FormSwitch :id="id" v-model="options[id]" />
        </template>
      </form>
    </div>
    <div v-if="show.includes('background')" class="row m-0">
      <h6>Auth Page Background</h6>
      <BackgroundForm />
    </div>
  </div>
</template>

<!--<style scoped></style>-->
