<template>
  <fade>
    <div v-if="visible" class="fixed inset-0 flex justify-center items-center z-50 cursor-progress">
      <icon name="ph:spinner-ball-fill" class="w-12 h-12 text-white animate-spin" />
    </div>
  </fade>
</template>

<script lang="ts" setup>
defineProps<{
  visible?: boolean;
}>();
</script>
