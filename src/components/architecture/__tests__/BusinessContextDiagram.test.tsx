import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import BusinessContextDiagram from '../BusinessContextDiagram'

describe('BusinessContextDiagram', () => {
  it('renders the diagram title', () => {
    render(
      <BrowserRouter>
        <BusinessContextDiagram />
      </BrowserRouter>
    )

    expect(screen.getByText('Business Context Diagram')).toBeInTheDocument()
    expect(screen.getByText(/PMP Learning Management System/)).toBeInTheDocument()
  })

  it('renders zoom controls', () => {
    render(
      <BrowserRouter>
        <BusinessContextDiagram />
      </BrowserRouter>
    )

    // Check for zoom controls
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders legend', () => {
    render(
      <BrowserRouter>
        <BusinessContextDiagram />
      </BrowserRouter>
    )

    expect(screen.getByText('Legend')).toBeInTheDocument()
  })
})
