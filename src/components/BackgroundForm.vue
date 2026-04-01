<script setup lang="ts">
import { ref } from 'vue'
import { useOptions } from '@/composables/useOptions.ts'
import { saveKeyValue } from '@/utils/options.ts'

// NOTE: options are not used, use onMounted instead of watch()
const options = useOptions()

const bgRef = ref<'bgNone' | 'bgPicture' | 'bgVideo'>('bgNone')

const pictureURL = ref('')
const videoURL = ref('')

watch(
  options,
  (opts) => {
    console.log('BackgroundForm.vue %c watch: options:', 'color: OrangeRed', opts)
    bgRef.value = options.value.radioBackground
    pictureURL.value = options.value.pictureURL
    videoURL.value = options.value.videoURL
  },
  { once: true },
)

function radioChange(e: Event) {
  console.log('radioChange', e)
  console.log('bgRef', bgRef.value)
  saveKeyValue('radioBackground', bgRef.value)
}
</script>

<template>
  <div>
    <form @change="radioChange">
      <div class="d-flex flex-column flex-sm-row ms-1 ms-sm-3">
        <div class="form-check form-check-inline mb-2 mb-sm-0">
          <input
            class="form-check-input"
            type="radio"
            name="radioBackground"
            id="bgNone"
            value="bgNone"
            v-model="bgRef"
          />
          <label class="form-check-label" for="bgNone"> <i class="fa-regular fa-square"></i> None </label>
        </div>

        <div class="form-check form-check-inline mb-2 mb-sm-0">
          <input
            class="form-check-input"
            type="radio"
            name="radioBackground"
            id="bgPicture"
            value="bgPicture"
            v-model="bgRef"
          />
          <label class="form-check-label" for="bgPicture"> <i class="fa-regular fa-image"></i> Picture </label>
        </div>

        <div class="form-check form-check-inline mb-2">
          <input
            class="form-check-input"
            type="radio"
            name="radioBackground"
            id="bgVideo"
            value="bgVideo"
            v-model="bgRef"
          />
          <label class="form-check-label" for="bgVideo"> <i class="fa-solid fa-video"></i> Video </label>
        </div>
      </div>
    </form>

    <div class="ms-0 ms-sm-3">
      <div v-if="bgRef === 'bgPicture'" id="bgPictureInput" class="input-group">
        <span class="input-group-text" id="picture-addon" data-bs-toggle="tooltip" data-bs-title="URL to a Web Image.">
          <i class="fa-solid fa-circle-info"></i
        ></span>
        <input
          v-model="pictureURL"
          type="text"
          class="form-control"
          placeholder="Background Picture URL"
          aria-label="Background Picture URL"
          id="pictureURL"
          name="pictureURL"
          aria-describedby="picture-addon"
          @change="saveKeyValue('pictureURL', pictureURL)"
        />
      </div>
      <div v-if="bgRef === 'bgVideo'" id="bgVideoInput" class="input-group">
        <span class="input-group-text" id="video-addon" data-bs-toggle="tooltip" data-bs-title="URL to a Web Video.">
          <i class="fa-solid fa-circle-info"></i
        ></span>
        <input
          v-model="videoURL"
          type="text"
          class="form-control"
          placeholder="Background Video URL"
          aria-label="Background Video URL"
          id="videoURL"
          name="videoURL"
          aria-describedby="video-addon"
          @change="saveKeyValue('videoURL', videoURL)"
        />
      </div>
    </div>
  </div>
</template>

<!--<style scoped></style>-->
