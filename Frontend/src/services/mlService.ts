import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

// ── Dedicated silent axios instance for ML calls ──────────────────────────────
// Does NOT use the global api.ts interceptor so a 401/500 from the ML service
// never triggers an app-wide logout. Errors are caught locally in the component.
const mlApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token if available — but swallow all errors silently
mlApi.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ExpenseForecast {
  predictedExpense: number
  trend: string
  trendAmount: number
  confidence: string
  r2Score: number
  model: string
  message: string
  monthsUsed: number
}

export interface SpendingCluster {
  clusterId: number
  label: string
  categories: string[]
  totalSpend: number
  avgTransaction: number
  transactionCount: number
}

export interface SpendingPatterns {
  clusters: SpendingCluster[]
  totalCategories: number
  model: string
  insight: string
}

export interface BudgetRec {
  category: string
  currentAvgMonthly: number
  predictedNextMonth?: number
  recommendedBudget: number
  potentialSaving: number
  r2Score?: number
  model: string
  confidence: string
}

export interface BudgetRecommendation {
  recommendations: BudgetRec[]
  totalPotentialSaving: number
  model: string
  summary: string
}

// ── API calls — each returns null on failure (never throws) ───────────────────
export const fetchExpenseForecast = (): Promise<ExpenseForecast | null> =>
  mlApi.get('/finance/insights/forecast')
    .then(r => r.data)
    .catch(() => null)

export const fetchSpendingPatterns = (): Promise<SpendingPatterns | null> =>
  mlApi.get('/finance/insights/spending-patterns')
    .then(r => r.data)
    .catch(() => null)

export const fetchBudgetRecommendations = (): Promise<BudgetRecommendation | null> =>
  mlApi.get('/finance/insights/budget-recommendation')
    .then(r => r.data)
    .catch(() => null)
