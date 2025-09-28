import { useEffect, useRef, useState, RefObject } from 'react';

export type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;

export interface ResizeObserverOptions {
  box?: 'border-box' | 'content-box' | 'device-pixel-content-box';
}

export function useResizeObserver(
  ref: RefObject<Element>,
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      callbackRef.current(entries);
    });

    if (options?.box) {
      observer.observe(element, { box: options.box });
    } else {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options?.box]);
}

export interface ElementDimensions {
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export function useElementDimensions(
  ref: RefObject<Element>
): ElementDimensions | null {
  const [dimensions, setDimensions] = useState<ElementDimensions | null>(null);

  useResizeObserver(ref, (entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      const rect = entry.target.getBoundingClientRect();

      setDimensions({
        width,
        height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right
      });
    }
  });

  return dimensions;
}