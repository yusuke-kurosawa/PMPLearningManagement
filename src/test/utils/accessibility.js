/**
 * テストケース実装
 * Developer 8: 品質保証エンジニア
 * テストタイプ: {test_type}
 * 対象: {target}
 * 最終更新: {updated}
 */
import { configureAxe } from 'jest-axe'

// Configure axe for accessibility testing
export const axe = configureAxe({
  rules: {
    // Enable common accessibility rules
    'color-contrast': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    bypass: { enabled: true },
    'document-title': { enabled: true },
    'duplicate-id': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'image-alt': { enabled: true },
    'input-image-alt': { enabled: true },
    label: { enabled: true },
    'landmark-one-main': { enabled: true },
    'link-name': { enabled: true },
    list: { enabled: true },
    listitem: { enabled: true },
    'page-has-heading-one': { enabled: true },
    region: { enabled: true },
  },
})

// Helper function to check accessibility violations
export const checkA11y = async (container, options = {}) => {
  const results = await axe(container, options)
  expect(results).toHaveNoViolations()
  return results
}

// Custom matcher for accessibility violations
expect.extend({
  toHaveNoAccessibilityViolations(received) {
    const violations = received.violations || []
    const pass = violations.length === 0

    if (pass) {
      return {
        message: () => `Expected element to have accessibility violations, but it had none`,
        pass: true,
      }
    } else {
      const violationMessages = violations
        .map(
          (violation) =>
            `${violation.id}: ${violation.description}\n  Elements: ${violation.nodes.map((node) => node.target).join(', ')}`
        )
        .join('\n')

      return {
        message: () => `Expected no accessibility violations, but found:\n${violationMessages}`,
        pass: false,
      }
    }
  },
})

// Keyboard navigation helpers
export const pressTab = (element) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab' }))
}

export const pressEnter = (element) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' }))
}

export const pressEscape = (element) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' }))
}

export const pressSpace = (element) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }))
}

export const pressArrowDown = (element) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown' }))
}

export const pressArrowUp = (element) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' }))
}
