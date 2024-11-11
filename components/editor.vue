<template>
  <div ref="container" class="w-full flex-grow" />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount, type Ref } from 'vue';
import * as monaco from 'monaco-editor';
import { buildWorkerDefinition } from 'monaco-editor-workers';
import type { EditorEvents, LanguageInfo } from '~/lib/monaco/types';
import { detectLanguageFromContent, debounce } from '~/lib/monaco/utils';
import { setupMonaco } from '~/lib/monaco/setup';
import { languageDefinitions } from '~/lib/monaco/languages';

const props = withDefaults(defineProps<{
  modelValue: string;
  readonly?: boolean;
  theme?: string;
  forcedLanguage?: string|null;
}>(), {
  readonly: false,
  theme: 'vs-dark'
});

const emit = defineEmits<EditorEvents>();
const container = ref(null) as any as Ref<HTMLDivElement>;
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

const currentLanguage = ref<string>('plaintext');

const setEditorLanguage = (languageId: string) => {
  if (currentLanguage.value === languageId) return;
  if (editor && editor.getModel()) {
    console.log('Setting language:', languageId);
    currentLanguage.value = languageId;
    monaco.editor.setModelLanguage(editor.getModel()!, languageId);
  }
};

const updateLanguage = debounce((content: string) => {
  if (editor) {
    const detectedLanguage = detectLanguageFromContent(content);
    emit('language-detected', detectedLanguage);
    if (!props.forcedLanguage) setEditorLanguage(detectedLanguage);
  }
}, 500);

onMounted(async () => {
  buildWorkerDefinition(
    '../node_modules/monaco-editor-workers/dist/workers',
    import.meta.url,
    false
  );
  
  await setupMonaco();

  const availableLanguages = languageDefinitions.map(lang => ({
    id: lang.id,
    extensions: lang.extensions,
    aliases: lang.aliases || [],
    mimeTypes: lang.mimeTypes || [],
  } as LanguageInfo));
  emit('loaded-languages', availableLanguages);

  const initialDetectedLanguage = detectLanguageFromContent(props.modelValue);
  emit('language-detected', initialDetectedLanguage);
  const initialLanguage = props.forcedLanguage || initialDetectedLanguage;
  currentLanguage.value = initialLanguage;
  const model = monaco.editor.createModel(props.modelValue, initialLanguage);
  
  editor = monaco.editor.create(container.value, {
    model,
    theme: props.theme,
    readOnly: props.readonly,
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
  });

  // Register keyboard shortcuts
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    emit('save');
  });
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
    emit('duplicate');
  });
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN, () => {
    emit('new');
  });

  // Handle content changes
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || '';
    emit('update:modelValue', value);
    updateLanguage(value);
  });

  emit('loaded');
});

onBeforeUnmount(() => {
  editor?.dispose();
});

// Watch for prop changes
watch(() => props.readonly, (value) => {
  editor?.updateOptions({ readOnly: !!value });
});

watch(() => props.modelValue, (newValue, oldValue) => {
  if (newValue === oldValue || newValue === editor?.getValue()) return;
  editor?.setValue(newValue);
  console.log('Model value updated:', newValue);
  updateLanguage(newValue);
});

watch(() => props.theme, (newTheme) => {
  editor?.updateOptions({ theme: newTheme });
});

watch(() => props.forcedLanguage, (newLanguage) => {
  if (!editor) return;
  if (newLanguage) setEditorLanguage(newLanguage);
  else setEditorLanguage(detectLanguageFromContent(editor.getValue()));
});
</script>
