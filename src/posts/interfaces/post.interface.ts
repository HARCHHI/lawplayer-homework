export interface Post {
  id: number;
  coverUrl: string;
  imgurCoverUrl: string | null;
  status: 'IDLE' | 'UPLOADING' | 'DONE' | 'ERROR';
}

export interface PostTable {
  posts: Post[];
  cursor: number;
}
