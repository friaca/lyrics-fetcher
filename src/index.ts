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
    message: 'Qual o nome do artista?',
    name: IDs.artist,
    type: 'input',
    validate: (input: string) => input.length > 0,
  });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(DEFAULT_SITE.getArtistSearch(artistName));

  const foundArtists = await page.evaluate(() =>
    [...document.querySelectorAll('.panel table.table td a')].map(element => ({
      name: (element as HTMLElement).firstElementChild!.textContent?.trim(),
      url: element.getAttribute('href'),
    }))
  );

  const chosenArtist = await question({
    message: 'Qual desses?',
    name: IDs.artistChoice,
    choices: foundArtists.map(({ name }) => ({ name })),
    type: 'list',
  });
  console.log(chosenArtist);
  // await page.goto(foundArtists.find(artist => artist.name === chosenArtist)!.url as string);
})();
