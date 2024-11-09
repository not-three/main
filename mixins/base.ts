import CryptoJS from "crypto-js";
import Axios, { type AxiosInstance } from "axios";
import type { LanguageInfo } from "~/lib/monaco/types";

export default defineNuxtComponent({
  data: () => ({
    configData: {} as any,
    content: '',
    readOnly: false,
    loading: true,
    api: null as any,
    errorVisible: false,
    errorMessage: '',
    defaultExpires: 1,
    isBurn: false,
    loadedLanguages: [] as LanguageInfo[],
    detectedLanguage: '' as string,
    currentLanguage: null as string | null,
  }),
  async mounted() {
    this.isBurn = useRoute().query.burn === '1';
    const handler = (event: any) => {
      if (this.readOnly) return;
      if (event.origin !== location.origin) return;
      if (event.data?.type !== 'DUPLICATE_SHARE') return;
      this.content = event.data.content;
      window.removeEventListener('message', handler);
      event.source.postMessage({ type: 'DUPLICATE_SHARE_OK' }, event.origin);
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
    async saveD(expires?: number, burnAfterReading: boolean = false) {
      if (this.readOnly) return this.showError('Cannot save readonly note');
      if (!this.content) return this.showError('No content to save');
      const secret = Math.random().toString(36).substring(2);
      const encrypted = CryptoJS.AES.encrypt(this.content, secret).toString();
      const res = await (await this.getApi()).post('create', {
        ...(expires ? { expires } : {}),
        content: encrypted,
        burn_after_reading: burnAfterReading,
      });
      // window.location.href = `/q/{id}#{secret}<?burn>`;
      this.$router.push('/q/' + res.data.id + (burnAfterReading ? '?burn=1' : '') + '#' + secret);
    },
    async duplicateD() {
      if (!this.content) return this.showError('No content to duplicate');
      const win = window.open(location.origin, '_blank');
      win?.addEventListener('load', async () => {
        let ok = false;
        let tries = 0;
        win.addEventListener('message', (event) => {
          if (event.origin !== location.origin) return;
          if (event.data?.type !== 'DUPLICATE_SHARE_OK') return;
          ok = true;
        });
        while (!ok && tries < 200) {
          win.postMessage({ type: 'DUPLICATE_SHARE', content: this.content }, location.origin);
          tries++;
          await new Promise(r => setTimeout(r, 100));
        }
      });
    },
    async newD() {
      window.open(location.origin, '_blank');
    },
    async getApi(): Promise<AxiosInstance> {
      if (this.api) return this.api;
      this.configData = (await Axios.get(this.$config.app.baseURL + 'config.json')).data;
      this.api = Axios.create({
        baseURL: this.configData.baseURL,
      })
      return this.api;
    }
  }
})
