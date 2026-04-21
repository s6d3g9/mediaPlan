export interface SubnicheData {
  name: string
  cpcMin: number
  cpcMax: number
  ctr: number
  cr: number
  ss: number
  comp: string
  keys: string[]
  season: number[]
  tip: string
}

export interface CategoryData {
  label: string
  subs: Record<string, SubnicheData>
}

export interface CalculatorInput {
  category: string
  subniche: string
  region: number
  budget: number
  siteCR: number
  avgCheck: number
  leadToSale: number
  margin: number
  ltvRepeat: number
}

export interface RoiData {
  s: number
  rev: number
  margin: number
  profit: number
  romi: number
  ltvRepeat: number
  ltvRev: number
  ltvProfit: number
  ltvRomi: number
}

export interface ScenarioItem {
  budget: number
  clicks: number
  leads: number
  cpl: number
  romi: number | null
}

export interface CalculationResult {
  n: SubnicheData
  catName: string
  catKey: string
  budget: number
  rm: number
  cMin: number
  cMax: number
  cAvg: number
  clMin: number
  clMax: number
  clAvg: number
  impr: number
  ldMin: number
  ldMax: number
  ldAvg: number
  cplMin: number
  cplMax: number
  cplAvg: number
  sB: number
  rB: number
  siteCR: number
  rD: RoiData | null
  scen: ScenarioItem[]
  testB: number
  bFor30: number
  ltvRepeat: number
  mp: number
}
