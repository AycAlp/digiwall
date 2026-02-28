export function BoardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
      <div className="h-36 bg-gray-100" />
      <div className="bg-white px-4 py-3 flex flex-col gap-2">
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/3 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export function BoardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <BoardSkeleton key={i} />
      ))}
    </div>
  )
}
