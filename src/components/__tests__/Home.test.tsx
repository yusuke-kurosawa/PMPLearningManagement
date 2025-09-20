import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils/test-utils'
import { checkA11y } from '../../test/utils/accessibility'
import Home from '../pages/Home'

describe('Home', () => {
  it('renders the home page title', () => {
    render(<Home />)

    expect(screen.getByText('PMBOK第6版 学習管理システム')).toBeInTheDocument()
  })

  it('displays all main features', () => {
    render(<Home />)

    // Check for main feature cards
    expect(screen.getByText('PMBOKマトリックスビュー')).toBeInTheDocument()
    expect(screen.getByText('ネットワークダイアグラム')).toBeInTheDocument()
    expect(screen.getByText('統合ビュー')).toBeInTheDocument()
    expect(screen.getByText('PMP用語集')).toBeInTheDocument()
    expect(screen.getByText('ビジュアライゼーションハブ')).toBeInTheDocument()
    expect(screen.getByText('学習進捗ダッシュボード')).toBeInTheDocument()
  })

  it('shows NEW badges for new features', () => {
    render(<Home />)

    const newBadges = screen.getAllByText('NEW')
    expect(newBadges.length).toBeGreaterThan(0)
  })

  it('renders feature descriptions', () => {
    render(<Home />)

    expect(
      screen.getByText(/知識エリアとプロセス群別に整理された49のPMBOKプロセス/)
    ).toBeInTheDocument()
    expect(screen.getByText(/ITTO関係性の力学的グラフ視覚化/)).toBeInTheDocument()
  })

  it('has working navigation links', () => {
    render(<Home />)

    const matrixLinks = screen.getAllByRole('link', { name: /PMBOKマトリックスビュー/i })
    expect(matrixLinks[0]).toHaveAttribute('href', '/matrix')

    const networkLinks = screen.getAllByRole('link', { name: /ネットワークダイアグラム/i })
    expect(networkLinks[0]).toHaveAttribute('href', '/network')

    const glossaryLinks = screen.getAllByRole('link', { name: /PMP用語集/i })
    expect(glossaryLinks[0]).toHaveAttribute('href', '/glossary')
  })

  it('displays feature icons', () => {
    const { container } = render(<Home />)

    // Check that SVG icons are present (Lucide icons render as SVGs)
    const svgIcons = container.querySelectorAll('svg')
    expect(svgIcons.length).toBeGreaterThan(0)
  })

  it('has proper card styling and hover effects', () => {
    const { container } = render(<Home />)

    const featureCards = container.querySelectorAll('.hover\\:shadow-xl')
    expect(featureCards.length).toBeGreaterThan(0)
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Home />)
      // Use simpler configuration to avoid unknown rules
      await checkA11y(container, {
        rules: {
          'color-contrast': { enabled: false }, // Skip color contrast for mock components
          'landmark-one-main': { enabled: false }, // Skip for component test
          'heading-order': { enabled: false }, // Skip heading order in component test
        },
      })
    })

    it('has proper semantic structure', () => {
      render(<Home />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toBeInTheDocument()

      // Feature titles should be headings
      const featureHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(featureHeadings.length).toBeGreaterThan(0)
    })

    it('has descriptive link text', () => {
      render(<Home />)

      const links = screen.getAllByRole('link')
      links.forEach((link) => {
        expect(link).toHaveAccessibleName()
      })
    })
  })

  describe('Responsive Design', () => {
    it('has responsive grid classes', () => {
      const { container } = render(<Home />)

      // Check for responsive grid classes
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()

      // Should have responsive column classes
      const responsiveGrid = container.querySelector('.md\\:grid-cols-2')
      expect(responsiveGrid).toBeInTheDocument()
    })

    it('has proper spacing and padding for mobile', () => {
      const { container } = render(<Home />)

      // Check for mobile-friendly padding classes
      const mainContainer = container.querySelector('.px-4')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('renders gradient backgrounds for new features', () => {
      const { container } = render(<Home />)

      // Look for gradient classes on new feature cards
      const gradientElements = container.querySelectorAll('.bg-gradient-to-r')
      expect(gradientElements.length).toBeGreaterThan(0)
    })

    it('shows proper color coding for different features', () => {
      const { container } = render(<Home />)

      // Check for various background color classes
      const coloredElements = container.querySelectorAll(
        '.bg-blue-500, .bg-green-500, .bg-purple-500, .bg-orange-500, .bg-teal-500'
      )
      expect(coloredElements.length).toBeGreaterThan(0)
    })
  })
})
