export default function CardDetailSkeleton() {
  return (
    <div>
      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-6 animate-pulse" />
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden animate-pulse">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-gray-200 dark:bg-gray-800 min-h-96 flex items-center justify-center p-10">
            <div className="w-72 h-96 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          </div>
          <div className="p-8 flex flex-col">
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>
            <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3" />
            <div className="flex gap-4 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6 flex-1">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
              </div>
            </div>
            <div className="border-t dark:border-gray-800 pt-6 flex items-center justify-between">
              <div>
                <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
