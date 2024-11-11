<template>
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
    <div class="bg-black border-white border-2 p-4 text-white max-w-xl">
      <h1 class="text-xl">Copy Manually</h1>
      <p class="text-xs text-white/60 font-semibold my-2">
        We detected that you clicked the second time on share.
        As some browsers do not allow us to copy text to the clipboard automatically,
        we have prepared a text box for you to copy the value manually.
      </p>
      <textarea
        class="w-full h-24 bg-black text-white border-white border p-2 mt-2 resize-none"
        readonly
        @click="($event.target as HTMLTextAreaElement).select()"
      >{{ props.content }}</textarea>
      <div class="grid grid-cols-[1fr,auto] items-end gap-4 mt-4">
        <div class="select-none">
          <input v-model="showAlways" id="share-dialog-checkbox" type="checkbox">
          <label for="share-dialog-checkbox">&nbsp;Always show this dialog</label>
        </div>
        <button class="share-dialog-button" @click="$emit('close')">
          Close
        </button>
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
const dialog = ref() as any as Ref<HTMLDialogElement>;
const transitioning = ref(0);
const props = defineProps<{
  visible: boolean;
  content: string;
}>();
const emits = defineEmits(['close', 'update-show-always']);
const showAlways = computed({
  get: () => localStorage.getItem('showShareDialogAlways') === 'true',
  set: (value) => {
    localStorage.setItem('showShareDialogAlways', value ? 'true' : 'false')
    emits('update-show-always', value)
  }
});
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
.share-dialog-button {
  @apply bg-white px-2 py-1 transition-colors border-white border-2 text-black;
  @apply hover:bg-black hover:text-white;
}
</style>
