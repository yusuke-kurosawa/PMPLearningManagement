// Utility functions for performance optimization

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoizeProcessData = () => {
  const cache = new Map();
  
  return (key, computeFn) => {
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = computeFn();
    cache.set(key, result);
    return result;
  };
};

// Virtual scrolling helper for large lists
export const virtualScroll = (items, containerHeight, itemHeight, scrollTop) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
  const visibleItems = items.slice(startIndex, endIndex);
  
  return {
    visibleItems,
    startIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
};

// Batch DOM updates
export const batchUpdate = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};