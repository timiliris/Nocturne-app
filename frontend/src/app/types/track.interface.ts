export interface track {
  src?: string
  id: string;
  title: string;
  artist: string;
  youtubeUrl: string;
  thumbnail?: string;
  description?: string;
  createdAt: Date;
  filePath: string;
  views: number;
  duration: number;
}
