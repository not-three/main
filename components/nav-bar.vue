<template>
  <yes-no
    title="Are you sure?"
    :message="warning"
    :visible="visible"
    @yes="copyDecrypted"
    @no="visible = false"
  />
  <div class="w-screen flex gap-2 bg-black text-white px-2 py-1">
    <h1 class="font-bold select-none">not-th.re</h1>
    <nav-entry
      v-for="entry in entries"
      :name="entry.name"
      :entries="entry.entries"
      :key="entry.name"
      :disabled="entry.disabled"
      @click="handle"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  config: any;
}>()
const visible = ref(false)
const route = useRoute()
const warning = [
  'With this url the server will be able to decrypt your data.',
  'This has it\'s benefits, and we do not store the data, but',
  'it\'s still a risk. Are you sure you want to share this url?',
].join(' ')
console.log(route.params.id)
const entries = [
  {
    name: 'file',
    entries: ['save', 'duplicate', 'new'],
  },
  {
    name: 'share',
    entries: [
      ['share-curl', 'Copy curl command'],
      ['share-raw', 'Copy raw (encrypted) url'],
      ['share-decrypted', 'Copy server side decryption url']
    ] as [string, string][],
    disabled: route.params.id === undefined,
  },
  {
    name: 'about',
    entries: [
      ['github', 'Github Repository'],
      ['help', 'Help (Github Issues)'],
      ['terms', 'Privacy and Terms'],
    ] as [string, string][],
  }
]

const emit = defineEmits(['save', 'duplicate', 'new'])

function getBaseURL() {
  const url = props.config.baseURL;
  if (url.startsWith('/')) return location.origin + url;
  return url;
}

function copyDecrypted() {
  const url = getBaseURL();
  navigator.clipboard.writeText(`${url}decrypt/${route.params.id}/${location.hash.substring(1)}`)
  visible.value = false
}

function handle(entry: string) {
  const url = getBaseURL();
  switch (entry) {
    case 'share-curl':
      navigator.clipboard.writeText([
        `curl ${url}raw/${route.params.id}| base64 -d |`,
        `openssl enc -aes-256-cbc -d -pass pass:${location.hash.substring(1)}`,
        '-md md5 -salt -in /dev/stdin 2>/dev/null | cat',
      ].join(' '))
      break
    case 'share-raw':
      navigator.clipboard.writeText(`${url}raw/${route.params.id}`)
      break
    case 'share-decrypted':
      visible.value = true
      break
    case 'github':
      window.open('https://github.com/not-three/main', '_blank')
      break
    case 'help':
      window.open('https://github.com/not-three/main/issues/new', '_blank')
      break
    case 'terms':
      console.log(JSON.stringify(props.config))
      window.open(props.config.terms, '_blank')
      break
    default:
      if (!['save', 'duplicate', 'new'].includes(entry)) throw new Error('Invalid entry')
      emit(entry as any);
  }
}
</script>
