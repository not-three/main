<template>
  <img src="/assets/img/icon.svg" class="h-5 w-5 border-white border fixed m-4 select-none" alt="!3" />
  <div class="fixed bottom-0 right-0 pointer-events-none select-none">
    <p class="text-[60vh] opacity-20 font-semibold translate-y-1/3">error</p>
  </div>
  <div class="w-full min-h-screen flex justify-center items-center p-8">
    <div class="border-white border p-4 max-w-xl">
      <h1 class="text-4xl font-bold">Error {{ error?.statusCode }}</h1>
      <p class="text-lg mt-4">{{ error?.message }}</p>
      <p class="text-xs text-white/60 mt-2">
        Open the Developer Console for more information.
      </p>
      <div class="text-right mt-4">
        <button @click="handleError" class="px-4 py-2 hover:text-black hover:bg-white transition-colors border-white border text-white">
          Go to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { NuxtError } from '#app'

defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })
</script>
