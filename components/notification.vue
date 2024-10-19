<template>
  <div class="fixed inset-0 h-screen pointer-events-none flex flex-col items-end z-50 pt-12 translate-x-1">
    <div class="transition-transform duration-500 ease-in-out" :class="visible ? '' : 'translate-x-full'">
      <div class="notification-container" @click="$emit('click')">
        <slot>
          <p>Missing Content</p>
        </slot>
        <div
          v-if="countdown"
          class="border-b-4 border-white absolute inset-0"
          :style="{ width: `${Math.round(countdown * 100_00)/100}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineEmits(['click']);
defineProps<{
  visible?: boolean;
  countdown?: number | null;
}>();
</script>

<style>
.notification-container {
  @apply max-w-md bg-black border-white border-2 px-8 py-4;
  @apply relative mr-4;
}
</style>
