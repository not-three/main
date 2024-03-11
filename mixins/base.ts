import CryptoJS from "crypto-js";
import Axios, { type AxiosInstance } from "axios";

export default defineNuxtComponent({
  data: () => ({
    content: '',
    readOnly: false,
    loading: true,
    api: null as any,
  }),
  mounted() {
    const handler = (event: any) => {
      if (event.origin !== location.origin) return;
      this.content = event.data;
      window.removeEventListener('message', handler);
    }
    window.addEventListener('message', handler);
  },
  methods: {
    async saveD() {
      if (this.readOnly) {
        window.alert('Cannot save readonly note');
        return;
      }
      if (!this.content) {
        window.alert('No content, save would be unnecessary');
        return;
      }
      const secret = Math.random().toString(36).substring(2);
      const encrypted = CryptoJS.AES.encrypt(this.content, secret).toString();
      const res = await (await this.getApi()).post('create', { content: encrypted });
      window.location.href = `/q/${res.data.id}#${secret}`;
      console.log(res.data, secret);
    },
    async duplicateD() {
      if (!this.content) {
        window.alert('No content, duplicate would be unnecessary');
        return;
      }
      const win = window.open(location.origin, '_blank');
      win?.addEventListener('load', async () => {
        let counter = 0;
        let interval = window.setInterval(() => {
          if (counter++ > 200) {
            window.clearInterval(interval);
          }
          win?.postMessage(this.content, location.origin);
        }, 100);
      });
    },
    async newD() {
      window.open(location.origin, '_blank');
    },
    async getApi(): Promise<AxiosInstance> {
      if (this.api) return this.api;
      this.api = Axios.create({
        baseURL: (await Axios.get('/config.json')).data.baseURL,
      })
      return this.api;
    }
  }
})
