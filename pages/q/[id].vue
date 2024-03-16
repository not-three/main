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
  }),
  async mounted() {
    try {
      const api = await this.getApi();
      const secret = location.hash.substring(1);
      this.decryptURL = api.defaults.baseURL + `decrypt/${this.$route.params.id}/${secret}`;
      const res = await (await this.getApi()).get(`raw/${this.$route.params.id}`);
      this.content = CryptoJS.AES.decrypt(res.data, secret).toString(CryptoJS.enc.Utf8);
      this.isReady = true;
      this.readOnly = true;
    } catch (e) {
      console.error(e);
      window.location.href = '/';
    }
  },
})
</script>
