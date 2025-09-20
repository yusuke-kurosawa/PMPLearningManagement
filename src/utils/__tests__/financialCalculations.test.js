import { describe, it, expect } from 'vitest'
import * as calc from '../financialCalculations'

describe('Financial Calculations', () => {
  describe('calculatePV', () => {
    it('should calculate present value correctly', () => {
      const pv = calc.calculatePV(1000, 10, 1)
      expect(pv).toBeCloseTo(909.09, 2)
    })

    it('should return future value when rate is 0', () => {
      const pv = calc.calculatePV(1000, 0, 5)
      expect(pv).toBe(1000)
    })
  })

  describe('calculateNPV', () => {
    it('should calculate positive NPV for profitable project', () => {
      const npv = calc.calculateNPV(1000, [400, 500, 600], 10)
      expect(npv).toBeCloseTo(227.65, 2)
    })

    it('should calculate negative NPV for unprofitable project', () => {
      const npv = calc.calculateNPV(1000, [200, 200, 200], 10)
      expect(npv).toBeCloseTo(-502.63, 2)
    })
  })

  describe('calculateROI', () => {
    it('should calculate ROI correctly', () => {
      const roi = calc.calculateROI(1500, 1000)
      expect(roi).toBe(50)
    })

    it('should return 0 when investment is 0', () => {
      const roi = calc.calculateROI(1000, 0)
      expect(roi).toBe(0)
    })
  })

  describe('calculatePaybackPeriod', () => {
    it('should calculate payback period correctly', () => {
      const payback = calc.calculatePaybackPeriod(1000, [400, 400, 400])
      expect(payback).toBe(2.5)
    })

    it('should return null if investment cannot be recovered', () => {
      const payback = calc.calculatePaybackPeriod(1000, [100, 100, 100])
      expect(payback).toBeNull()
    })
  })

  describe('calculateBCR', () => {
    it('should calculate benefit-cost ratio correctly', () => {
      const bcr = calc.calculateBCR([500, 600, 700], [300, 300, 300], 10)
      expect(bcr).toBeGreaterThan(1)
    })

    it('should return 0 when costs are 0', () => {
      const bcr = calc.calculateBCR([500, 600], [], 10)
      expect(bcr).toBe(0)
    })
  })

  describe('calculateIRR', () => {
    it('should calculate IRR for simple project', () => {
      const irr = calc.calculateIRR(1000, [500, 600])
      expect(irr).toBeCloseTo(6.4, 1)
    })

    it('should return null for projects with no positive cash flows', () => {
      const irr = calc.calculateIRR(1000, [-100, -100])
      expect(irr).toBeNull()
    })
  })

  describe('formatFinancialValue', () => {
    it('should format currency correctly', () => {
      const formatted = calc.formatFinancialValue(1234567, 'currency')
      expect(formatted).toContain('￥')
      expect(formatted).toContain('1,234,567')
    })

    it('should format percentage correctly', () => {
      const formatted = calc.formatFinancialValue(12.345, 'percent')
      expect(formatted).toBe('12.35%')
    })

    it('should format years correctly', () => {
      const formatted = calc.formatFinancialValue(2.5, 'years')
      expect(formatted).toBe('2.5年')
    })

    it('should format months for values less than 1 year', () => {
      const formatted = calc.formatFinancialValue(0.5, 'years')
      expect(formatted).toBe('6ヶ月')
    })

    it('should return N/A for null values', () => {
      const formatted = calc.formatFinancialValue(null, 'currency')
      expect(formatted).toBe('N/A')
    })
  })

  describe('evaluateMetric', () => {
    it('should evaluate NPV correctly', () => {
      const excellent = calc.evaluateMetric('npv', 15000000)
      expect(excellent.level).toBe('excellent')
      expect(excellent.label).toBe('優秀')

      const poor = calc.evaluateMetric('npv', -10000000)
      expect(poor.level).toBe('poor')
      expect(poor.label).toBe('要改善')
    })

    it('should evaluate IRR correctly', () => {
      const excellent = calc.evaluateMetric('irr', 25)
      expect(excellent.level).toBe('excellent')

      const good = calc.evaluateMetric('irr', 17)
      expect(good.level).toBe('good')
    })

    it('should evaluate payback period correctly', () => {
      const excellent = calc.evaluateMetric('payback', 1.5)
      expect(excellent.level).toBe('excellent')

      const poor = calc.evaluateMetric('payback', null)
      expect(poor.level).toBe('poor')
    })

    it('should return unknown for invalid metrics', () => {
      const unknown = calc.evaluateMetric('invalid', 100)
      expect(unknown.level).toBe('unknown')
    })
  })

  describe('rankProjects', () => {
    it('should rank projects by total score', () => {
      const projects = [
        {
          name: 'Project A',
          initialInvestment: 1000,
          cashFlows: [100, 200, 300],
          discountRate: 10,
        },
        {
          name: 'Project B',
          initialInvestment: 1000,
          cashFlows: [500, 600, 700],
          discountRate: 10,
        },
      ]

      const ranked = calc.rankProjects(projects)
      expect(ranked[0].name).toBe('Project B')
      expect(ranked[0].totalScore).toBeGreaterThan(ranked[1].totalScore)
    })
  })

  describe('performSensitivityAnalysis', () => {
    it('should perform sensitivity analysis correctly', () => {
      const baseCase = {
        initialInvestment: 1000,
        cashFlows: [500, 600],
        discountRate: 10,
        npv: 100,
      }

      const results = calc.performSensitivityAnalysis(baseCase, 'initialInvestment', [-10, 0, 10])

      expect(results).toHaveLength(3)
      expect(results[0].variation).toBe(-10)
      expect(results[1].variation).toBe(0)
      expect(results[2].variation).toBe(10)
    })
  })
})
