import React, { useRef, useState, useEffect, useCallback, CSSProperties, memo } from 'react';
import { calculateVirtualScroll, VirtualScrollOptions } from '@/utils/performance';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { debounce } from '@/utils/performance';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  estimatedItemHeight?: number;
  getItemKey?: (item: T, index: number) => string | number;
  onScroll?: (scrollTop: number) => void;
  initialScrollTop?: number;
  scrollToItem?: number;
  scrollBehavior?: ScrollBehavior;
}

interface ItemPosition {
  index: number;
  offset: number;
  height: number;
}

const VirtualList = <T,>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  containerClassName = '',
  estimatedItemHeight = 50,
  getItemKey,
  onScroll,
  initialScrollTop = 0,
  scrollToItem,
  scrollBehavior = 'auto'
}: VirtualListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(initialScrollTop);
  const [containerHeight, setContainerHeight] = useState(600);
  const [itemPositions, setItemPositions] = useState<Map<number, ItemPosition>>(new Map());
  const measurementCache = useRef<Map<number, number>>(new Map());

  // Get item height with caching
  const getItemHeight = useCallback(
    (index: number, item: T): number => {
      if (typeof itemHeight === 'function') {
        // Check cache first
        if (measurementCache.current.has(index)) {
          return measurementCache.current.get(index)!;
        }

        const height = itemHeight(index, item);
        measurementCache.current.set(index, height);
        return height;
      }
      return itemHeight;
    },
    [itemHeight]
  );

  // Calculate virtual scroll parameters
  const virtualScrollResult = React.useMemo(() => {
    const options: VirtualScrollOptions = {
      itemHeight: (index) => getItemHeight(index, items[index]),
      containerHeight,
      totalItems: items.length,
      overscan,
      scrollTop
    };

    return calculateVirtualScroll(options);
  }, [items, containerHeight, scrollTop, overscan, getItemHeight]);

  const { startIndex, endIndex, offsetY, totalHeight } = virtualScrollResult;

  // Handle resize
  useResizeObserver(
    containerRef,
    debounce((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    }, 100)
  );

  // Handle scroll
  const handleScroll = useCallback(
    debounce((event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    }, 10),
    [onScroll]
  );

  // Scroll to specific item
  useEffect(() => {
    if (scrollToItem !== undefined && scrollElementRef.current) {
      let targetOffset = 0;
      for (let i = 0; i < Math.min(scrollToItem, items.length); i++) {
        targetOffset += getItemHeight(i, items[i]);
      }

      scrollElementRef.current.scrollTo({
        top: targetOffset,
        behavior: scrollBehavior
      });
    }
  }, [scrollToItem, items, getItemHeight, scrollBehavior]);

  // Render visible items
  const visibleItems = React.useMemo(() => {
    const elements: React.ReactNode[] = [];

    for (let i = startIndex; i <= endIndex && i < items.length; i++) {
      const item = items[i];
      const key = getItemKey ? getItemKey(item, i) : i;
      const height = getItemHeight(i, item);

      // Calculate item offset
      let itemOffset = 0;
      for (let j = 0; j < i; j++) {
        itemOffset += getItemHeight(j, items[j]);
      }

      const itemStyle: CSSProperties = {
        position: 'absolute',
        top: itemOffset,
        left: 0,
        right: 0,
        height,
        willChange: 'transform'
      };

      elements.push(
        <div key={key} style={itemStyle} data-index={i}>
          {renderItem(item, i)}
        </div>
      );
    }

    return elements;
  }, [startIndex, endIndex, items, renderItem, getItemKey, getItemHeight]);

  return (
    <div ref={containerRef} className={`relative ${containerClassName}`}>
      <div
        ref={scrollElementRef}
        className={`overflow-auto h-full ${className}`}
        onScroll={handleScroll}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          style={{
            height: totalHeight,
            position: 'relative'
          }}
        >
          {visibleItems}
        </div>
      </div>
    </div>
  );
};

// Memoized version for performance
export const MemoizedVirtualList = memo(VirtualList) as typeof VirtualList;

// Example usage component
export const VirtualListExample: React.FC = () => {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `This is item number ${i}`
  }));

  return (
    <MemoizedVirtualList
      items={items}
      itemHeight={80}
      renderItem={(item) => (
        <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
      )}
      getItemKey={(item) => item.id}
      containerClassName="h-96"
    />
  );
};

export default MemoizedVirtualList;