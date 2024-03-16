<template>
  <div class="border-l-2 border-white/20" />
  <div class="relative" ref="container">
    <h2
      @click="active = disabled ? false : !active"
      class="cursor-pointer select-none"
      :class="{'brightness-50 cursor-not-allowed': disabled}"
    >
      <span class="font-bold">{{ name.substring(0, 1).toUpperCase() }}</span>
      <span>{{ name.substring(1) }}</span>
    </h2>
    <div class="absolute inset-x-0 bottom-0 flex justify-center items-center pointer-events-none">
      <fade>
        <div v-if="active" class="translate-y-full overflow-visible z-50 flex flex-col items-center pointer-events-auto">
          <div class="w-0 h-0 border-x-[1rem] border-x-transparent border-b-[1rem] border-b-black mt-2" />
          <div class="bg-black p-2">
            <button
              v-for="entry in entries"
              :key="Array.isArray(entry) ? entry[0] : entry"
              @click="Array.isArray(entry) ? doEmit(entry[0]) : doEmit(entry)"
              class="w-full text-left whitespace-nowrap bg-white/5 my-1 px-2 py-1"
            >
            <span v-if="Array.isArray(entry)">
              {{ entry[1] }}
            </span>
            <template v-else>
              <span class="font-bold underline">{{ entry.substring(0, 1).toUpperCase() }}</span>
              <span>{{ entry.substring(1) }}</span>
            </template>
          </button>
        </div>
      </div>
    </fade>
  </div>
</div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  name: string
  entries: string[]|[string, string][],
  disabled?: boolean,
}>()
const active = ref(false)
const container = ref<HTMLDivElement>()
const emit = defineEmits(['click'])

function doEmit(entry: string) {
  active.value = false
  emit('click', entry)
}

function outsideClickListener(event: MouseEvent) {
  if (!container.value) return
  if (!container.value.contains(event.target as Node)) {
    active.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', outsideClickListener)
})

onUnmounted(() => {
  window.removeEventListener('click', outsideClickListener)
})
</script>
