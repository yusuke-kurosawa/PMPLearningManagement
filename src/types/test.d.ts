import '@testing-library/jest-dom'
import 'vitest/globals'

declare global {
  namespace Vi {
    interface Assertion<T = unknown> extends jest.Matchers<void, T> {
      toHaveNoViolations(): T
    }
  }
}

// Extend Vitest's expect interface
declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T
  }
}

// Add type declarations for Touch events
interface Touch {
  identifier: number
  target: EventTarget
  screenX: number
  screenY: number
  clientX: number
  clientY: number
  pageX: number
  pageY: number
  radiusX?: number
  radiusY?: number
  rotationAngle?: number
  force?: number
}

interface _TouchList {
  length: number
  item(index: number): Touch | null
  [index: number]: Touch
}

// interface TouchEvent extends UIEvent {
//   touches: TouchList
//   targetTouches: TouchList
//   changedTouches: TouchList
//   altKey: boolean
//   metaKey: boolean
//   ctrlKey: boolean
//   shiftKey: boolean
// }

// Add missing properties to global objects for testing
declare global {
  interface Window {
    scrollTo: jest.Mock | ((x: number, y: number) => void)
    matchMedia: jest.Mock | ((query: string) => MediaQueryList)
  }

  interface Navigator {
    maxTouchPoints?: number
  }
}

export {}
