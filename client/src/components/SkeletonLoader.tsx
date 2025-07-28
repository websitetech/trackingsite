import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'table-row' | 'button' | 'circle';
  width?: string;
  height?: string;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  width = '100%', 
  height = '1rem',
  className = ''
}) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-amber-100 to-amber-200 rounded';
  
  const getSkeletonClasses = () => {
    switch (type) {
      case 'text':
        return `${baseClasses} h-4`;
      case 'card':
        return `${baseClasses} h-32 rounded-lg`;
      case 'table-row':
        return `${baseClasses} h-12 rounded-md`;
      case 'button':
        return `${baseClasses} h-10 rounded-md`;
      case 'circle':
        return `${baseClasses} rounded-full`;
      default:
        return baseClasses;
    }
  };

  return (
    <div 
      className={`${getSkeletonClasses()} ${className}`}
      style={{ width, height }}
    />
  );
};

// Skeleton components for specific use cases
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonLoader key={i} type="text" width="120px" height="1.5rem" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <SkeletonLoader key={j} type="text" width="120px" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
    <SkeletonLoader type="text" width="60%" height="1.5rem" />
    <SkeletonLoader type="text" width="80%" />
    <SkeletonLoader type="text" width="40%" />
    <div className="flex space-x-2">
      <SkeletonLoader type="button" width="80px" />
      <SkeletonLoader type="button" width="80px" />
    </div>
  </div>
);

export const TrackingCardSkeleton: React.FC = () => (
  <div className="tracking-card">
    <div className="flex flex-col items-center space-y-4">
      <SkeletonLoader type="circle" width="60px" height="60px" />
      <SkeletonLoader type="text" width="200px" height="1.5rem" />
      <SkeletonLoader type="text" width="150px" />
      <SkeletonLoader type="button" width="180px" height="48px" />
    </div>
  </div>
);

export default SkeletonLoader; 