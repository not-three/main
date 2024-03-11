<template>
  <fade>
    <div v-if="visible" class="fixed inset-0 flex justify-center items-center z-50 cursor-progress">
      <icon name="svg-spinners:ring-resize" class="w-12 h-12 text-white" />
    </div>
  </fade>
</template>

<script lang="ts" setup>
const props = defineProps<{
  visible?: boolean;
}>();
</script>
