import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, Filter, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { useFinanceStore, type Transaction } from '@/store/useFinanceStore'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import toast from 'react-hot-toast'

export default function Transactions() {
  const { transactions, addTransaction, removeTransaction } = useFinanceStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const today = new Date().toISOString().split('T')[0]
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Transaction, 'id'>>({
    defaultValues: {
      date: today,
      type: 'expense'
    }
  })

  const onSubmit = async (data: Omit<Transaction, 'id'>) => {
    // Convert amount string back to number
    data.amount = Number(data.amount)
    try {
      await addTransaction(data)
      toast.success('Transaction added successfully')
      setIsModalOpen(false)
      reset()
    } catch {
      toast.error('Failed to save transaction. Is the backend running?')
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage all your income and expenses.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search description or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="text-muted-foreground" size={18} />
            <select 
              className="h-11 rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all" className="bg-card">All Types</option>
              <option value="income" className="bg-card">Income Only</option>
              <option value="expense" className="bg-card">Expense Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              ) : filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    {tx.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-muted-foreground">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{tx.date}</td>
                  <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}  ₹ {tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={async () => {
                        try {
                          await removeTransaction(tx.id)
                          toast.success('Transaction deleted')
                        } catch {
                          toast.error('Failed to delete. Is the backend running?')
                        }
                      }}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass rounded-2xl shadow-2xl overflow-hidden p-6"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Add Transaction</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Type</Label>
                     <select 
                        {...register('type')}
                        className="w-full h-11 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                      >
                        <option value="expense" className="bg-card">Expense</option>
                        <option value="income" className="bg-card">Income</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      {...register('amount', { required: 'Amount is required' })} 
                    />
                    {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="E.g. Groceries at Walmart" 
                    {...register('description', { required: 'Description is required' })} 
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message as string}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input 
                      placeholder="Food, Transport, etc." 
                      {...register('category', { required: 'Category is required' })} 
                    />
                    {errors.category && <p className="text-xs text-destructive">{errors.category.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                      type="date"
                      max={today}
                      {...register('date', { required: 'Date is required' })} 
                    />
                    {errors.date && <p className="text-xs text-destructive">{errors.date.message as string}</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6">
                  Save Transaction
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
