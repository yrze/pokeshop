export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md flex flex-col animate-pulse">
      <div className="aspect-[2.5/3.5] bg-gray-200 dark:bg-gray-800" />
      <div className="p-3 flex flex-col flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-3" />
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
