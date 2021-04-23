export type Song = {
  name: string;
  url: string;
};

export type Album = {
  name: string;
  songs: Song[];
};

export type Artist = Song;
