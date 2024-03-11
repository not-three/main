<template>
  <div ref="container" class="w-full h-full" />
</template>

<script lang="ts" setup>
const container = ref(null) as any as Ref<HTMLDivElement>;

const props = defineProps<{
  modelValue: string;
  readonly?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'loaded', 'save', 'duplicate', 'new']);

let editor: any = null;

onMounted(async () => {
  const [monaco, worker] = await Promise.all([
    import('monaco-editor'),
    import('monaco-editor-workers'),
  ]);
  worker.buildWorkerDefinition(
    '../node_modules/monaco-editor-workers/dist/workers',
    import.meta.url,
    false
  );
  const ed = monaco.editor.create(container.value, {
    value: props.modelValue + '',
    language: 'javascript',
    theme: 'vs-dark',
    readOnly: !!props.readonly,
  });
  editor = ed;
  ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
    emit('save');
  });
  ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, async () => {
    emit('duplicate');
  });
  ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN, async () => {
    emit('new');
  });
  ed.onDidChangeModelContent(async () => {
    setTimeout(() => {
      emit('update:modelValue', ed.getValue());
    }, 1);
    // emit('update:modelValue', ed.getValue());
  });
  emit('loaded');
});

watch(() => props.readonly, (value) => {
  editor.updateOptions({ readOnly: !!value });
});

watch(() => props.modelValue, (n, o) => {
  if (n === o || n === editor.getValue()) return;
  editor.setValue(n);
});
</script>
