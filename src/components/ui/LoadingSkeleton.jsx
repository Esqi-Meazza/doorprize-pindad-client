import { Skeleton } from '@mui/material';

export default function LoadingSkeleton({ variant = 'text', count = 1, height }) {
  // Fungsi untuk merender beberapa elemen sesuai jumlah 'count'
  const renderSkeletons = (skeletonItem) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="w-full">
        {skeletonItem}
      </div>
    ));
  };

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count > 4 ? 4 : count} gap-4 w-full`}>
        {renderSkeletons(
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '50%' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: '30%' }} />
          </div>
        )}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header Tabel */}
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <Skeleton variant="rectangular" height={24} className="w-full rounded" />
        </div>
        {/* Baris Tabel */}
        <div className="p-4 flex flex-col gap-4">
          {renderSkeletons(<Skeleton variant="rectangular" height={40} className="w-full rounded" />)}
        </div>
      </div>
    );
  }

  // Default: text
  return (
    <div className="flex flex-col gap-2 w-full">
      {renderSkeletons(<Skeleton variant="text" height={height || 24} className="w-full" />)}
    </div>
  );
}