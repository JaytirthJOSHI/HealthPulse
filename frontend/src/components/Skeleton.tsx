import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'md' 
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${width} ${height} ${roundedClasses[rounded]} ${className}`}
      aria-label="Loading..."
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        height={i === lines - 1 ? 'h-3' : 'h-4'} 
        width={i === lines - 1 ? 'w-3/4' : 'w-full'} 
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    <div className="space-y-3">
      <Skeleton height="h-6" width="w-1/2" />
      <SkeletonText lines={3} />
      <div className="flex space-x-2">
        <Skeleton height="h-8" width="w-20" />
        <Skeleton height="h-8" width="w-24" />
      </div>
    </div>
  </div>
);

export const SkeletonMap: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
    <div className="p-4">
      <Skeleton height="h-8" width="w-1/3" className="mb-4" />
      <div className="space-y-2">
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-5/6" />
        <Skeleton height="h-4" width="w-4/6" />
      </div>
    </div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-b-lg animate-pulse" />
  </div>
);

export default Skeleton; 