<template>
  <div class="w-screen flex gap-2 bg-black text-white px-4 py-1 items-center">
    <yes-no
      title="Are you sure?"
      :message="warning"
      :visible="visible === 1"
      @yes="copyDecrypted"
      @no="visible = 0"
    />
    <yes-no
      title="Save File"
      message="How many days should the file be stored?"
      :visible="visible === 2"
      alt-yes="Save"
      alt-no="Cancel"
      @yes="saveCustomTime"
      @no="cancelSave"
    >
      <input
        v-model.number="expiresCustomTime"
        class="mb-4 w-full text-center text-black"
        type="number"
        min="1"
        :max="maxExpireDays"
        step="1"
      />
    </yes-no>
    <img id="logo" src="/assets/img/icon.svg" class="h-5 w-5 border-white border" alt="!3" />
    <h1 class="font-bold select-none transition-all duration-200 max-w-0 -mr-1 overflow-hidden whitespace-pre">
      not-th.re
    </h1>
    <nav-entry
      v-for="entry in entries"
      :name="entry.name"
      :entries="entry.entries"
      :key="entry.name"
      :disabled="entry.disabled"
      @click="handle"
    />
    <div class="flex-grow" />
    <template v-if="expires && !burnt">
      <icon name="lucide:alarm-clock" />
      <span class="font-mono translate-y-0.5">{{ expiresString }}</span>
    </template>
  </div>
</template>

<style>
#logo:hover + h1 {
  @apply max-w-32 mr-0;
}
</style>

<script lang="ts" setup>
const props = defineProps<{
  config: any;
  defaultExpires: number;
  expires?: number|null;
  burnt?: boolean;
}>()

const expiresObject = ref({ hours: 0, minutes: 0, seconds: 0 })
const expiresString = ref('XX:XX:XX')
const scheduler = ref(0)
const maxExpireDays = ref(30)
const expiresCustomTime = ref(30)
const burnSave = ref(false)

watch(() => props.defaultExpires, (value) => {
  maxExpireDays.value = Math.floor(value / 1000 / 60 / 60 / 24)
  expiresCustomTime.value = maxExpireDays.value
}, { immediate: true })

watch(() => props.expires, (value) => {
  if (!props.expires) {
    clearTimeout(scheduler.value)
    return
  }
  const expiresDate = new Date(props.expires)
  const currentDate = new Date();
  const diff = expiresDate.getTime() - currentDate.getTime();
  expiresObject.value = {
    seconds: Math.floor(diff / 1000) % 60,
    minutes: Math.floor(diff / 1000 / 60) % 60,
    hours: Math.floor(diff / 1000 / 60 / 60),
  }

  const update = () => {
    const { hours, minutes, seconds } = expiresObject.value
    expiresObject.value.seconds--
    if (expiresObject.value.seconds < 0) {
      expiresObject.value.seconds = 59
      expiresObject.value.minutes--
    }
    if (expiresObject.value.minutes < 0) {
      expiresObject.value.minutes = 59
      expiresObject.value.hours--
    }
    expiresString.value = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':')
    if (hours === 0 && minutes === 0 && seconds === 0) return;
    scheduler.value = window.setTimeout(update, 1000)
  }
  update()
}, { immediate: true })

onUnmounted(() => {
  clearTimeout(scheduler.value)
})

const visible = ref(0)
const route = useRoute()
const warning = [
  'With this url the server will be able to decrypt your data.',
  'This has it\'s benefits, and we do not store the data, but',
  'it\'s still a risk. Are you sure you want to share this url?',
].join(' ')

const entries = computed(() => ([
  {
    name: 'file',
    entries: [
      ['save', 'Save for ' + Math.floor(props.defaultExpires / 1000 / 60 / 60 / 24) + ' days'],
      ['save-custom', 'Save for custom time'],
      ['save-burn', 'Save until read'],
      ['duplicate', 'Duplicate'],
      ['new', 'New'],
    ] as [string, string][],
  },
  ...(props.burnt ? [] : [
    {
      name: 'share',
      entries: [
        ['share-curl', 'Copy curl command'],
        ['share-raw', 'Copy raw (encrypted) url'],
        ['share-decrypted', 'Copy server side decryption url']
      ] as [string, string][],
      disabled: route.params.id === undefined,
    },
  ]),
  {
    name: 'about',
    entries: [
      ['github', 'Github Repository'],
      ['help', 'Help (Github Issues)'],
      ['terms', 'Privacy and Terms'],
    ] as [string, string][],
  }
]))

const emit = defineEmits(['save', 'duplicate', 'new'])

function getBaseURL() {
  const url = props.config.baseURL;
  if (url.startsWith('/')) return location.origin + url;
  return url;
}

function copyDecrypted() {
  const url = getBaseURL();
  navigator.clipboard.writeText(`${url}decrypt/${route.params.id}/${location.hash.substring(1)}`)
  visible.value = 0
}

function handle(entry: string) {
  const url = getBaseURL();
  switch (entry) {
    case 'share-curl':
      navigator.clipboard.writeText([
        `curl ${url}raw/${route.params.id} | base64 -d |`,
        `openssl enc -aes-256-cbc -d -pass pass:${location.hash.substring(1)}`,
        '-md md5 -salt -in /dev/stdin 2>/dev/null | cat',
      ].join(' '))
      break
    case 'share-raw':
      navigator.clipboard.writeText(`${url}raw/${route.params.id}`)
      break
    case 'share-decrypted':
      visible.value = 1
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
    case 'save-custom':
      visible.value = 2
      break
    case 'save-burn':
      burnSave.value = true
      visible.value = 2
      break
    default:
      if (!['save', 'duplicate', 'new'].includes(entry)) throw new Error('Invalid entry')
      emit(entry as any);
  }
}

function cancelSave() {
  burnSave.value = false;
  visible.value = 0;
  expiresCustomTime.value = maxExpireDays.value;
}

function saveCustomTime() {
  const days = expiresCustomTime.value;
  if (days < 0 || days > maxExpireDays.value) return;
  expiresCustomTime.value = maxExpireDays.value;
  emit('save', days * 24 * 60 * 60 * 1000, burnSave.value);
  burnSave.value = false;
  visible.value = 0;
}
</script>
