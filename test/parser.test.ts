import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { Album, Artist } from '../src/types/music';

const htmlFolder = path.join(path.resolve(__dirname), 'mocks');

describe('parsing html', () => {
  const artistSearchHtml = fs.readFileSync(path.join(htmlFolder, 'artist-page.html'));
  const dom = new JSDOM(artistSearchHtml);
  const querySelector = (selector: string) => dom.window.document.querySelector(selector);
  const querySelectorAll = (selector: string) => [...dom.window.document.querySelectorAll(selector)];

  it('parses tag selectors', () => {
    const title = querySelector('title');
    expect(title.textContent).toBe('AZLyrics - Search: Flume');
  })

  it('parses classes selectors', () => {
    const selector = '.panel table.table td a';
    const elements = querySelectorAll(selector);
    const artists: Artist[] = elements.map(element => ({
      name: (element as HTMLElement).firstElementChild!.textContent?.trim(),
      url: element.getAttribute('href'),
    }));

    expect(artists[0].name).toBe('Flume');
  })
});