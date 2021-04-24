import fs from 'fs';
import path from 'path';
import jsdom, { JSDOM } from 'jsdom';
import { Album, Artist } from '../src/types/music';

const htmlFolder = path.join(path.resolve(__dirname), 'mocks');

describe('parsing html', () => {
  const querySelector = (dom: jsdom.JSDOM) => (selector: string) => dom.window.document.querySelector(selector);
  const querySelectorAll = (dom: jsdom.JSDOM) => (selector: string) => [...dom.window.document.querySelectorAll(selector)];

  describe('parsing artist search page', () => {
    const artistSearchHtml = fs.readFileSync(path.join(htmlFolder, 'artist-search-page.html'));
    const dom = new JSDOM(artistSearchHtml);

    it('parses tag selectors and gets search term', () => {
      const title = querySelector(dom)('title');
      expect(title.textContent).toBe('AZLyrics - Search: Flume');
    })
  
    it('parses classes selectors and get found artists with that term', () => {
      const selector = '.panel table.table td a';
      const elements = querySelectorAll(dom)(selector);
      
      const artists: Artist[] = elements.map(element => ({
        name: (element as HTMLElement).firstElementChild!.textContent?.trim(),
        url: element.getAttribute('href'),
      }));
  
      expect(artists[0].name).toBe('Flume');
    })
  })
  
  
  
  describe('parsing artist page', () => {
    const artistPageHtml = fs.readFileSync(path.join(htmlFolder, 'artist-page.html'));
    const dom = new JSDOM(artistPageHtml);

    it('parses the artist albums', () => {
      const children = [...querySelector(dom)('#listAlbum')!.children].filter(
        child => child.nodeName === 'DIV'
      );
  
      const albumElements = children.filter(child => child.classList.contains('album'));
      const indexes = albumElements.map(albumTitle => children.indexOf(albumTitle));
  
      let artistAlbums: Album[] = [];
  
      for (let i = 0; i < indexes.length; i++) {
        let album: Album = { 
          name: albumElements[i].firstElementChild!.textContent!, 
          songs: [] 
        };
  
        for (let j = indexes[i] + 1; j < indexes[i + 1]; j++) {
          album.songs.push({
            name: children[j].firstElementChild!.textContent!,
            url: children[j].firstElementChild?.getAttribute('href')!,
          });
        }
  
        artistAlbums.push(album);
      }
  
      for (let k = indexes[indexes.length - 1] + 1; k < children.length; k++) {
        artistAlbums[artistAlbums.length - 1].songs.push({
          name: children[k].firstElementChild!.textContent!,
          url: children[k].firstElementChild?.getAttribute('href')!,
        });
      }

      expect(artistAlbums.length).toBe(8);
    })
  })

  describe('parsing song page', () => {
    const songPageHtml = fs.readFileSync(path.join(htmlFolder, 'song-page.html'));
    const dom = new JSDOM(songPageHtml);

    it('retrieves the song\'s lyrics', () => {
      const selector = '.col-xs-12.col-lg-8.text-center'
      const lyrics = [...querySelector(dom)(selector)!.children]
        .find(child => child.className === '' && child.nodeName === 'DIV')
        ?.textContent?.trim() as string;

      expect(lyrics).toContain('Cocaine heart is broken, time to retire');
    })
  })
});