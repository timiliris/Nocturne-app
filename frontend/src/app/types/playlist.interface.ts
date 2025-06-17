import {track} from "./track.interface";

export interface Playlist {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  songs: { song: track }[]; // car relation via PlaylistSong
}
