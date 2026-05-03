<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{
  host: string
  field: string
  value: string
  visible?: boolean
  empty?: string
  editable?: boolean
}>()

const emit = defineEmits(['edit'])

const isEditing = ref(false)
const inputValue = ref(props.value)
const inputEl = ref<HTMLInputElement | null>(null)

function startEdit() {
  if (!props.editable) return console.log('%cEditing Disabled', 'color: LightCoral')
  if (isEditing.value) return console.log('%cDuplicate Start Event', 'color: Plum')
  // console.log('%c startEdit:', 'color: Lime', inputValue.value)
  inputValue.value = props.value
  isEditing.value = true
  nextTick(() => {
    inputEl.value?.focus()
    inputEl.value?.select()
  })
}

function finishEdit() {
  // console.log('%c finishEdit:', 'color: Lime', event)
  if (!isEditing.value) return console.log('%cDuplicate Finish Event', 'color: Plum')
  isEditing.value = false
  if (inputValue.value === props.value) return console.log('%cUnchanged:', 'color: Bisque', inputValue.value) // TODO: Logging
  console.log(`%cEdit ${props.field}:`, 'color: Lime', `"${inputValue.value}"`, 'for host:', props.host) // TODO: Logging
  emit('edit', props.host, props.field, inputValue.value)
}
</script>

<template>
  <td class="text-truncate" @click="startEdit">
    <input
      v-if="isEditing"
      v-model="inputValue"
      ref="inputEl"
      :type="visible ? 'text' : 'password'"
      class="form-control form-control-sm table-input"
      @keyup.esc="isEditing = false"
      @keyup.enter="finishEdit"
      @blur="finishEdit"
    />
    <span v-if="!isEditing && visible" :class="value ? '' : 'text-muted fst-italic'">{{ value || empty }}</span>
    <span v-if="!isEditing && !visible">******</span>
  </td>
</template>

<style scoped>
.table-input {
  height: auto !important;
  min-height: 0 !important;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
