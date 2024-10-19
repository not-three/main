<template>
  <notification :visible="!!notificationTime" :countdown="notificationTime">
    <p>{{ notificationText }}</p>
  </notification>
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
  data: () => ({
    notificationTime: null as number|null,
    notificationText: '',
    notificationTimeout: 0,
  }),
  mounted() {
    const error = useRoute().query.e;
    if (!error) return;
    switch (error) {
      case '404':
        this.notificationText = "This file got deleted. It's no longer available.";
        break;
      default:
        this.notificationText = "An unknown error occurred. Please try again later.";
        break;
    }
    const params = new URLSearchParams(window.location.search);
    params.delete('e');
    window.history.replaceState({}, '', `${window.location.pathname}${params}`);
  },
  beforeUnmount() {
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
  },
  watch: {
    loading() {
      if (this.notificationText) {
        this.notificationTimeout = window.setTimeout(this.showNotification, 500);
      }
    }
  },
  methods: {
    showNotification(loop = false) {
      if (!loop) this.notificationTime = 1.0;
      this.notificationTimeout = window.setTimeout(() => {
        if (this.notificationTime === null) return;
        this.notificationTime = Math.max(0, this.notificationTime - 0.005);
        if (this.notificationTime > 0) this.showNotification(true);
      }, 20);
    }
  }
})
</script>
