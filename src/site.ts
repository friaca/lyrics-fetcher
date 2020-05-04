import { SiteInfo, Site } from './types/site';

const sites: Readonly<SiteInfo[]> = [
  {
    id: 'azlyrics',
    getArtistSearch: (term: string): string =>
      `https://search.azlyrics.com/search.php?q=${term.split(' ').join('+')}&w=artists&p=1`,
  },
];

const getSite = (name: Site) => sites.find(site => site.id === name) as SiteInfo;

export default getSite;
