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
        language: this.currentLanguage,
        burn_after_reading: burnAfterReading,
      });
      this.$router.push(`/q/${res.data.id}?new=1${burnAfterReading ? '&burn=1' : ''}#${secret}`);
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
    },
    download() {
      if (!this.content) return this.showError('No content to download');
      const lang = this.currentLanguage || this.detectedLanguage;
      const info = this.loadedLanguages.find(l => l.id === lang) || { mimeTypes: ['text/plain'], extensions: ['.txt'] };
      const ext = info.extensions[0];
      const mime = info.mimeTypes[0];
      const random = Math.random().toString(36).substring(2);
      const blob = new Blob([this.content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `not-th.re_${random}${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
  }
})
