import type { CalculatorInput, CalculationResult, RoiData, ScenarioItem } from './types'
import { DB } from '../data/db'

export function useCalculator() {
  function calculate(input: CalculatorInput): CalculationResult | null {
    const catData = DB[input.category]
    if (!catData) return null
    const n = catData.subs[input.subniche]
    if (!n) return null

    const rm = input.region
    const budget = Math.max(1000, input.budget)
    const siteCR = input.siteCR / 100
    const chk = input.avgCheck
    const l2s = input.leadToSale / 100
    const mp = input.margin / 100
    const ltvRepeat = Math.max(1, input.ltvRepeat)

    const cMin = n.cpcMin * rm
    const cMax = n.cpcMax * rm
    const cAvg = (cMin + cMax) / 2

    const clMin = Math.floor(budget / cMax)
    const clMax = Math.floor(budget / cMin)
    const clAvg = Math.floor(budget / cAvg)
    const impr = Math.round(clAvg / n.ctr)

    const ldMin = Math.max(0, Math.floor(clMin * siteCR))
    const ldMax = Math.max(0, Math.floor(clMax * siteCR))
    const ldAvg = Math.max(0, Math.floor(clAvg * siteCR))

    const cplAvg = ldAvg > 0 ? budget / ldAvg : 0
    const cplMin = ldMax > 0 ? budget / ldMax : 0
    const cplMax = ldMin > 0 ? budget / ldMin : 0

    const sB = Math.round(budget * n.ss)
    const rB = budget - sB

    let rD: RoiData | null = null
    if (chk > 0 && ldAvg > 0) {
      const s = Math.round(ldAvg * l2s)
      const rev = s * chk
      const margin = rev * mp
      const profit = margin - budget
      const romi = budget > 0 ? (margin - budget) / budget * 100 : 0
      const ltvRev = rev * ltvRepeat
      const ltvMargin = ltvRev * mp
      const ltvProfit = ltvMargin - budget
      const ltvRomi = budget > 0 ? (ltvMargin - budget) / budget * 100 : 0
      rD = { s, rev, margin, profit, romi, ltvRepeat, ltvRev, ltvProfit, ltvRomi }
    }

    const bArr = [15000, 30000, 50000, 100000, 200000]
    if (!bArr.some(b => Math.abs(b - budget) < 5001)) {
      bArr.push(budget)
      bArr.sort((a, b) => a - b)
    }

    const scen: ScenarioItem[] = bArr.map(b => {
      const cl = Math.floor(b / cAvg)
      const ld = Math.floor(cl * siteCR)
      const cpl = ld > 0 ? b / ld : 0
      let romi: number | null = null
      if (chk > 0 && ld > 0) {
        const s2 = Math.round(ld * l2s)
        romi = (s2 * chk * mp - b) / b * 100
      }
      return { budget: b, clicks: cl, leads: ld, cpl, romi }
    })

    const testB = Math.max(15000, Math.round(cAvg * 200 / 1000) * 1000)
    const bFor30 = siteCR > 0 ? Math.round((30 / siteCR) * cAvg / 1000) * 1000 : 0

    return {
      n, catName: catData.label, catKey: input.category,
      budget, rm, cMin, cMax, cAvg,
      clMin, clMax, clAvg, impr,
      ldMin, ldMax, ldAvg,
      cplMin, cplMax, cplAvg,
      sB, rB, siteCR, rD, scen, testB, bFor30, ltvRepeat, mp
    }
  }

  return { calculate, DB }
}
