import nodeFetch from 'node-fetch';

export const sanitize = (text: string): string =>
  text.replace(/((?![a-zA-Z0-9 \u00C0-\u017F\/\\]).)/g, '');

export const fetch = async (url: string, options?: RequestInit | undefined): Promise<string> =>
  await nodeFetch(url, {
    ...{
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0'
      }
    },
    ...{ options }
  }).then(res => res.text())

export const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })