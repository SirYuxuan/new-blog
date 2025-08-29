import { PostsByYear } from "./post"

export type ArchiveContentProps = {
  initialData: {
    postsByYear: PostsByYear;
    tags: Array<{ tag: string; count: number }>;
  };
}