<template>
  <yes-no
    :visible="errorVisible"
    title="Error"
    :message="errorMessage"
    @yes="errorVisible = false"
    alt-yes="Ok"
    disable-no
  />
  <spinner :visible="loading" />
  <nav-bar
    :config="configData"
    @new="newD"
    @save="saveD"
    @duplicate="duplicateD"
  />
  <editor
    v-model="content"
    @new="newD"
    @save="saveD"
    @duplicate="duplicateD"
    @loaded="loading = false"
  />
</template>

<script lang="ts">
import useBase from '~/mixins/base'
export default defineNuxtComponent({
  mixins: [useBase],
})
</script>
