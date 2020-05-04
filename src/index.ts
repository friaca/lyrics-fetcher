import puppeteer from 'puppeteer';
import question from './inquirer';
import getSite from './site';

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
  }).then(answer => answer as string);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(DEFAULT_SITE.getArtistSearch(artistName));

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
  }).then(answer => foundArtists.find(artist => artist.name === answer)!);

  await page.goto(chosenArtist.url);
})();
