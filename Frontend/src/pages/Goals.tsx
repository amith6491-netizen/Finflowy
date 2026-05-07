import { useState } from 'react'
import { useFinanceStore } from '@/store/useFinanceStore'
import { Card, CardContent } from '@/components/ui/Card'
import { Target, TrendingUp, AlertTriangle, ChevronRight, Plus, X, ListOrdered, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Goals() {
  const goals = useFinanceStore(state => state.goals)
  const addGoal = useFinanceStore(state => state.addGoal)
  const removeGoal = useFinanceStore(state => state.removeGoal)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '', priorityWeight: '50' })

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline || !newGoal.priorityWeight) {
      toast.error('Please fill all fields')
      return
    }
    try {
      await addGoal({
        name: newGoal.name,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: 0,
        probability: 50,
        deadline: newGoal.deadline,
        priorityWeight: Number(newGoal.priorityWeight)
      })
      toast.success('Goal created! AI tracking initiated.')
      setIsModalOpen(false)
      setNewGoal({ name: '', targetAmount: '', deadline: '', priorityWeight: '50' })
    } catch {
      toast.error('Failed to save goal. Is the backend running?')
    }
  }

  // Calculate global weight logic to display percentages visually to user
  const totalWeight = goals.reduce((acc, g) => acc + g.priorityWeight, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saving Goals</h1>
          <p className="text-muted-foreground mt-1">AI predicted likelihood of reaching your objectives.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Create Goal
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <AnimatePresence>
          {goals.map((goal) => {
            const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            const sharePercentage = totalWeight > 0 ? (goal.priorityWeight / totalWeight) * 100 : 0
            
            return (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className="glass relative overflow-hidden group h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-white/5 rounded-2xl">
                          <Target className="text-primary" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{goal.name}</h3>
                          <p className="text-sm text-muted-foreground">Deadline: {goal.deadline}</p>
                        </div>
                      </div>
                      
                      {/* Top Right Controls & ML Prediction Badge */}
                      <div className="flex flex-col items-end gap-2">
                         <div className="flex items-center gap-2">
                           <div className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                              goal.probability >= 70 ? 'bg-success/20 text-success' :
                              goal.probability >= 40 ? 'bg-warning/20 text-warning' :
                              'bg-destructive/20 text-destructive'
                           }`}>
                             {goal.probability >= 70 ? <TrendingUp size={14} /> : <AlertTriangle size={14} />}
                             {goal.probability}% AI Confidence
                           </div>
                           <button 
                             onClick={() => {
                               removeGoal(goal.id)
                               toast.success('Goal deleted')
                             }} 
                             className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                             title="Delete Goal"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                         <div className="flex items-center text-xs text-muted-foreground gap-1 bg-white/5 px-2 py-1 rounded-md">
                            <ListOrdered size={12} /> Priority Share: {sharePercentage.toFixed(0)}%
                         </div>
                      </div>
                    </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold">₹{goal.currentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} / ₹{goal.targetAmount.toLocaleString()}</span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${
                        progressPercentage >= 100 ? 'from-success to-emerald-400' : 'from-primary to-purple-400'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{progressPercentage.toFixed(1)}% Achieved</span>
                    <span>₹{Math.max(goal.targetAmount - goal.currentAmount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Remaining</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                  <Button variant="glass" className="w-full" onClick={() => toast('Progress updates automatically via algorithm!', { icon: '🤖' })}>
                    Update Progress
                  </Button>
                  <Button variant="ghost" size="icon" className="shrink-0 bg-white/5 hover:bg-white/10 rounded-xl">
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
           </motion.div>
          )
        })}
        </AnimatePresence>

        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-white/20">
            <Target className="mx-auto mb-4 text-muted-foreground opacity-50" size={48} />
            <h3 className="text-lg font-medium text-foreground">No goals active</h3>
            <p className="text-muted-foreground mb-6">Create a goal to let FinFlowy track and predict your success.</p>
            <Button onClick={() => setIsModalOpen(true)}>Create your first Goal</Button>
          </div>
        )}
      </div>

      {/* Slide-out Modal for Creating a Goal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-white/10 p-6 z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Launch New Goal</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="flex-1 flex flex-col space-y-6">
                <div className="space-y-2">
                  <Label>Goal Name</Label>
                  <Input 
                    placeholder="e.g., Summer Vacation, Emergency Fund" 
                    value={newGoal.name}
                    onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Target Amount (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="5000" 
                    value={newGoal.targetAmount}
                    onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Target Deadline</Label>
                  <Input 
                    type="date" 
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Priority Weight (1-100)</Label>
                    <span className="text-xs text-primary font-medium">Auto-distributes income</span>
                  </div>
                  <Input 
                    type="number" 
                    min="1"
                    max="100"
                    placeholder="e.g. 80 for High Priority" 
                    value={newGoal.priorityWeight}
                    onChange={e => setNewGoal({...newGoal, priorityWeight: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Higher weight = faster allocation of savings algorithms.</p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                  <Button type="submit" className="w-full py-6 text-lg relative overflow-hidden group">
                    <span className="relative z-10">Initialize Tracker</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
