import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useVirtualScroll } from '../hooks/usePerformance';

const VirtualizedList = memo(({
  items = [],
  itemHeight = 80,
  containerHeight = 400,
  renderItem,
  keyExtractor,
  className = '',
  emptyComponent: EmptyComponent,
  loadingComponent: LoadingComponent,
  isLoading = false,
  ...props
}) => {
  const { visibleItems, onScroll } = useVirtualScroll(items, itemHeight, containerHeight);

  const handleScroll = useCallback((e) => {
    onScroll(e);
  }, [onScroll]);

  const memoizedItems = useMemo(() => {
    return visibleItems.items.map((item, index) => {
      const actualIndex = visibleItems.startIndex + index;
      const key = keyExtractor ? keyExtractor(item, actualIndex) : actualIndex;
      
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: index * 0.02 }}
          style={{
            height: itemHeight,
            position: 'absolute',
            top: visibleItems.offsetY + (index * itemHeight),
            left: 0,
            right: 0,
          }}
        >
          {renderItem(item, actualIndex)}
        </motion.div>
      );
    });
  }, [visibleItems, itemHeight, renderItem, keyExtractor]);

  if (isLoading && LoadingComponent) {
    return <LoadingComponent />;
  }

  if (items.length === 0 && EmptyComponent) {
    return <EmptyComponent />;
  }

  return (
    <div
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div
        style={{
          height: visibleItems.totalHeight,
          position: 'relative',
        }}
      >
        {memoizedItems}
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// Memoized list item wrapper
export const ListItem = memo(({ 
  children, 
  className = '',
  onClick,
  ...props 
}) => {
  return (
    <div
      className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

ListItem.displayName = 'ListItem';

export default VirtualizedList; 