import { ISite, SiteName } from './types/site';

const sites: Readonly<ISite[]> = [
  {
    id: 'azlyrics',
    baseUrl: 'https://www.azlyrics.com',
    get resolvePartialUrl() {
      return (complement: string) => `${this.baseUrl}${complement.substring(2)}`
    },
    getArtistSearch: (term: string): string =>
      `https://search.azlyrics.com/search.php?q=${term.split(' ').join('+')}&w=artists&p=1`,
  },
];

const getSite = (name: SiteName) => sites.find(site => site.id === name) as ISite;

export default getSite;
