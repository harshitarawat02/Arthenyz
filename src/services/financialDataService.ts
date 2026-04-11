export type FinancialDataResponse = {
  nfi: number[]
  cost_projection: number[]
  risks: {
    type: string
    confidence: number
    impact: number
    nfi: number
  }[]
  actions: {
    timestamp: string
    action: string
    saved: number
  }[]
}

export async function fetchFinancialData(): Promise<FinancialDataResponse> {
  const res = await fetch("http://localhost:8000/financial-data")

  if (!res.ok) {
    throw new Error("Failed to fetch financial data")
  }

  return await res.json()
}

// 🔧 THIS was missing
export function getDataModeLabel() {
  return "Live AI Intelligence"
}