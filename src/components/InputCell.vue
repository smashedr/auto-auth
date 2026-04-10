<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  host: string
  field: string
  value: string
  visible?: boolean
  empty?: string
}>()

const emit = defineEmits(['edit'])

const isEditing = ref(false)
const inputValue = ref(props.value)
const inputEl = ref<HTMLInputElement | null>(null)

function startEdit() {
  if (isEditing.value) return
  console.log('startEdit:', inputValue.value)
  inputValue.value = props.value
  isEditing.value = true
  nextTick(() => {
    inputEl.value?.focus()
    inputEl.value?.select()
  })
}

function finishEdit() {
  console.log('finishEdit:', inputValue.value)
  isEditing.value = false
  if (inputValue.value === props.value) return console.log('%c Value Not Changed:', 'color: Yellow', inputValue.value)
  console.log(`Edit: %c${props.field}:`, 'color: Lime', `"${inputValue.value}" / host: ${props.host}`)
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
