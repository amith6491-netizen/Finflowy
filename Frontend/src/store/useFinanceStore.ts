import { create } from 'zustand'
import api from '../services/api'

export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  description: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  probability: number
  deadline: string
  priorityWeight: number
}

interface Insight {
  id: string
  type: 'warning' | 'success' | 'info'
  message: string
}

interface FinanceState {
  transactions: Transaction[]
  goals: Goal[]
  insights: Insight[]
  isLoading: boolean

  // Data loading (calls backend)
  loadTransactions: () => Promise<void>
  loadGoals: () => Promise<void>

  // CRUD — calls backend + updates local state
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  addGoal: (g: Omit<Goal, 'id'>) => Promise<void>
  removeGoal: (id: string) => void

  clearData: () => void
}

// ── Helper: map MongoDB _id → id ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTx(raw: any): Transaction {
  return {
    id: raw._id ?? raw.id ?? Math.random().toString(),
    amount: raw.amount,
    type: raw.type,
    category: raw.category,
    date: (raw.date ?? '').substring(0, 10),
    description: raw.description ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGoal(raw: any): Goal {
  return {
    id: raw._id ?? raw.id ?? Math.random().toString(),
    name: raw.name,
    targetAmount: raw.targetAmount,
    currentAmount: raw.currentAmount ?? 0,
    probability: raw.probability ?? 50,
    deadline: (raw.deadline ?? '').substring(0, 10),
    priorityWeight: raw.priorityWeight ?? 1,
  }
}

// ── ML-style client-side insight engine ──────────────────────────────────────
function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7)
}

function generateInsights(allTransactions: Transaction[]): Insight[] {
  const newInsights: Insight[] = []

  const monthCategoryMap: Record<string, Record<string, number>> = {}
  const monthIncomeMap: Record<string, number> = {}
  const monthExpenseMap: Record<string, number> = {}

  allTransactions.forEach(t => {
    const month = getMonthKey(t.date)
    if (!monthCategoryMap[month]) monthCategoryMap[month] = {}
    if (!monthIncomeMap[month]) monthIncomeMap[month] = 0
    if (!monthExpenseMap[month]) monthExpenseMap[month] = 0

    if (t.type === 'expense') {
      const cat = t.category.trim()
      monthCategoryMap[month][cat] = (monthCategoryMap[month][cat] || 0) + t.amount
      monthExpenseMap[month] += t.amount
    } else {
      monthIncomeMap[month] += t.amount
    }
  })

  const sortedMonths = Object.keys(monthCategoryMap).sort()
  const currentMonth = sortedMonths[sortedMonths.length - 1]
  const prevMonth = sortedMonths.length >= 2 ? sortedMonths[sortedMonths.length - 2] : null

  // Month-over-month category comparison
  if (currentMonth && prevMonth) {
    const currentCats = monthCategoryMap[currentMonth] || {}
    const prevCats = monthCategoryMap[prevMonth] || {}
    const allCats = new Set([...Object.keys(currentCats), ...Object.keys(prevCats)])

    allCats.forEach(cat => {
      const curr = currentCats[cat] || 0
      const prev = prevCats[cat] || 0
      if (prev === 0 || curr === 0) return
      const diff = curr - prev
      const pct = (diff / prev) * 100

      if (pct >= 20) {
        newInsights.push({
          id: `cat-up-${cat}-${currentMonth}`,
          type: 'warning',
          message: `📈 You spent ₹${curr.toLocaleString('en-IN', { maximumFractionDigits: 0 })} on ${cat} this month — that's ${pct.toFixed(0)}% more than last month (₹${prev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}). Consider reviewing your ${cat.toLowerCase()} budget.`
        })
      } else if (pct <= -20) {
        newInsights.push({
          id: `cat-down-${cat}-${currentMonth}`,
          type: 'success',
          message: `✅ Great discipline! Your ${cat} spending dropped by ${Math.abs(pct).toFixed(0)}% this month — from ₹${prev.toLocaleString('en-IN', { maximumFractionDigits: 0 })} to ₹${curr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}. Keep it up!`
        })
      }
    })
  }

  // Savings rate insight
  if (currentMonth) {
    const inc = monthIncomeMap[currentMonth] || 0
    const exp = monthExpenseMap[currentMonth] || 0
    if (inc > 0) {
      const rate = ((inc - exp) / inc) * 100
      if (rate >= 30) {
        newInsights.push({
          id: `savings-great-${currentMonth}`,
          type: 'success',
          message: `🎯 Excellent savings rate of ${rate.toFixed(1)}% this month! You saved ₹${(inc - exp).toLocaleString('en-IN', { maximumFractionDigits: 0 })} out of ₹${inc.toLocaleString('en-IN', { maximumFractionDigits: 0 })} income.`
        })
      } else if (rate < 10 && exp > 0) {
        newInsights.push({
          id: `savings-low-${currentMonth}`,
          type: 'warning',
          message: `⚠️ Your savings rate is only ${rate.toFixed(1)}% this month. Try cutting discretionary spending to build a stronger financial cushion.`
        })
      }
    }

    // Top spending category alert
    const cats = monthCategoryMap[currentMonth] || {}
    const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]
    if (topCat && (monthExpenseMap[currentMonth] || 0) > 0) {
      const topPct = (topCat[1] / (monthExpenseMap[currentMonth] || 1)) * 100
      if (topPct >= 35) {
        newInsights.push({
          id: `top-cat-${currentMonth}`,
          type: 'info',
          message: `🔍 ML Analysis: ${topCat[0]} is consuming ${topPct.toFixed(0)}% of your total expenses (₹${topCat[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })}). Diversifying your spending can improve financial resilience.`
        })
      }
    }
  }

  // Anomaly Detection (Z-score style)
  const expenses = allTransactions.filter(t => t.type === 'expense')
  if (expenses.length >= 5) {
    const amounts = expenses.map(t => t.amount)
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const std = Math.sqrt(amounts.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / amounts.length)
    const threshold = mean + 1.8 * std

    expenses.slice(0, 3).forEach(t => {
      if (t.amount > threshold) {
        newInsights.push({
          id: `anomaly-${t.id}`,
          type: 'warning',
          message: `🤖 Anomaly Detected: Your ₹${t.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} expense in ${t.category} is ${((t.amount / mean) * 100 - 100).toFixed(0)}% above your average spending. Verify this transaction.`
        })
      }
    })
  }

  // Income milestone
  const lastIncome = allTransactions.find(t => t.type === 'income')
  if (lastIncome && lastIncome.amount >= 10000) {
    newInsights.push({
      id: `income-milestone-${lastIncome.id}`,
      type: 'success',
      message: `💰 Significant income of ₹${lastIncome.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} recorded! Consider allocating at least 20% to your savings goals for long-term wealth building.`
    })
  }

  // Deduplicate by id, keep max 10
  const seen = new Set<string>()
  return newInsights.filter(i => {
    if (seen.has(i.id)) return false
    seen.add(i.id)
    return true
  }).slice(0, 10)
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  goals: [],
  insights: [],
  isLoading: false,

  // ── Load from backend ────────────────────────────────────────────────────
  loadTransactions: async () => {
    try {
      set({ isLoading: true })
      const { data } = await api.get('/finance/transactions')
      const txs: Transaction[] = (data ?? []).map(mapTx)
      set({ transactions: txs, insights: generateInsights(txs), isLoading: false })
    } catch (err) {
      console.error('loadTransactions error:', err)
      set({ isLoading: false })
    }
  },

  loadGoals: async () => {
    try {
      const { data } = await api.get('/finance/goals')
      const goals: Goal[] = (data ?? []).map(mapGoal)
      set({ goals })
    } catch (err) {
      console.error('loadGoals error:', err)
    }
  },

  // ── CRUD ─────────────────────────────────────────────────────────────────
  addTransaction: async (t) => {
    try {
      const { data } = await api.post('/finance/transactions', t)
      const newTx = mapTx(data)
      const txs = [newTx, ...get().transactions]

      // Priority-based income allocation to goals
      let updatedGoals = [...get().goals]
      if (t.type === 'income' && updatedGoals.length > 0) {
        const pool = t.amount * 0.15
        const totalWeight = updatedGoals.reduce((acc, g) => acc + g.priorityWeight, 0)
        updatedGoals = updatedGoals.map(g => ({
          ...g,
          currentAmount: g.currentAmount + (totalWeight > 0 ? (g.priorityWeight / totalWeight) * pool : 0),
          probability: Math.min(g.probability + 5, 100),
        }))
      } else if (t.type === 'expense') {
        updatedGoals = updatedGoals.map(g => ({
          ...g,
          probability: Math.max(g.probability - 2, 0),
        }))
      }

      set({ transactions: txs, insights: generateInsights(txs), goals: updatedGoals })
    } catch (err) {
      console.error('addTransaction error:', err)
      throw err // re-throw so the UI can show a toast error
    }
  },

  removeTransaction: async (id) => {
    // Optimistic update first — UI feels instant
    const previous = get().transactions
    const txs = previous.filter(t => t.id !== id)
    set({ transactions: txs, insights: generateInsights(txs) })
    try {
      await api.delete(`/finance/transactions/${id}`)
    } catch (err) {
      // Rollback on failure
      console.error('removeTransaction error:', err)
      set({ transactions: previous, insights: generateInsights(previous) })
      throw err
    }
  },

  addGoal: async (g) => {
    try {
      const { data } = await api.post('/finance/goals', g)
      const newGoal = mapGoal(data)
      set(state => ({ goals: [newGoal, ...state.goals] }))
    } catch (err) {
      console.error('addGoal error:', err)
      throw err
    }
  },

  removeGoal: (id) => set(state => ({
    goals: state.goals.filter(g => g.id !== id)
  })),

  clearData: () => set({ transactions: [], goals: [], insights: [] }),
}))
