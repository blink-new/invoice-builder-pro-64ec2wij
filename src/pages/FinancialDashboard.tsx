import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Calendar } from '../components/ui/calendar'
import { blink, type Invoice, type Client, type Expense, type CalendarEvent } from '../lib/blink'
import { toast } from 'sonner'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Receipt,
  Users,
  CreditCard,
  Target,
  PieChart
} from 'lucide-react'

export default function FinancialDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    netProfit: 0,
    pendingInvoices: 0,
    overdueAmount: 0,
    billableExpenses: 0
  })
  
  const [recentInvoices, setRecentInvoices] = useState<(Invoice & { client?: Client })[]>([])
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load invoices
      const invoices = await blink.db.invoices.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 10
      })

      // Load clients
      const clients = await blink.db.clients.list({
        where: { userId: user.id }
      })

      // Create client lookup
      const clientMap = new Map(clients.map(client => [client.id, client]))

      // Add client data to invoices
      const invoicesWithClients = invoices.map(invoice => ({
        ...invoice,
        client: clientMap.get(invoice.clientId)
      }))

      setRecentInvoices(invoicesWithClients.slice(0, 5))

      // Mock expenses data
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
        }
      ]

      setRecentExpenses(mockExpenses)

      // Calculate stats
      const currentMonth = new Date().toISOString().slice(0, 7)
      
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0)

      const monthlyRevenue = invoices
        .filter(inv => inv.status === 'paid' && inv.issueDate.startsWith(currentMonth))
        .reduce((sum, inv) => sum + inv.totalAmount, 0)

      const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      
      const monthlyExpenses = mockExpenses
        .filter(exp => exp.expenseDate.startsWith(currentMonth))
        .reduce((sum, exp) => sum + exp.amount, 0)

      const pendingInvoices = invoices
        .filter(inv => inv.status === 'sent')
        .reduce((sum, inv) => sum + inv.totalAmount, 0)

      const overdueAmount = invoices
        .filter(inv => {
          if (inv.status !== 'sent' || !inv.dueDate) return false
          return new Date(inv.dueDate) < new Date()
        })
        .reduce((sum, inv) => sum + inv.totalAmount, 0)

      const billableExpenses = mockExpenses
        .filter(exp => exp.isBillable)
        .reduce((sum, exp) => sum + exp.amount, 0)

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalExpenses,
        monthlyExpenses,
        netProfit: totalRevenue - totalExpenses,
        pendingInvoices,
        overdueAmount,
        billableExpenses
      })

      // Generate calendar events from invoices
      const events: CalendarEvent[] = []
      
      invoices.forEach(invoice => {
        if (invoice.dueDate && invoice.status === 'sent') {
          events.push({
            id: `event_${invoice.id}`,
            userId: user.id,
            title: `Payment Due: ${invoice.invoiceNumber}`,
            description: `${invoice.client?.name || 'Unknown Client'} - $${invoice.totalAmount}`,
            eventType: 'payment_due',
            eventDate: invoice.dueDate,
            relatedId: invoice.id,
            relatedType: 'invoice',
            isCompleted: false,
            createdAt: new Date().toISOString()
          })
        }

        // Add reminder events (3 days before due date)
        if (invoice.dueDate && invoice.status === 'sent') {
          const reminderDate = new Date(invoice.dueDate)
          reminderDate.setDate(reminderDate.getDate() - 3)
          
          events.push({
            id: `reminder_${invoice.id}`,
            userId: user.id,
            title: `Send Reminder: ${invoice.invoiceNumber}`,
            description: `Reminder for ${invoice.client?.name || 'Unknown Client'}`,
            eventType: 'reminder',
            eventDate: reminderDate.toISOString().split('T')[0],
            relatedId: invoice.id,
            relatedType: 'invoice',
            isCompleted: false,
            createdAt: new Date().toISOString()
          })
        }
      })

      setCalendarEvents(events)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return calendarEvents.filter(event => event.eventDate === dateStr)
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'payment_due':
        return <DollarSign className="h-4 w-4" />
      case 'reminder':
        return <Clock className="h-4 w-4" />
      case 'meeting':
        return <Users className="h-4 w-4" />
      case 'deadline':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'payment_due':
        return 'bg-green-100 text-green-800'
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800'
      case 'meeting':
        return 'bg-blue-100 text-blue-800'
      case 'deadline':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Complete overview of your business finances
          </p>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +${stats.monthlyRevenue.toLocaleString()} this month
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
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalExpenses.toLocaleString()}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  +${stats.monthlyExpenses.toLocaleString()} this month
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
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.netProfit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {((stats.netProfit / (stats.totalRevenue || 1)) * 100).toFixed(1)}% margin
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.pendingInvoices.toLocaleString()}
                </p>
                {stats.overdueAmount > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    ${stats.overdueAmount.toLocaleString()} overdue
                  </p>
                )}
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.overdueAmount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">
                You have ${stats.overdueAmount.toLocaleString()} in overdue payments
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/invoices?filter=overdue">View Overdue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>Payment due dates and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasEvents: (date) => getEventsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasEvents: { 
                  backgroundColor: '#3B82F6', 
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
            
            {selectedDate && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">
                  Events for {selectedDate.toLocaleDateString()}
                </h4>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-sm text-gray-500">No events scheduled</p>
                ) : (
                  getEventsForDate(selectedDate).map((event) => (
                    <div key={event.id} className={`p-2 rounded-lg text-xs ${getEventColor(event.eventType)}`}>
                      <div className="flex items-center space-x-2">
                        {getEventIcon(event.eventType)}
                        <div>
                          <p className="font-medium">{event.title}</p>
                          {event.description && (
                            <p className="opacity-80">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Latest invoice activity</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/invoices">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No invoices yet</p>
                    <Button asChild>
                      <Link to="/invoices/new">Create Your First Invoice</Link>
                    </Button>
                  </div>
                ) : (
                  recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium">#{invoice.invoiceNumber}</p>
                          <Badge className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {invoice.client?.name || 'Unknown Client'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${invoice.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{invoice.currency}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Latest expense activity</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/expenses">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExpenses.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No expenses yet</p>
                    <Button asChild>
                      <Link to="/expenses">Add Your First Expense</Link>
                    </Button>
                  </div>
                ) : (
                  recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium">{expense.description}</p>
                          {expense.isBillable && (
                            <Badge variant="default">Billable</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{expense.category}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.expenseDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          -${expense.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">{expense.currency}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common financial management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2" asChild>
              <Link to="/invoices/new">
                <FileText className="h-6 w-6" />
                <span>Create Invoice</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <Link to="/expenses">
                <Receipt className="h-6 w-6" />
                <span>Add Expense</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <Link to="/clients">
                <Users className="h-6 w-6" />
                <span>Manage Clients</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <Link to="/payment-setup">
                <CreditCard className="h-6 w-6" />
                <span>Payment Setup</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}