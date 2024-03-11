<template>
  <spinner :visible="loading" />
  <controls
    :loading="loading"
    :enable="content !== ''"
    @save="saveD"
    @duplicate="duplicateD"
    @new="newD"
  />
  <editor
    v-model="content"
    @save="saveD"
    @duplicate="duplicateD"
    @new="newD"
    @loaded="loading = false"
  />
</template>

<script lang="ts">
import useBase from '~/mixins/base'
export default defineNuxtComponent({
  mixins: [useBase],
})
</script>
