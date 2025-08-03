import { useState, useEffect, useRef, useMemo, memo } from 'react';

const VirtualList = memo(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef();

  const { visibleStart, visibleEnd, totalHeight } = useMemo(() => {
    const itemCount = items.length;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + visibleCount + overscan, itemCount);
    
    return {
      visibleStart: Math.max(0, start - overscan),
      visibleEnd: end,
      totalHeight: itemCount * itemHeight,
    };
  }, [items.length, itemHeight, containerHeight, scrollTop, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleStart, visibleEnd).map((item, index) => ({
      item,
      index: visibleStart + index,
    }));
  }, [items, visibleStart, visibleEnd]);

  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      {...props}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleStart * itemHeight}px)`,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={item.id || index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

export default VirtualList;