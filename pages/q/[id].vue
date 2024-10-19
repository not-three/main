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
  <yes-no
    :visible="isBurn"
    title="Warning"
    message="This file can only be viewed once. Are you sure you want to continue?"
    @yes="burn"
    disable-no
  />
  <spinner :visible="loading" />
  <nav-bar
    :config="configData"
    :expires="expires"
    :default-expires="defaultExpires"
    :burnt="burnt"
    @new="newD"
    @save="saveD"
    @duplicate="duplicateD"
    no-save
  />
  <editor
    v-if="isReady"
    v-model="content"
    @save="saveD"
    @duplicate="duplicateD"
    @new="newD"
    @loaded="loading = false"
    readonly
  />
</template>

<script lang="ts">
import CryptoJS from 'crypto-js';
import useBase from '~/mixins/base'
export default defineNuxtComponent({
  mixins: [useBase],
  data: () => ({
    isReady: false,
    decryptURL: '',
    expires: null,
    burnt: false,
  }),
  mounted() {
    if (!this.isBurn) this.doInit();
  },
  methods: {
    async doInit() {
      try {
        this.readOnly = true;
        const api = await this.getApi();
        const secret = location.hash.substring(1);
        this.decryptURL = api.defaults.baseURL + `decrypt/${this.$route.params.id}/${secret}`;
        const res = await api.get(`json/${this.$route.params.id}`);
        this.content = CryptoJS.AES.decrypt(res.data.content, secret).toString(CryptoJS.enc.Utf8);
        this.isReady = true;
        this.expires = res.data.expires;
        this.burnt = res.data.burnt;
      } catch (e) {
        console.error(e);
        this.$router.push('/?e=404');
      }
    },
    burn() {
      const params = new URLSearchParams(location.search);
      params.delete('burn');
      const url = `${location.pathname}?${params}${location.hash}`;
      window.history.replaceState({}, '', url);
      this.isBurn = false;
      this.doInit();
    },
  }
})
</script>
