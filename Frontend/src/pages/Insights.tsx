import { useMemo, useEffect, useState, useRef } from 'react'
import { useFinanceStore } from '@/store/useFinanceStore'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Sparkles, AlertTriangle, CheckCircle, Info, ShieldCheck, ShieldAlert, TrendingUp, Brain, Wallet, Layers } from 'lucide-react'
import { fetchExpenseForecast, fetchSpendingPatterns, fetchBudgetRecommendations, type ExpenseForecast, type SpendingPatterns, type BudgetRecommendation } from '@/services/mlService'

// ── Health score formula ──────────────────────────────────────────────────────
function calcHealthScore(
  transactions: ReturnType<typeof useFinanceStore.getState>['transactions']
): number {
  if (transactions.length === 0) return 0

  let inc = 0, exp = 0
  const monthMap: Record<string, { income: number; expense: number }> = {}

  transactions.forEach(t => {
    if (t.type === 'income') inc += t.amount
    else exp += t.amount
    const m = t.date.substring(0, 7)
    if (!monthMap[m]) monthMap[m] = { income: 0, expense: 0 }
    if (t.type === 'income') monthMap[m].income += t.amount
    else monthMap[m].expense += t.amount
  })

  const savingsRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0
  const savingsPts   = Math.min(savingsRate * 1.5, 40)
  const expRatio     = inc > 0 ? exp / inc : 1
  const expPts       = Math.max(30 - expRatio * 30, 0)

  const months = Object.values(monthMap)
  let consistencyPts = 10
  if (months.length >= 2) {
    const exps = months.map(m => m.expense)
    const mean = exps.reduce((a, b) => a + b, 0) / exps.length
    const std  = Math.sqrt(exps.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / exps.length)
    const cv   = mean > 0 ? std / mean : 1
    consistencyPts = Math.max(20 - cv * 20, 0)
  }

  const activityPts = Math.min(transactions.length / 10, 1) * 10
  return Math.max(Math.round(Math.min(savingsPts + expPts + consistencyPts + activityPts, 100)), 0)
}

// ── Color helpers ─────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 75) return { hex: '#22c55e', label: 'Excellent', Icon: ShieldCheck }
  if (s >= 50) return { hex: '#eab308', label: 'Good',      Icon: TrendingUp  }
  if (s >= 20) return { hex: '#f97316', label: 'Fair',      Icon: AlertTriangle }
  return           { hex: '#ef4444', label: 'At Risk',   Icon: ShieldAlert   }
}

// ── Fully-filled gradient arc meter ──────────────────────────────────────────
/**
 * Half-circle arc drawn on a 220×130 viewBox.
 * Centre = (110, 115), radius = 100.
 *
 * The arc background is painted in 4 solid colour bands (no gaps).
 * A sharp needle animates from the left end to the correct angle on mount.
 */
function HealthMeter({ score }: { score: number }) {
  // animated needle angle (degrees from SVG "east", CCW positive for SVG transform)
  // Score 0   → left  end of arc → needle at -90° relative to centre
  // Score 100 → right end of arc → needle at  90° relative to centre
  const [animatedScore, setAnimatedScore] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Reset to 0 each time score changes, then animate forward
    setAnimatedScore(0)
    const start    = performance.now()
    const duration = 1400 // ms

    const tick = (now: number) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [score])

  const { hex, label, Icon } = scoreColor(score)

  // SVG geometry
  const cx = 110, cy = 115, R = 100

  // Band boundaries as x positions along the arc (percentage of 180°)
  // Zone breakpoints: 0, 20, 50, 75, 100  mapped to 0–180°
  const pctToXY = (pct: number) => {
    const angle = Math.PI - (pct / 100) * Math.PI // 180° → 0°
    return { x: cx + R * Math.cos(angle), y: cy - R * Math.sin(angle) }
  }

  const p0  = pctToXY(0)   // 0
  const p20 = pctToXY(20)  // red/orange boundary
  const p50 = pctToXY(50)  // orange/yellow boundary
  const p75 = pctToXY(75)  // yellow/green boundary
  const p100= pctToXY(100) // 100

  const bandPath = (from: {x:number,y:number}, to: {x:number,y:number}) =>
    `M ${from.x} ${from.y} A ${R} ${R} 0 0 1 ${to.x} ${to.y}`

  // Needle angle
  const needleDeg = (animatedScore / 100) * 180  // 0 = left (180°), 180 = right (0°)
  const needleRad = Math.PI - (needleDeg / 180) * Math.PI
  const needleLen = R - 14
  const needleTip = {
    x: cx + needleLen * Math.cos(needleRad),
    y: cy - needleLen * Math.sin(needleRad),
  }

  const strokeW = 20

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox="0 0 220 130" className="w-full max-w-[240px]" style={{ overflow: 'visible' }}>
        {/* ── Band 0–20: red ── */}
        <path d={bandPath(p0, p20)}  fill="none" stroke="#ef4444" strokeWidth={strokeW} strokeLinecap="butt" />
        {/* ── Band 20–50: orange ── */}
        <path d={bandPath(p20, p50)} fill="none" stroke="#f97316" strokeWidth={strokeW} strokeLinecap="butt" />
        {/* ── Band 50–75: yellow ── */}
        <path d={bandPath(p50, p75)} fill="none" stroke="#eab308" strokeWidth={strokeW} strokeLinecap="butt" />
        {/* ── Band 75–100: green ── */}
        <path d={bandPath(p75, p100)} fill="none" stroke="#22c55e" strokeWidth={strokeW} strokeLinecap="butt" />

        {/* ── Zone tick marks ── */}
        {[20, 50, 75].map(pct => {
          const inner = pctToXY(pct)
          const angleRad = Math.PI - (pct / 100) * Math.PI
          const outer = {
            x: cx + (R + 6) * Math.cos(angleRad),
            y: cy - (R + 6) * Math.sin(angleRad),
          }
          return (
            <line
              key={pct}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="rgba(0,0,0,0.7)"
              strokeWidth={2.5}
            />
          )
        })}

        {/* ── Score labels on arc ── */}
        {[
          { pct: 0,   txt: '0'   },
          { pct: 20,  txt: '20'  },
          { pct: 50,  txt: '50'  },
          { pct: 75,  txt: '75'  },
          { pct: 100, txt: '100' },
        ].map(({ pct, txt }) => {
          const angleRad = Math.PI - (pct / 100) * Math.PI
          const lR = R + 16
          return (
            <text
              key={pct}
              x={cx + lR * Math.cos(angleRad)}
              y={cy - lR * Math.sin(angleRad) + 4}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(255,255,255,0.45)"
              fontFamily="inherit"
            >
              {txt}
            </text>
          )
        })}

        {/* ── Needle shadow ── */}
        <line
          x1={cx} y1={cy}
          x2={needleTip.x + 1.5} y2={needleTip.y + 1.5}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        {/* ── Needle ── */}
        <line
          x1={cx} y1={cy}
          x2={needleTip.x} y2={needleTip.y}
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* ── Pivot cap ── */}
        <circle cx={cx} cy={cy} r={9}  fill="#1e1e2e" />
        <circle cx={cx} cy={cy} r={6}  fill={hex} />
        <circle cx={cx} cy={cy} r={2.5} fill="white" />
      </svg>

      {/* ── Score number & label ── */}
      <div className="flex flex-col items-center mt-1 gap-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl font-black leading-none" style={{ color: hex }}>
            {animatedScore}
          </span>
          <span className="text-lg text-muted-foreground font-medium">/100</span>
        </div>
        <span
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mt-1"
          style={{ background: `${hex}28`, color: hex }}
        >
          <Icon size={12} /> {label}
        </span>
      </div>
    </div>
  )
}

// ── Score breakdown bars ──────────────────────────────────────────────────────
function ScoreBreakdown({ score }: { score: number }) {
  const bars = [
    { label: 'Savings',         val: score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low',    pct: Math.min(score * 1.2, 100) },
    { label: 'Expense Control', val: score >= 60 ? 'Good' : 'Needs Work',                       pct: Math.min(score * 0.9, 100) },
    { label: 'Consistency',     val: score >= 70 ? 'Stable' : 'Variable',                       pct: Math.min(score * 1.1, 100) },
  ]
  return (
    <div className="space-y-3 w-full mt-3 px-1">
      {bars.map(b => (
        <div key={b.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{b.label}</span>
            <span className="font-semibold text-foreground">{b.val}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${b.pct}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #a855f7)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Insights() {
  const insights    = useFinanceStore(state => state.insights)
  const transactions = useFinanceStore(state => state.transactions)
  const healthScore = useMemo(() => calcHealthScore(transactions), [transactions])

  // ML API state
  const [forecast,  setForecast]  = useState<ExpenseForecast | null>(null)
  const [patterns,  setPatterns]  = useState<SpendingPatterns | null>(null)
  const [budget,    setBudget]    = useState<BudgetRecommendation | null>(null)
  const [mlLoading, setMlLoading] = useState(false)
  const [mlError,   setMlError]   = useState(false)

  useEffect(() => {
    setMlLoading(true)
    // Each call already returns null on failure — Promise.all never rejects
    Promise.all([
      fetchExpenseForecast(),
      fetchSpendingPatterns(),
      fetchBudgetRecommendations(),
    ]).then(([f, p, b]) => {
      setForecast(f)
      setPatterns(p)
      setBudget(b)
      // Only show error banner when every single call failed
      if (!f && !p && !b) setMlError(true)
    }).finally(() => setMlLoading(false))
  }, [])

  const warnings = insights.filter(i => i.type === 'warning')
  const successes = insights.filter(i => i.type === 'success')
  const infos     = insights.filter(i => i.type === 'info')

  const iconFor  = (type: string) =>
    type === 'warning' ? <AlertTriangle size={18} /> :
    type === 'success' ? <CheckCircle   size={18} /> : <Info size={18} />

  const colorFor = (type: string) =>
    type === 'warning' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
    type === 'success' ? 'bg-success/10 border-success/30 text-success'             :
                         'bg-primary/10 border-primary/30 text-primary'

  const titleFor = (type: string, msg: string) => {
    if (type === 'warning') {
      if (msg.includes('Anomaly'))          return 'Spending Anomaly Detected'
      if (msg.includes('more than last'))   return 'Month-over-Month Spike'
      return 'Spending Alert'
    }
    if (type === 'success') {
      if (msg.includes('savings rate'))     return 'Great Savings Rate!'
      if (msg.includes('dropped'))          return 'Spending Reduced'
      return 'Positive Achievement'
    }
    if (msg.includes('ML'))                 return 'ML Pattern Analysis'
    return 'Financial Insight'
  }

  return (
    /* Outer wrapper: relative so sticky child is anchored to it */
    <div className="relative pb-8">

      {/* ── Sticky meter panel — top-right, always visible while scrolling ── */}
      <div
        className="sticky top-4 float-right ml-6 mb-6 z-30 w-64 shrink-0"
        style={{ shapeOutside: 'inset(0)' }}
      >
        <Card className="glass border border-white/10 shadow-2xl">
          <CardHeader className="pb-1 pt-4 px-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                <Sparkles size={14} />
              </div>
              <div>
                <CardTitle className="text-sm leading-tight">Financial Health</CardTitle>
                <CardDescription className="text-xs">Live score</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <HealthMeter score={healthScore} />
            <ScoreBreakdown score={healthScore} />
            {/* zone legend */}
            <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5">
              {[
                { c: '#ef4444', t: '< 20 — At Risk'  },
                { c: '#f97316', t: '20–50 — Fair'    },
                { c: '#eab308', t: '50–75 — Good'    },
                { c: '#22c55e', t: '> 75 — Excellent'},
              ].map(z => (
                <div key={z.t} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: z.c }} />
                  <span className="text-muted-foreground" style={{ fontSize: 9 }}>{z.t}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Smart Insights</h1>
        <p className="text-muted-foreground mt-1">
          ML-powered behavioral analysis and personalised recommendations.
        </p>
      </div>

      {/* ── Summary stat pills ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Warnings', count: warnings.length,  col: '#ef4444', Icon: AlertTriangle },
          { label: 'Wins',     count: successes.length, col: '#22c55e', Icon: CheckCircle  },
          { label: 'Analysis', count: infos.length,     col: '#8b5cf6', Icon: Info         },
        ].map(s => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 glass"
          >
            <s.Icon size={14} style={{ color: s.col }} />
            <span className="text-sm font-bold" style={{ color: s.col }}>{s.count}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── How it works card ── */}
      <Card className="glass mb-6">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/20 text-primary shrink-0 mt-0.5">
            <Sparkles size={15} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">How FinFlowy AI Works</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Insights are generated by a rule-based ML engine that computes month-over-month category
              comparisons (Food, Transport, Groceries, Entertainment, etc.), detects spending anomalies
              using Z-score analysis, and evaluates your financial health across 4 dimensions — all in
              real-time as you add transactions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Alerts feed ── */}
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-primary" />
        Live AI Alerts &amp; Recommendations
      </h2>

      {insights.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 flex flex-col items-center text-center gap-3">
            <Sparkles size={40} className="text-primary opacity-40" />
            <p className="text-lg font-medium text-muted-foreground">No insights yet</p>
            <p className="text-sm text-muted-foreground">
              Add at least 5 transactions across multiple categories to start receiving AI-powered insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {insights.map(insight => (
            <Card
              key={insight.id}
              className={`glass border ${colorFor(insight.type)} transition-all duration-300 hover:scale-[1.005]`}
            >
              <CardHeader className="pb-1 pt-5 px-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${colorFor(insight.type)}`}>
                    {iconFor(insight.type)}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">
                      {titleFor(insight.type, insight.message)}
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wider font-semibold opacity-50">
                       FinFlowy AI Engine
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 px-5 pb-5">
                <p className="text-foreground leading-relaxed text-sm">{insight.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── ML Model Panels ──────────────────────────────────────────────────── */}
      <div className="mt-2">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Brain size={18} className="text-primary" />
          Real ML Model Predictions
          <span className="text-xs font-normal text-muted-foreground ml-1">(scikit-learn powered)</span>
        </h2>

        {mlLoading && (
          <Card className="glass">
            <CardContent className="py-10 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">ML models running…</p>
            </CardContent>
          </Card>
        )}

        {mlError && (
          <Card className="glass border border-destructive/30">
            <CardContent className="py-8 flex flex-col items-center gap-2 text-center">
              <AlertTriangle size={28} className="text-destructive opacity-60" />
              <p className="text-sm text-muted-foreground">ML service unavailable. Start Docker to enable live predictions.</p>
            </CardContent>
          </Card>
        )}

        {!mlLoading && !mlError && (
          <div className="grid gap-6">

            {/* Model 1 — LinearRegression Forecast */}
            {forecast && (
              <Card className="glass border border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-primary/20 text-primary"><TrendingUp size={16} /></div>
                      <div>
                        <CardTitle className="text-sm">Expense Forecast — Next Month</CardTitle>
                        <CardDescription className="text-xs">{forecast.model}</CardDescription>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      forecast.confidence === 'high' ? 'bg-success/20 text-success' :
                      forecast.confidence === 'medium' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                    }`}>{forecast.confidence} confidence</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-2xl font-black text-primary">₹{forecast.predictedExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      <p className="text-xs text-muted-foreground mt-1">Predicted Expense</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className={`text-2xl font-black ${forecast.trend === 'increasing' ? 'text-destructive' : forecast.trend === 'decreasing' ? 'text-success' : 'text-primary'}`}>
                        {forecast.trend === 'increasing' ? '↑' : forecast.trend === 'decreasing' ? '↓' : '→'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{forecast.trend} trend</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-2xl font-black text-foreground">{(forecast.r2Score * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Model R² Fit</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{forecast.message}</p>
                </CardContent>
              </Card>
            )}

            {/* Model 4 — KMeans Clusters */}
            {patterns && patterns.clusters.length > 0 && (
              <Card className="glass border border-purple-500/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400"><Layers size={16} /></div>
                    <div>
                      <CardTitle className="text-sm">Spending Pattern Clusters</CardTitle>
                      <CardDescription className="text-xs">{patterns.model}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {patterns.clusters.map((c, i) => {
                      const clusterColors = ['#ef4444', '#f59e0b', '#22c55e']
                      const col = clusterColors[i] || '#8b5cf6'
                      return (
                        <div key={c.clusterId} className="p-3 rounded-xl border border-white/10 bg-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold" style={{ color: col }}>{c.label}</span>
                            <span className="text-xs text-muted-foreground">₹{c.totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })} total</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {c.categories.map(cat => (
                              <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">{cat}</span>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{c.transactionCount} transactions · avg ₹{c.avgTransaction.toLocaleString('en-IN', { maximumFractionDigits: 0 })} each</p>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{patterns.insight}</p>
                </CardContent>
              </Card>
            )}

            {/* Model 5 — Ridge Budget */}
            {budget && budget.recommendations.length > 0 && (
              <Card className="glass border border-emerald-500/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><Wallet size={16} /></div>
                    <div>
                      <CardTitle className="text-sm">Smart Budget Recommendations</CardTitle>
                      <CardDescription className="text-xs">{budget.model}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm font-semibold text-emerald-400">Potential Monthly Saving: ₹{budget.totalPotentialSaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-muted-foreground mt-1">{budget.summary}</p>
                  </div>
                  <div className="space-y-2">
                    {budget.recommendations.slice(0, 5).map(r => (
                      <div key={r.category} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <div>
                          <p className="text-sm font-semibold">{r.category}</p>
                          <p className="text-xs text-muted-foreground">
                            Avg: ₹{r.currentAvgMonthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })} → Budget: ₹{r.recommendedBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-success">−₹{r.potentialSaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                          <p className="text-xs text-muted-foreground capitalize">{r.confidence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
