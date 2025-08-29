export type InfiniteScrollProps = {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
  className?: string;
}