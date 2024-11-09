<template>
  <div class="fixed top-0 right-0 translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
    <div
      class="bg-white shadow-md p-2 select-none hover:opacity-100 opacity-40 transition-opacity duration-300 pointer-events-auto"
      :class="{
        'cursor-pointer': props.to !== undefined,
      }"
      :style="`transform: translate(-${translate}px, ${translate}px) rotate(45deg);`"
      @click="click"
    >
      <div class="my-2 py-1 border-dotted border-black border-y-2 px-[200px]">
        <div ref="container" class="text-black">
          <slot>
            <p class="whitespace-pre text-center">{{ text || 'text missing' }}</p>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['click']);
const props = defineProps<{
  text?: string;
  to?: string | null;
}>();

const container = ref() as any as Ref<HTMLDivElement>;
const translate = ref(0);

function calculateTranslation() {
  const rect = container.value.getBoundingClientRect();
  const sqrt2 = Math.sqrt(2);
  console.log(rect.width, rect.height);
  translate.value = rect.width / sqrt2;
}

onMounted(() => {
  calculateTranslation();
});

function click() {
  emit('click');
  if (props.to) window.open(props.to, '_blank');
}

watch(() => props.text, () => {
  window.requestAnimationFrame(() => {
    calculateTranslation();
  });
});
</script>
