export type Site = 'azlyrics';

export type SiteInfo = {
  id: Site;
  getArtistSearch: (term: string) => string;
};
