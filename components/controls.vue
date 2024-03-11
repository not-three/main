<template>
  <div class="fixed top-0 right-0 mr-[10vw] bg-white px-4 pb-4 pt-2 z-10 select-none">
    <h1 class="text-center text-2xl font-bold">not-th.re</h1>
    <div class="controls-container" :class="{'controls-container-loading': loading}">
      <button @click="$emit('save')" title="CTRL + S - Save" :disabled="!enable || noSave">
        <icon name="lucide:save" class="w-6 h-6" />
      </button>
      <button @click="$emit('duplicate')" title="CTRL + D - Duplicate" :disabled="!enable">
        <icon name="lucide:copy" class="w-6 h-6" />
      </button>
      <button @click="$emit('new')" title="CTRL + N - New">
        <icon name="lucide:plus" class="w-6 h-6" />
      </button>
      <button @click="copyURL" title="Copy decrypted URL" :disabled="!url">
        <icon name="lucide:unlock-keyhole" class="w-6 h-6" />
      </button>
      <button @click="openGH" title="Visit us @ GitHub">
        <icon name="lucide:github" class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  loading?: boolean;
  url?: string;
  enable?: boolean;
  noSave?: boolean;
}>();
const emit = defineEmits(['save', 'duplicate', 'new']);
function openGH() {
  window.open('https://github.com/not-three/main', '_blank');
}
function copyURL() {
  if (!props.url) return;
  const prefix = props.url.startsWith('/') ? location.origin : '';
  navigator.clipboard.writeText(prefix + props.url);
}
</script>

<style>
.controls-container {
  @apply border-t-2 border-black pt-3 mt-1;
  @apply grid grid-cols-5 gap-2;
}

.controls-container > button {
  @apply border-black border-2 p-1 transition-all duration-200;
  @apply hover:bg-black hover:text-white;
}

.controls-container > button:disabled,
.controls-container-loading > button {
  @apply opacity-50 pointer-events-none;
}
</style>
