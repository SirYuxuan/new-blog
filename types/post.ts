export type Post = {
  id: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
}

export type PostsData ={
  posts: Post[];
  total: number;
  totalPages: number;
}

export type PostsByYear = {
  [year: string]: Post[];
}