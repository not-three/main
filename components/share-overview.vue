<template>
  <yes-no
    title="Are you sure?"
    :message="warning"
    :visible="showWarning && !allowSSD"
    @yes="allowSSD = true"
    @no="showWarning = false"
  />
  <dialog
    ref="dialog"
    class="backdrop:backdrop-blur-sm"
    :class="{
      'transition-opacity backdrop:transition-all duration-200 backdrop:duration-200': Math.abs(transitioning) > 0,
      'opacity-0 backdrop:backdrop-blur-none': transitioning < -1,
      'opacity-100 backdrop:backdrop-blur': transitioning > 1,
    }"
    @transitionend="endTransition"
  >
    <div class="bg-black border-white border-2 p-4 text-white max-w-2xl">
      <h1 class="text-2xl">Share</h1>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 my-4">
        <div class="bg-white/10 p-2">
          <h2 class="text-lg">Client Side Decryption</h2>
          <div v-for="(val, key) in shareUrls.csd" :key="key">
            <label class="block mt-4">{{ key }}</label>
            <textarea
              :value="val"
              class="w-full bg-black text-white border-white border-2 p-1 mt-2 resize-none"
              @click="handleOnClick"
              readonly
            />
          </div>
        </div>
        <div class="bg-white/10 p-2">
          <h2 class="text-lg">Server Side Decryption</h2>
          <div v-for="(val, key) in shareUrls.ssd" :key="key">
            <label class="block mt-4">{{ key }}</label>
            <div class="relative">
              <textarea
                :value="val"
                class="w-full bg-black text-white border-white border-2 p-1 mt-2 resize-none transition-all duration-300"
                @click="handleOnClick"
                readonly
              />
              <div v-if="!allowSSD" class="share-overview-warning" @click="showWarning = true">
                <p class="text-red-400 font-bold">Server Side Decryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-[1fr,auto] items-end gap-4 mt-4">
        <div class="select-none">
          <input v-model="showAlways" id="share-overview-checkbox" type="checkbox">
          <label for="share-overview-checkbox">&nbsp;Always show this dialog after saving</label>
        </div>
        <button class="share-overview-button" @click="$emit('close')">
          Close
        </button>
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import type { LanguageInfo } from '~/lib/monaco/types';
import { generateShare, WARNING, type ShareUrlData } from '~/lib/share';

const dialog = ref() as any as Ref<HTMLDialogElement>;
const emits = defineEmits(['close', 'update-show-always']);
const transitioning = ref(0);
const allowSSD = ref(false);
const showWarning = ref(false);
const warning = WARNING
const props = defineProps<{
  visible: boolean;
  hideCheckbox?: boolean;
  loadedLanguages: LanguageInfo[];
  detectedLanguage: string;
  currentLanguage: string | null;
  config: any;
}>();

const shareUrls = computed<ShareUrlData>(() => {
  const { app } = useRuntimeConfig();
  const { params } = useRoute();
  const extension = props.loadedLanguages.find(
    (lang) =>lang.id === (props.currentLanguage ?? props.detectedLanguage)
  )?.extensions[0] ?? 'txt';
  return generateShare(props.config.baseURL || '/', app.baseURL, params.id+'', extension);
})

const showAlways = computed({
  get: () => localStorage.getItem('showShareOnNewAlways') !== 'false',
  set: (value) => {
    localStorage.setItem('showShareOnNewAlways', value ? 'true' : 'false')
    emits('update-show-always', value)
  }
});

function handleOnClick(event: MouseEvent) {
  if (event.target instanceof HTMLTextAreaElement) {
    event.target.select()
    const val = event.target.value
    navigator.clipboard.writeText(val)
  }
}

watch(() => props.visible, (value) => {
  if (value) {
    transitioning.value = 1
    dialog.value.showModal()
    window.requestAnimationFrame(() => {
      transitioning.value = 2
    });
  } else {
    transitioning.value = -1
    window.requestAnimationFrame(() => {
      transitioning.value = -2
    });
  }
})
function endTransition() {
  if (transitioning.value < 0) {
    dialog.value.close()
  }
  transitioning.value = 0
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.visible) return
  switch (event.key) {
    case 'Escape':
      emits('close')
      event.preventDefault()
      event.stopImmediatePropagation()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
.share-overview-button {
  @apply bg-white px-2 py-1 transition-colors border-white border-2 text-black;
  @apply hover:bg-black hover:text-white;
}
.share-overview-warning {
  @apply absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100;
  @apply transition-opacity -m-1.5 p-2 backdrop-blur-sm select-none cursor-pointer;
}
</style>
