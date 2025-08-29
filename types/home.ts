import { PostsData } from "./post"

export type HomeContentProps = {
  initialData: {
    posts: PostsData;
    tags: Array<{ tag: string; count: number }>;
  };
}