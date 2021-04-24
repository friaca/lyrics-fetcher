import path from 'path';
import { promises } from 'fs';
import worker from 'worker_threads';
import jsdom, { JSDOM } from 'jsdom';
import ora from 'ora';
import getSite from './site';
import question from './inquirer';
import { sanitize, fetch, sleep } from './utils';
import { Album, Artist } from './types/music';

const { writeFile, mkdir, access } = promises;

const DEFAULT_SITE = getSite('azlyrics');
const USE_WORKERS = false;

const IDs = Object.freeze({
  artist: 'artistName',
  artistChoice: 'artistChoice',
  albumsChoice: 'albumsChoice'
});

(async () => {
  const artistName = await question({
    name: IDs.artist,
    message: `What's the artist's name?`,
    validate: (input: string) => input.length > 0,
  }).then(answer => answer[IDs.artist]);

  const url = DEFAULT_SITE.getArtistSearch(artistName);

  try {
    const querySelector = (dom: jsdom.JSDOM) => (selector: string) => dom.window.document.querySelector(selector);
    const querySelectorAll = (dom: jsdom.JSDOM) => (selector: string) => [...dom.window.document.querySelectorAll(selector)];

    const rawArtistSearchDom = await fetch(url);
    const artistSearchDom = new JSDOM(rawArtistSearchDom);
    
    const foundArtists: Artist[] = querySelectorAll(artistSearchDom)('.panel table.table td a')!.map(element => ({
      name: (element as HTMLElement).firstElementChild!.textContent?.trim()!,
      url: element.getAttribute('href')!,
    }));
  
    if (!foundArtists.length) {
      console.log(`Couldn't find an artist with the name ${artistName}`);
      process.exit(1);
    }
  
    const chosenArtist = foundArtists.length === 1 ? foundArtists[0] : await question({
      name: IDs.artistChoice,
      type: 'list',
      message: 'Which one?',
      choices: foundArtists.map(({ name }) => ({ name })),
    }).then(answer => foundArtists.find(artist => artist.name === answer[IDs.artistChoice])!); 

    const rawArtistPageDom = await fetch(chosenArtist.url);
    const artistPageDom = new JSDOM(rawArtistPageDom);

    /* 
      Reliable way of getting album list from AZLyrics as of 04/05/2020 - 23/04/2021
    */

    const children = [...querySelector(artistPageDom)('#listAlbum')!.children].filter(
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

    const chosenAlbums = await question({
      name: IDs.albumsChoice,
      type: 'checkbox',
      message: 'Choose the ones to download',
      choices: artistAlbums.map(({ name }) => ({ name }))
    }).then(albumNames => 
      artistAlbums.filter(album => albumNames[IDs.albumsChoice].includes(album.name))
    )

    if (USE_WORKERS) {

    } else {
      for await (const album of chosenAlbums) {
        const spinner = ora(`Downloading songs' lyrics from ${album.name}`).start();
        const albumFolder = path.join(path.resolve('lyrics'), sanitize(album.name));
  
        try {
          await access(albumFolder);
        } catch (error) {
          await mkdir(albumFolder, { recursive: true });
        }
  
        for await (const song of album.songs) {
          await sleep(500);

          const rawSongDom = await fetch(DEFAULT_SITE.resolvePartialUrl(song.url));
          const songDom = new JSDOM(rawSongDom);
        
          const lyrics = [...querySelector(songDom)('.col-xs-12.col-lg-8.text-center')!.children]
            .find(child => child.className === '' && child.nodeName === 'DIV')
            ?.textContent?.trim() as string
  
          writeFile(`${albumFolder}/${sanitize(song.name)}.txt`, lyrics);
        }

        spinner.stop();
      }
      
      console.log(`Lyrics downloaded succesfully!`);
      process.exit(0);
    }

    return;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
