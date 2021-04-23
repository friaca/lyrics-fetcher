import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const htmlFolder = path.join(path.resolve(__dirname), 'mocks');

test('parses a number into a string', () => {
  expect((2).toString()).toBe('2');
});

test('parses raw html into a dom-like object', () => {
  const artistHtml = fs.readFileSync(path.join(htmlFolder, 'artist-page.html'));
  const dom = new JSDOM(artistHtml);

  const title = dom.window.document.querySelector('title');

  expect(title.textContent).toBe('AZLyrics - Search: Flume');
});