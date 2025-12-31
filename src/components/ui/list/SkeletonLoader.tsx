import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'document' | 'family' | 'date' | 'generic';
  className?: string;
}

const shimmerAnimation = {
  x: ['-100%', '100%'],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  },
};

const DocumentSkeleton: React.FC = () => (
  <div className="
    bg-white/80 dark:bg-zinc-900/80
    backdrop-blur-[40px] backdrop-saturate-[130%]
    border border-black/8 dark:border-white/12
    rounded-2xl
    p-4 md:p-5 lg:p-6
    mb-3
    flex items-center gap-4
    overflow-hidden
    relative
  ">
    {/* Shimmer effect */}
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
        animate={shimmerAnimation}
      />
    </div>

    {/* Thumbnail */}
    <div className="
      w-[60px] h-[75px] md:w-[80px] md:h-[100px]
      bg-gray-200/40 dark:bg-gray-700/40
      rounded-xl
      flex-shrink-0
    " />

    {/* Content */}
    <div className="flex-1 space-y-3">
      {/* Title */}
      <div className="h-5 md:h-6 bg-gray-200/40 dark:bg-gray-700/40 rounded-lg w-3/4" />

      {/* Badge */}
      <div className="h-4 bg-gray-200/40 dark:bg-gray-700/40 rounded-full w-1/3" />

      {/* Meta */}
      <div className="h-3 bg-gray-200/40 dark:bg-gray-700/40 rounded w-1/2" />
    </div>

    {/* Status badge */}
    <div className="
      w-20 md:w-24 h-7 md:h-8
      bg-gray-200/40 dark:bg-gray-700/40
      rounded-full
      flex-shrink-0
    " />

    {/* Action button */}
    <div className="
      w-10 h-10 md:w-11 md:h-11
      bg-gray-200/40 dark:bg-gray-700/40
      rounded-full
      flex-shrink-0
    " />
  </div>
);

const FamilySkeleton: React.FC = () => (
  <div className="
    bg-white/80 dark:bg-zinc-900/80
    backdrop-blur-[40px] backdrop-saturate-[130%]
    border border-black/8 dark:border-white/12
    rounded-2xl
    p-4 md:p-5 lg:p-6
    mb-3
    flex items-center gap-4
    overflow-hidden
    relative
  ">
    {/* Shimmer effect */}
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
        animate={shimmerAnimation}
      />
    </div>

    {/* Avatar */}
    <div className="
      w-14 h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]
      bg-gray-200/40 dark:bg-gray-700/40
      rounded-full
      flex-shrink-0
    " />

    {/* Content */}
    <div className="flex-1 space-y-2">
      {/* Name */}
      <div className="h-5 md:h-6 bg-gray-200/40 dark:bg-gray-700/40 rounded-lg w-2/5" />

      {/* Relationship */}
      <div className="h-4 bg-gray-200/40 dark:bg-gray-700/40 rounded w-1/4" />

      {/* Document count */}
      <div className="h-3 bg-gray-200/40 dark:bg-gray-700/40 rounded w-1/3" />
    </div>

    {/* Status badge */}
    <div className="
      w-24 h-7
      bg-gray-200/40 dark:bg-gray-700/40
      rounded-full
      flex-shrink-0
    " />

    {/* Action button */}
    <div className="
      w-10 h-10 md:w-11 md:h-11
      bg-gray-200/40 dark:bg-gray-700/40
      rounded-full
      flex-shrink-0
    " />
  </div>
);

const DateSkeleton: React.FC = () => (
  <div className="
    bg-white/80 dark:bg-zinc-900/80
    backdrop-blur-[40px] backdrop-saturate-[130%]
    border border-black/8 dark:border-white/12
    rounded-2xl
    p-4 md:p-5 lg:p-6
    mb-3
    flex items-center gap-4
    overflow-hidden
    relative
  ">
    {/* Shimmer effect */}
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
        animate={shimmerAnimation}
      />
    </div>

    {/* Date box */}
    <div className="
      w-16 h-16 md:w-[72px] md:h-[72px]
      bg-gray-200/40 dark:bg-gray-700/40
      rounded-2xl
      flex-shrink-0
    " />

    {/* Content */}
    <div className="flex-1 space-y-2">
      {/* Event name */}
      <div className="h-5 md:h-6 bg-gray-200/40 dark:bg-gray-700/40 rounded-lg w-3/5" />

      {/* Category */}
      <div className="h-4 bg-gray-200/40 dark:bg-gray-700/40 rounded-full w-1/4" />

      {/* Countdown */}
      <div className="h-3 bg-gray-200/40 dark:bg-gray-700/40 rounded w-1/3" />
    </div>

    {/* Action button */}
    <div className="
      w-10 h-10 md:w-11 md:h-11
      bg-gray-200/40 dark:bg-gray-700/40
      rounded-full
      flex-shrink-0
    " />
  </div>
);

const GenericSkeleton: React.FC = () => (
  <div className="
    bg-white/80 dark:bg-zinc-900/80
    backdrop-blur-[40px] backdrop-saturate-[130%]
    border border-black/8 dark:border-white/12
    rounded-2xl
    p-4 md:p-5 lg:p-6
    mb-3
    overflow-hidden
    relative
  ">
    {/* Shimmer effect */}
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
        animate={shimmerAnimation}
      />
    </div>

    <div className="space-y-3">
      <div className="h-5 bg-gray-200/40 dark:bg-gray-700/40 rounded-lg w-3/4" />
      <div className="h-4 bg-gray-200/40 dark:bg-gray-700/40 rounded w-1/2" />
      <div className="h-3 bg-gray-200/40 dark:bg-gray-700/40 rounded w-2/3" />
    </div>
  </div>
);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 5,
  type = 'generic',
  className = '',
}) => {
  const SkeletonComponent = {
    document: DocumentSkeleton,
    family: FamilySkeleton,
    date: DateSkeleton,
    generic: GenericSkeleton,
  }[type];

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};
