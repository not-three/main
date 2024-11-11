<template>
  <div class="base-container">
    <slot />
  </div>
</template>

<style>
.base-container {
  @apply w-screen h-screen bg-[#1e1e1e] overflow-hidden flex flex-col;
}
button {
  @apply select-none;
}
</style>
