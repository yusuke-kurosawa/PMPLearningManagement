import { configureAxe } from 'jest-axe'

// Configure axe for our specific needs
const axe = configureAxe({
  rules: {
    // Disable some rules for SPA testing
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    // Color contrast - we'll test this separately
    'color-contrast': { enabled: true },
    // Focus management
    'focus-order-semantics': { enabled: true },
    // ARIA
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    // Headings
    'heading-order': { enabled: true },
    // Images
    'image-alt': { enabled: true },
    // Forms
    label: { enabled: true },
    // Links
    'link-name': { enabled: true },
    'link-in-text-block': { enabled: false }, // Often false positive with buttons
    // Interactive elements
    'interactive-supports-focus': { enabled: true },
    'click-events-have-key-events': { enabled: true },
  },
})

export const checkA11y = async (
  container: HTMLElement | Document = document.body,
  options?: unknown
) => {
  const results = await axe(container, options)

  if (results.violations.length > 0) {
    const violationMessages = results.violations.map((violation) => {
      const targets = violation.nodes.map((node) => node.target.join(' ')).join(', ')
      return `${violation.id}: ${violation.description} (${violation.help}) - Elements: ${targets}`
    })

    throw new Error(`Accessibility violations found:\n${violationMessages.join('\n')}`)
  }

  return results
}

// Test specific accessibility patterns
export const testKeyboardNavigation = async (element: HTMLElement) => {
  // Test Tab navigation
  const focusableElements = element.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  )

  if (focusableElements.length === 0) {
    return // No focusable elements
  }

  // Test that all interactive elements can receive focus
  focusableElements.forEach((el, index) => {
    const htmlEl = el as HTMLElement
    if (htmlEl.tabIndex < 0 && !htmlEl.hasAttribute('disabled')) {
      throw new Error(`Element ${el.tagName} at index ${index} cannot receive keyboard focus`)
    }
  })
}

export const testAriaLabels = (container: HTMLElement) => {
  // Check buttons without accessible names
  const buttons = container.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
  buttons.forEach((button, index) => {
    if (!button.textContent?.trim()) {
      throw new Error(`Button at index ${index} has no accessible name`)
    }
  })

  // Check inputs without labels
  const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id')
    if (!id || !container.querySelector(`label[for="${id}"]`)) {
      throw new Error(`Input at index ${index} has no associated label`)
    }
  })
}

export const testColorContrast = async (container: HTMLElement) => {
  // This would typically use a color contrast checking library
  // For now, we'll do basic checks
  const elementsWithBackgroundColor = container.querySelectorAll(
    '[style*="background-color"], [style*="color"]'
  )

  // Basic check - ensure we don't have common problematic combinations
  elementsWithBackgroundColor.forEach((el) => {
    const style = (el as HTMLElement).style
    const bgColor = style.backgroundColor
    const color = style.color

    // Check for some obviously problematic combinations
    if (
      (bgColor === 'white' && color === 'lightgray') ||
      (bgColor === 'gray' && color === 'darkgray')
    ) {
      throw new Error(`Poor color contrast detected on element: ${el.tagName}`)
    }
  })
}

// Utility to test specific ARIA patterns
export const testAriaPatterns = {
  disclosure: (element: HTMLElement) => {
    const trigger = element.querySelector('[aria-expanded]')
    const content = element.querySelector('[aria-hidden]')

    if (trigger && content) {
      const expanded = trigger.getAttribute('aria-expanded') === 'true'
      const hidden = content.getAttribute('aria-hidden') === 'true'

      if (expanded === hidden) {
        throw new Error('Disclosure pattern: aria-expanded and aria-hidden states are inconsistent')
      }
    }
  },

  tabpanel: (element: HTMLElement) => {
    const tabs = element.querySelectorAll('[role="tab"]')
    const panels = element.querySelectorAll('[role="tabpanel"]')

    if (tabs.length !== panels.length) {
      throw new Error(
        `Tab pattern: Number of tabs (${tabs.length}) doesn't match panels (${panels.length})`
      )
    }

    tabs.forEach((tab, index) => {
      const controls = tab.getAttribute('aria-controls')
      const panel = panels[index]

      if (!controls || !panel || panel.id !== controls) {
        throw new Error(`Tab pattern: Tab ${index} doesn't properly control its panel`)
      }
    })
  },
}
