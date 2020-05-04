export type SiteName = 'azlyrics';

export interface ISite {
  id: SiteName;
  baseUrl: string;
  resolvePartialUrl(complement: string): string;
  getArtistSearch(term: string): string;
}
