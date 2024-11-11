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
    <div class="bg-black border-white border-2 p-4 text-white xl:max-w-[20vw]">
      <h1 class="text-xl">{{ props.title }}</h1>
      <p class="my-4">
        {{ props.message }}
      </p>
      <slot />
      <div class="grid grid-cols-2 gap-2 text-black">
        <button
          @click="emits('yes')"
          class="yes-no-button"
          :class="{ 'col-start-2': props.disableNo }"
        >
          <template v-if="props.altYes">
            {{ props.altYes }}
          </template>
          <template v-else>
            <span class="font-bold underline">Y</span>
            <span>es</span>
          </template>
        </button>
        <button
          v-if="!props.disableNo"
          @click="emits('no')"
          class="yes-no-button"
        >
          <template v-if="props.altNo">
            {{ props.altNo }}
          </template>
          <template v-else>
            <span class="font-bold underline">N</span>
            <span>o</span>
          </template>
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
  title: string;
  message: string;
  disableNo?: boolean;
  altYes?: string;
  altNo?: string;
}>();
const emits = defineEmits(['yes', 'no'])
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
    case 'y':
    case 'Y':
      emits('yes')
      event.preventDefault()
      event.stopImmediatePropagation()
      break
    case 'n':
    case 'N':
    case 'Escape':
      emits('no')
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
.yes-no-button {
  @apply bg-white px-2 py-1 transition-colors border-white border-2;
  @apply hover:bg-black hover:text-white;
}
</style>
