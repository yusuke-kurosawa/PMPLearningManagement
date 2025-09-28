import { useEffect, useState, useRef, RefObject } from 'react'

export interface IntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | Document | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: IntersectionObserverOptions = {}
): IntersectionObserverEntry | undefined {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options

  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const frozen = useRef(false)

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  useEffect(() => {
    const node = elementRef?.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen.current || !node) {
      return
    }

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)

    return () => observer.disconnect()
  }, [elementRef, threshold, root, rootMargin])

  useEffect(() => {
    if (entry?.isIntersecting && freezeOnceVisible) {
      frozen.current = true
    }
  }, [entry, freezeOnceVisible])

  return entry
}

export function useIntersectionObserverMultiple(
  elementsRef: RefObject<Element[]>,
  options: IntersectionObserverOptions = {}
): Map<Element, IntersectionObserverEntry> {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options

  const [entries, setEntries] = useState<Map<Element, IntersectionObserverEntry>>(new Map())
  const frozen = useRef<Set<Element>>(new Set())

  const updateEntries = (observerEntries: IntersectionObserverEntry[]): void => {
    setEntries((prevEntries) => {
      const newEntries = new Map(prevEntries)

      observerEntries.forEach((entry) => {
        if (!frozen.current.has(entry.target)) {
          newEntries.set(entry.target, entry)

          if (entry.isIntersecting && freezeOnceVisible) {
            frozen.current.add(entry.target)
          }
        }
      })

      return newEntries
    })
  }

  useEffect(() => {
    const nodes = elementsRef?.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || !nodes || nodes.length === 0) {
      return
    }

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntries, observerParams)

    nodes.forEach((node) => {
      if (node && !frozen.current.has(node)) {
        observer.observe(node)
      }
    })

    return () => observer.disconnect()
  }, [elementsRef, threshold, root, rootMargin])

  return entries
}
