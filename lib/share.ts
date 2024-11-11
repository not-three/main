export type ShareUrlData = {
  // client-side-decryption
  csd: {
    [key: string]: string;
  },
  // server-side-decryption
  ssd: {
    [key: string]: string;
  }
}

export const WARNING = [
  'With this url the server will be able to decrypt your data.',
  'This has it\'s benefits, and we do not store the data, but',
  'it\'s still a risk. Are you sure you want to share this url?',
].join(' ');

export function generateShare(baseURL: string, uiURL: string, id: string, extension: string): ShareUrlData {
  if (baseURL.startsWith('/')) baseURL = location.origin + baseURL;
  if (!baseURL.endsWith('/')) baseURL += '/';
  if (uiURL.startsWith('/')) uiURL = location.origin + uiURL;
  if (!uiURL.endsWith('/')) uiURL += '/';
  const key = location.hash.substring(1);
  const url = new URL(location.href);
  const burn = url.searchParams.get('burn') === '1';
  const random = Math.random().toString(36).substring(2);
  return {
    csd: {
      "Raw (Encrypted)": `${baseURL}raw/${id}`,
      "WebUI": `${uiURL}q/${id}${burn ? '?burn=1' : ''}#${key}`,
      "Curl Print": [
        `curl ${baseURL}raw/${id} | base64 -d |`,
        `openssl enc -aes-256-cbc -d -pass pass:${key}`,
        '-md md5 -salt -in /dev/stdin 2>/dev/null | cat',
      ].join(' '),
      "Curl Save": [
        `curl ${baseURL}raw/${id} | base64 -d |`,
        `openssl enc -aes-256-cbc -d -pass pass:${key}`,
        `-md md5 -salt -in /dev/stdin 2>/dev/null -out not-th.re_${random}${extension}`,
      ].join(' '),
    },
    ssd: {
      "Raw": `${baseURL}decrypt/${id}/${key}`,
      "Curl Print": `curl ${baseURL}decrypt/${id}/${key}`,
      "Curl Save": `curl -o not-th.re_${random}${extension} ${baseURL}decrypt/${id}/${key}`,
    },
  }
}
