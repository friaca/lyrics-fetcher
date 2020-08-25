import puppeteer from 'puppeteer';
import question from './inquirer';
import ora from 'ora';
import getSite from './site';
import { sanitize } from './utils';
import { Album } from './types/music';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { disconnect } from 'process';

const DEFAULT_SITE = getSite('azlyrics');

const IDs = Object.freeze({
  artist: 'artistName',
  artistChoice: 'artistChoice',
  albumsChoice: 'albumsChoice'
});

(async () => {
  const artistName = await question({
    name: IDs.artist,
    message: 'Qual o nome do artista?',
    validate: (input: string) => input.length > 0,
  }).then(answer => answer[IDs.artist]);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(DEFAULT_SITE.getArtistSearch(artistName));

  const foundArtists = await page.evaluate(() =>
    [...document.querySelectorAll('.panel table.table td a')].map(element => ({
      name: (element as HTMLElement).firstElementChild!.textContent?.trim(),
      url: element.getAttribute('href')!,
    }))
  );

  if (!foundArtists.length) {
    console.log(`Couldn't find an artist with the name ${artistName}`);
    process.exit(1);
  }
  
  const chosenArtist = foundArtists.length === 1 ? foundArtists[0] : await question({
    name: IDs.artistChoice,
    type: 'list',
    message: 'Qual desses?',
    choices: foundArtists.map(({ name }) => ({ name })),
  }).then(answer => foundArtists.find(artist => artist.name === answer[IDs.artistChoice])!);

  await page.goto(chosenArtist.url);

  const artistAlbums = await page.evaluate(() => {
    /* 
      Reliable way of getting album list from AZLyrircs as of 04/05/2020
    */

    const children = [...document.querySelector('#listAlbum')!.children].filter(
      child => child.nodeName === 'DIV'
    );

    const albumElements = children.filter(child => child.classList.contains('album'));

    const indexes = albumElements.map(albumTitle => children.indexOf(albumTitle));

    let discography: Album[] = [];

    for (let i = 0; i < indexes.length; i++) {
      let album: Album = { name: albumElements[i].firstElementChild!.textContent!, songs: [] };
      for (let j = indexes[i] + 1; j < indexes[i + 1]; j++) {
        album.songs.push({
          name: children[j].firstElementChild!.textContent!,
          url: children[j].firstElementChild?.getAttribute('href')!,
        });
      }
      discography.push(album);
    }

    for (let k = indexes[indexes.length - 1] + 1; k < children.length; k++) {
      discography[discography.length - 1].songs.push({
        name: children[k].firstElementChild!.textContent!,
        url: children[k].firstElementChild?.getAttribute('href')!,
      });
    }

    return discography;
  });

  const chosenAlbums = await question({
    name: IDs.albumsChoice,
    type: 'checkbox',
    message: 'Quais deseja baixar?',
    choices: artistAlbums.map(({ name }) => ({ name }))
  }).then(albumNames => {
    return artistAlbums.filter(album => albumNames[IDs.albumsChoice].includes(album.name))
  })

  for await (const album of chosenAlbums) {
    const spinner = ora(`Downloading songs' lyrics from ${album.name}`).start();
    const folder = sanitize(`./lyrics/${album.name}`);

    if (!existsSync(folder)) {
      mkdirSync(folder);
    }

    for await (const song of album.songs) {
      await page.goto(DEFAULT_SITE.resolvePartialUrl(song.url));
    
      const lyrics = await page.evaluate(
        () =>
          [...document.querySelector('.col-xs-12.col-lg-8.text-center')!.children]
            .find(child => child.className === '' && child.nodeName === 'DIV')
            ?.textContent?.trim() as string
      );

      writeFileSync(`${folder}/${song.name}.txt`, lyrics);
    }

    spinner.stop();
  }

  console.log(`Lyrics downloaded succesfully!`);
  process.exit(0);
})();
