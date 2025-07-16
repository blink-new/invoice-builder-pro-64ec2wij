import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { blink, type Invoice, type Client } from '../lib/blink'
import { 
  FileText, 
  Users, 
  DollarSign, 
  Clock, 
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalClients: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    overdueCount: 0
  })
  const [recentInvoices, setRecentInvoices] = useState<(Invoice & { client?: Client })[]>([])
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
        limit: 5
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

      // Calculate stats
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0)

      const pendingAmount = invoices
        .filter(inv => inv.status === 'sent')
        .reduce((sum, inv) => sum + inv.totalAmount, 0)

      const overdueCount = invoices
        .filter(inv => {
          if (inv.status !== 'sent' || !inv.dueDate) return false
          return new Date(inv.dueDate) < new Date()
        }).length

      setStats({
        totalInvoices: invoices.length,
        totalClients: clients.length,
        totalRevenue,
        pendingAmount,
        overdueCount
      })

      setRecentInvoices(invoicesWithClients)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      sent: 'default',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'secondary'
    } as const

    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Users className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.pendingAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.overdueCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">
                You have {stats.overdueCount} overdue invoice{stats.overdueCount > 1 ? 's' : ''}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/invoices?filter=overdue">View Overdue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your latest invoice activity</CardDescription>
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
                    <Link to="/invoices/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Invoice
                    </Link>
                  </Button>
                </div>
              ) : (
                recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium">#{invoice.invoiceNumber}</p>
                        {getStatusBadge(invoice.status)}
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link to="/invoices/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Invoice
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/clients">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Clients
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/payment-setup">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Setup Payment Gateways
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/email-templates">
                  <FileText className="h-4 w-4 mr-2" />
                  Customize Email Templates
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}