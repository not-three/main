<template>
  <gh-badge
    v-if="configData.pullRequest"
    :text="[
      'This is an preview of an pull request.',
      'Click here to view the pull request.',
    ].join('\n')"
    :to="configData.pullRequest"
  />
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
    :default-expires="defaultExpires"
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
