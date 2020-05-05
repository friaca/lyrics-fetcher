import puppeteer from 'puppeteer';
import question from './inquirer';
import getSite from './site';
import { Album } from './types/music';

const DEFAULT_SITE = getSite('azlyrics');

const IDs = Object.freeze({
  artist: 'artistName',
  artistChoice: 'artistChoice',
});

(async () => {
  const artistName = await question({
    name: IDs.artist,
    message: 'Qual o nome do artista?',
    validate: (input: string) => input.length > 0,
  }).then(answer => answer[IDs.artist]);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log(DEFAULT_SITE.getArtistSearch(artistName));
  await page.goto(
    `https://search.azlyrics.com/search.php?q=${artistName.split(' ').join('+')}&w=artists&p=1`
  );

  const foundArtists = await page.evaluate(() =>
    [...document.querySelectorAll('.panel table.table td a')].map(element => ({
      name: (element as HTMLElement).firstElementChild!.textContent?.trim(),
      url: element.getAttribute('href')!,
    }))
  );

  const chosenArtist = await question({
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
})();
