
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  query: string;
}

const LoadingSkeleton = ({ query }: LoadingSkeletonProps) => {
  return (
    <div className="w-full max-w-[95vw] mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="mb-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
