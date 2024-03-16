<template>
  <div class="base-container">
    <slot />
  </div>
</template>

<style>
.base-container {
  @apply w-screen h-screen bg-[#1e1e1e] overflow-hidden;
}
button {
  @apply select-none;
}
</style>
