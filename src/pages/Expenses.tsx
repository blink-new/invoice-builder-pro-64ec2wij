import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Switch } from '../components/ui/switch'
import { blink, type Expense, type ExpenseCategory, type Client } from '../lib/blink'
import { toast } from 'sonner'
import { 
  Plus, 
  Receipt, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Upload,
  Edit,
  Trash2,
  FileText,
  Users
} from 'lucide-react'

const defaultCategories = [
  { name: 'Office Supplies', color: '#3B82F6' },
  { name: 'Travel & Transportation', color: '#10B981' },
  { name: 'Meals & Entertainment', color: '#F59E0B' },
  { name: 'Software & Subscriptions', color: '#8B5CF6' },
  { name: 'Marketing & Advertising', color: '#EF4444' },
  { name: 'Equipment & Hardware', color: '#6B7280' },
  { name: 'Professional Services', color: '#EC4899' },
  { name: 'Utilities & Internet', color: '#14B8A6' },
  { name: 'Other', color: '#64748B' }
]

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    currency: 'USD',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    isBillable: false,
    clientId: '',
    projectName: '',
    paymentMethod: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load expenses (mock data for now)
      const mockExpenses: Expense[] = [
        {
          id: 'exp_1',
          userId: user.id,
          category: 'Office Supplies',
          description: 'Laptop for development work',
          amount: 1299.99,
          currency: 'USD',
          expenseDate: '2024-01-15',
          receiptUrl: '',
          isBillable: false,
          clientId: '',
          projectName: '',
          paymentMethod: 'Credit Card',
          notes: 'MacBook Pro 14-inch',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'exp_2',
          userId: user.id,
          category: 'Travel & Transportation',
          description: 'Client meeting travel',
          amount: 245.50,
          currency: 'USD',
          expenseDate: '2024-01-20',
          receiptUrl: '',
          isBillable: true,
          clientId: 'client_1',
          projectName: 'Website Redesign',
          paymentMethod: 'Company Card',
          notes: 'Flight to NYC for client presentation',
          createdAt: '2024-01-20T14:30:00Z',
          updatedAt: '2024-01-20T14:30:00Z'
        },
        {
          id: 'exp_3',
          userId: user.id,
          category: 'Software & Subscriptions',
          description: 'Adobe Creative Suite',
          amount: 52.99,
          currency: 'USD',
          expenseDate: '2024-02-01',
          receiptUrl: '',
          isBillable: false,
          clientId: '',
          projectName: '',
          paymentMethod: 'Credit Card',
          notes: 'Monthly subscription',
          createdAt: '2024-02-01T09:15:00Z',
          updatedAt: '2024-02-01T09:15:00Z'
        }
      ]
      
      setExpenses(mockExpenses)

      // Load categories
      setCategories(defaultCategories.map((cat, index) => ({
        id: `cat_${index}`,
        userId: user.id,
        name: cat.name,
        color: cat.color,
        isDefault: true,
        createdAt: new Date().toISOString()
      })))

      // Load clients
      const userClients = await blink.db.clients.list({
        where: { userId: user.id }
      })
      setClients(userClients)

    } catch (error) {
      console.error('Failed to load expenses data:', error)
      toast.error('Failed to load expenses data')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      category: '',
      description: '',
      amount: '',
      currency: 'USD',
      expenseDate: new Date().toISOString().split('T')[0],
      receiptUrl: '',
      isBillable: false,
      clientId: '',
      projectName: '',
      paymentMethod: '',
      notes: ''
    })
    setEditingExpense(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.description || !formData.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const user = await blink.auth.me()
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId: user.id,
        updatedAt: new Date().toISOString()
      }

      if (editingExpense) {
        // Update existing expense (mock)
        const updatedExpenses = expenses.map(exp => 
          exp.id === editingExpense.id 
            ? { ...exp, ...expenseData }
            : exp
        )
        setExpenses(updatedExpenses)
        toast.success('Expense updated successfully!')
      } else {
        // Create new expense (mock)
        const newExpense: Expense = {
          id: `exp_${Date.now()}`,
          ...expenseData,
          createdAt: new Date().toISOString()
        }
        setExpenses([newExpense, ...expenses])
        toast.success('Expense added successfully!')
      }

      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      console.error('Failed to save expense:', error)
      toast.error('Failed to save expense')
    }
  }

  const handleEdit = (expense: Expense) => {
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      currency: expense.currency,
      expenseDate: expense.expenseDate,
      receiptUrl: expense.receiptUrl || '',
      isBillable: expense.isBillable,
      clientId: expense.clientId || '',
      projectName: expense.projectName || '',
      paymentMethod: expense.paymentMethod || '',
      notes: expense.notes || ''
    })
    setEditingExpense(expense)
    setShowAddDialog(true)
  }

  const handleDelete = async (expenseId: string) => {
    try {
      setExpenses(expenses.filter(exp => exp.id !== expenseId))
      toast.success('Expense deleted successfully!')
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || expense.category === selectedCategory
    const matchesDate = !dateFilter || expense.expenseDate.startsWith(dateFilter)
    
    return matchesSearch && matchesCategory && matchesDate
  })

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const billableExpenses = filteredExpenses.filter(exp => exp.isBillable).reduce((sum, exp) => sum + exp.amount, 0)
  const thisMonthExpenses = expenses.filter(exp => 
    exp.expenseDate.startsWith(new Date().toISOString().slice(0, 7))
  ).reduce((sum, exp) => sum + exp.amount, 0)

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.color || '#6B7280'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Tracking</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your business expenses
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </DialogTitle>
              <DialogDescription>
                {editingExpense ? 'Update expense details' : 'Record a new business expense'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="flex">
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="flex-1 ml-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What was this expense for?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expenseDate">Date</Label>
                  <Input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Company Card">Company Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isBillable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBillable: checked })}
                />
                <Label>This expense is billable to a client</Label>
              </div>

              {formData.isBillable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client</Label>
                    <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="Project or job name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this expense"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Billable Expenses</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${billableExpenses.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${thisMonthExpenses.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-3xl font-bold text-gray-900">
                  {categories.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No expenses found</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Expense
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        {expense.notes && (
                          <p className="text-sm text-gray-500">{expense.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(expense.category) }}
                        />
                        <span>{expense.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        ${expense.amount.toLocaleString()} {expense.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      {expense.isBillable ? (
                        <Badge variant="default">Billable</Badge>
                      ) : (
                        <Badge variant="secondary">Non-billable</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.clientId ? (
                        <div>
                          <p className="text-sm">
                            {clients.find(c => c.id === expense.clientId)?.name || 'Unknown'}
                          </p>
                          {expense.projectName && (
                            <p className="text-xs text-gray-500">{expense.projectName}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}