import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table'
import { blink, type Invoice, type Client } from '../lib/blink'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Eye,
  Send,
  Download,
  Trash2,
  FileText
} from 'lucide-react'

export default function Invoices() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [invoices, setInvoices] = useState<(Invoice & { client?: Client })[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all')

  useEffect(() => {
    loadInvoices()
    loadClients()
  }, [])

  const loadInvoices = async () => {
    try {
      const user = await blink.auth.me()
      const userInvoices = await blink.db.invoices.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setInvoices(userInvoices)
    } catch (error) {
      console.error('Failed to load invoices:', error)
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const user = await blink.auth.me()
      const userClients = await blink.db.clients.list({
        where: { userId: user.id }
      })
      setClients(userClients)
    } catch (error) {
      console.error('Failed to load clients:', error)
    }
  }

  const deleteInvoice = async (invoiceId: string) => {
    try {
      await blink.db.invoices.delete(invoiceId)
      await loadInvoices()
      toast.success('Invoice deleted successfully')
    } catch (error) {
      console.error('Failed to delete invoice:', error)
      toast.error('Failed to delete invoice')
    }
  }

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      await blink.db.invoices.update(invoiceId, {
        status: status as any,
        updatedAt: new Date().toISOString()
      })
      await loadInvoices()
      toast.success('Invoice status updated')
    } catch (error) {
      console.error('Failed to update invoice status:', error)
      toast.error('Failed to update invoice status')
    }
  }

  // Create client lookup map
  const clientMap = new Map(clients.map(client => [client.id, client]))

  // Add client data to invoices
  const invoicesWithClients = invoices.map(invoice => ({
    ...invoice,
    client: clientMap.get(invoice.clientId)
  }))

  // Filter invoices
  const filteredInvoices = invoicesWithClients.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
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

  const getStatusCounts = () => {
    return {
      all: invoices.length,
      draft: invoices.filter(inv => inv.status === 'draft').length,
      sent: invoices.filter(inv => inv.status === 'sent').length,
      paid: invoices.filter(inv => inv.status === 'paid').length,
      overdue: invoices.filter(inv => {
        if (inv.status !== 'sent' || !inv.dueDate) return false
        return new Date(inv.dueDate) < new Date()
      }).length,
      cancelled: invoices.filter(inv => inv.status === 'cancelled').length
    }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-2">
            Manage and track all your invoices
          </p>
        </div>
        <Button asChild>
          <Link to="/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { key: 'all', label: 'All', count: statusCounts.all },
          { key: 'draft', label: 'Draft', count: statusCounts.draft },
          { key: 'sent', label: 'Sent', count: statusCounts.sent },
          { key: 'paid', label: 'Paid', count: statusCounts.paid },
          { key: 'overdue', label: 'Overdue', count: statusCounts.overdue },
          { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
        ].map((status) => (
          <Card 
            key={status.key}
            className={`cursor-pointer transition-colors ${
              statusFilter === status.key ? 'ring-2 ring-primary' : 'hover:bg-gray-50'
            }`}
            onClick={() => setStatusFilter(status.key)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-gray-600">{status.label}</p>
              <p className="text-2xl font-bold text-gray-900">{status.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === 'all' ? 'All Invoices' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Invoices`}
          </CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No invoices found' : 'No invoices yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first invoice to get started'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link to="/invoices/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      #{invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.client?.name || 'Unknown Client'}</p>
                        <p className="text-sm text-gray-600">{invoice.client?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${invoice.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{invoice.currency}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell>
                      {invoice.dueDate ? (
                        <div>
                          <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
                          {invoice.status === 'sent' && new Date(invoice.dueDate) < new Date() && (
                            <p className="text-sm text-red-600">
                              {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No due date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/invoices/${invoice.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, 'sent')}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Invoice
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'sent' && (
                            <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, 'paid')}>
                              <Send className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => deleteInvoice(invoice.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}