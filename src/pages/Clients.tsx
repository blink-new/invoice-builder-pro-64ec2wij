import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
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
import { blink, type Client } from '../lib/blink'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Building,
  Mail,
  Phone
} from 'lucide-react'

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    address: '',
    phone: '',
    taxId: ''
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const user = await blink.auth.me()
      const userClients = await blink.db.clients.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setClients(userClients)
    } catch (error) {
      console.error('Failed to load clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      address: '',
      phone: '',
      taxId: ''
    })
    setEditingClient(null)
  }

  const openDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        email: client.email,
        company: client.company || '',
        address: client.address || '',
        phone: client.phone || '',
        taxId: client.taxId || ''
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const saveClient = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    setSaving(true)
    try {
      const user = await blink.auth.me()
      
      if (editingClient) {
        // Update existing client
        await blink.db.clients.update(editingClient.id, {
          ...formData,
          updatedAt: new Date().toISOString()
        })
        toast.success('Client updated successfully')
      } else {
        // Create new client
        await blink.db.clients.create({
          id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        toast.success('Client created successfully')
      }
      
      await loadClients()
      closeDialog()
    } catch (error) {
      console.error('Failed to save client:', error)
      toast.error('Failed to save client')
    } finally {
      setSaving(false)
    }
  }

  const deleteClient = async (clientId: string) => {
    try {
      await blink.db.clients.delete(clientId)
      await loadClients()
      toast.success('Client deleted successfully')
    } catch (error) {
      console.error('Failed to delete client:', error)
      toast.error('Failed to delete client')
    }
  }

  // Filter clients
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase()
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.company && client.company.toLowerCase().includes(searchLower))
    )
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">
            Manage your client information and contacts
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </DialogTitle>
              <DialogDescription>
                {editingClient 
                  ? 'Update client information below.'
                  : 'Enter client information to add them to your contacts.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="Tax identification number"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button onClick={saveClient} disabled={saving}>
                  {saving ? 'Saving...' : (editingClient ? 'Update Client' : 'Add Client')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.company).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => {
                    const monthAgo = new Date()
                    monthAgo.setMonth(monthAgo.getMonth() - 1)
                    return new Date(c.updatedAt) > monthAgo
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Add your first client to get started with invoicing'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          {client.taxId && (
                            <p className="text-sm text-gray-600">Tax ID: {client.taxId}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.company ? (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{client.company}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No company</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.address ? (
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {client.address}
                        </p>
                      ) : (
                        <span className="text-gray-400">No address</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(client.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(client)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteClient(client.id)}
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