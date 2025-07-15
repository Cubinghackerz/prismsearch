
import SearchResultsSkeleton from "@/components/skeletons/SearchResultsSkeleton";

interface LoadingSkeletonProps {
  query: string;
}

const LoadingSkeleton = ({ query }: LoadingSkeletonProps) => {
  return <SearchResultsSkeleton query={query} />;
};

export default LoadingSkeleton;
