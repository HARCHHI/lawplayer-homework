export type PostStatusEnum = 'IDLE' | 'UPLOADING' | 'DONE' | 'ERROR';

export interface Post {
  id: number;
  coverUrl: string;
  imgurCoverUrl: string | null;
  status: PostStatusEnum;
}

export interface PostTable {
  posts: {
    [key: number]: Post;
  };
  cursor: number;
}
