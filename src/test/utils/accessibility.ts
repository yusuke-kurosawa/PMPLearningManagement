import { axe, toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations)

// Default axe configuration for our app
const defaultAxeConfig = {
  rules: {
    // Enable color contrast checking
    'color-contrast': { enabled: true },
    // Enable keyboard navigation checking
    keyboard: { enabled: true },
    // Enable focus management checking
    'focus-order-semantics': { enabled: true },
    // Enable semantic structure checking
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    // Enable image alt text checking
    'image-alt': { enabled: true },
    // Enable form label checking
    label: { enabled: true },
    // Disable rules that might not apply to our SPA
    region: { enabled: false },
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
}

/**
 * Check accessibility violations for a given element
 * @param element - The DOM element to check
 * @param config - Optional axe configuration
 */
export const checkA11y = async (
  element: Element | Document = document.body,
  config = defaultAxeConfig
): Promise<void> => {
  const results = await axe(element, config)
  expect(results).toHaveNoViolations()
}

/**
 * Check accessibility with custom rules
 * @param element - The DOM element to check
 * @param rules - Custom rules configuration
 */
export const checkA11yWithRules = async (
  element: Element | Document,
  rules: Record<string, { enabled: boolean }>
): Promise<void> => {
  const config = {
    ...defaultAxeConfig,
    rules: { ...defaultAxeConfig.rules, ...rules },
  }
  await checkA11y(element, config)
}

/**
 * Check only color contrast violations
 * @param element - The DOM element to check
 */
export const checkColorContrast = async (element: Element | Document): Promise<void> => {
  await checkA11yWithRules(element, {
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: true },
  })
}

/**
 * Check only keyboard accessibility
 * @param element - The DOM element to check
 */
export const checkKeyboardA11y = async (element: Element | Document): Promise<void> => {
  await checkA11yWithRules(element, {
    keyboard: { enabled: true },
    'focus-order-semantics': { enabled: true },
    'focusable-content': { enabled: true },
  })
}

/**
 * Check only semantic structure
 * @param element - The DOM element to check
 */
export const checkSemanticStructure = async (element: Element | Document): Promise<void> => {
  await checkA11yWithRules(element, {
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'heading-order': { enabled: true },
    list: { enabled: true },
  })
}

/**
 * Check form accessibility
 * @param element - The DOM element to check
 */
export const checkFormA11y = async (element: Element | Document): Promise<void> => {
  await checkA11yWithRules(element, {
    label: { enabled: true },
    'label-title-only': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'required-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
  })
}

/**
 * Custom matcher to check if element has accessible name
 * @param element - The element to check
 */
export const hasAccessibleName = (element: Element): boolean => {
  return (
    element.getAttribute('aria-label') !== null ||
    element.getAttribute('aria-labelledby') !== null ||
    element.textContent?.trim() !== '' ||
    (element as HTMLInputElement).labels?.length > 0
  )
}

/**
 * Custom matcher to check if element is focusable
 * @param element - The element to check
 */
export const isFocusable = (element: Element): boolean => {
  const focusableElements = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ]

  return focusableElements.some((selector) => element.matches(selector))
}

/**
 * Get all focusable elements within a container
 * @param container - The container element
 */
export const getFocusableElements = (container: Element): Element[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors))
}

/**
 * Check if elements have proper tab order
 * @param elements - Array of elements to check
 */
export const checkTabOrder = (elements: Element[]): boolean => {
  const tabIndices = elements.map((el) => {
    const tabIndex = el.getAttribute('tabindex')
    return tabIndex ? parseInt(tabIndex, 10) : 0
  })

  // Check if tab order is sequential
  for (let i = 1; i < tabIndices.length; i++) {
    if (tabIndices[i] < tabIndices[i - 1] && tabIndices[i] !== 0) {
      return false
    }
  }

  return true
}

/**
 * Test helper to simulate keyboard navigation
 * @param element - Starting element
 * @param key - Key to press ('Tab', 'Shift+Tab', 'Enter', 'Space', etc.)
 */
export const simulateKeyPress = (element: Element, key: string): void => {
  const keyboardEvent = new KeyboardEvent('keydown', {
    key,
    shiftKey: key.includes('Shift'),
    bubbles: true,
  })

  element.dispatchEvent(keyboardEvent)
}

/**
 * Test helper to check skip links functionality
 * @param container - Container element
 */
export const checkSkipLinks = async (container: Element): Promise<void> => {
  const skipLinks = container.querySelectorAll('a[href^="#"]')

  skipLinks.forEach((link) => {
    const href = link.getAttribute('href')
    if (href && href.startsWith('#')) {
      const targetId = href.substring(1)
      const target = container.querySelector(`#${targetId}`)
      expect(target).toBeInTheDocument()
    }
  })
}

export default {
  checkA11y,
  checkA11yWithRules,
  checkColorContrast,
  checkKeyboardA11y,
  checkSemanticStructure,
  checkFormA11y,
  hasAccessibleName,
  isFocusable,
  getFocusableElements,
  checkTabOrder,
  simulateKeyPress,
  checkSkipLinks,
}
