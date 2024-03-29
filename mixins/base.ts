import CryptoJS from "crypto-js";
import Axios, { type AxiosInstance } from "axios";

export default defineNuxtComponent({
  data: () => ({
    configData: {} as any,
    content: '',
    readOnly: false,
    loading: true,
    api: null as any,
    errorVisible: false,
    errorMessage: '',
    defaultExpires: 0,
  }),
  async mounted() {
    const handler = (event: any) => {
      if (event.origin !== location.origin) return;
      if (event.data?.type !== 'DUPLICATE_SHARE') return;
      this.content = event.data.content;
      window.removeEventListener('message', handler);
    }
    window.addEventListener('message', handler);
    const api = await this.getApi()
    try {
      const info = await api.get('info');
      this.defaultExpires = info.data.defaultExpires;
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Error connecting to API. Please try again later.';
      this.errorVisible = true;
    }
  },
  methods: {
    async showError(message: string) {
      this.errorMessage = message;
      this.errorVisible = true;
    },
    async saveD() {
      if (this.readOnly) return this.showError('Cannot save readonly note');
      if (!this.content) return this.showError('No content to save');
      const secret = Math.random().toString(36).substring(2);
      const encrypted = CryptoJS.AES.encrypt(this.content, secret).toString();
      const res = await (await this.getApi()).post('create', { content: encrypted });
      // window.location.href = `/q/${res.data.id}#${secret}`;
      this.$router.push('/q/' + res.data.id + '#' + secret);
    },
    async duplicateD() {
      if (!this.content) return this.showError('No content to duplicate');
      const win = window.open(location.origin, '_blank');
      win?.addEventListener('load', async () => {
        let counter = 0;
        let interval = window.setInterval(() => {
          if (counter++ > 200) {
            window.clearInterval(interval);
          }
          win?.postMessage({ type: 'DUPLICATE_SHARE', content: this.content }, location.origin);
        }, 100);
      });
    },
    async newD() {
      window.open(location.origin, '_blank');
    },
    async getApi(): Promise<AxiosInstance> {
      if (this.api) return this.api;
      this.configData = (await Axios.get('/config.json')).data;
      this.api = Axios.create({
        baseURL: this.configData.baseURL,
      })
      return this.api;
    }
  }
})
