import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { blink, type Invoice, type Client, type InvoiceItem, type PaymentGateway } from '../lib/blink'
import { toast } from 'sonner'
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Eye,
  Calculator,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react'

export default function InvoiceBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([])

  // Invoice form data
  const [invoiceData, setInvoiceData] = useState({
    clientId: '',
    invoiceNumber: '',
    title: '',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'USD',
    taxRate: 0,
    notes: '',
    terms: '',
    paymentGateway: '',
    status: 'draft' as const
  })

  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'>[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 }
  ])

  // Custom fields state
  const [customFields, setCustomFields] = useState<{
    header: Array<{ name: string; value: string; type: string }>;
    items: Array<{ name: string; value: string; type: string }>;
    footer: Array<{ name: string; value: string; type: string }>;
  }>({
    header: [],
    items: [],
    footer: []
  })

  // Reminder settings
  const [reminderSettings, setReminderSettings] = useState({
    reminderDays: [3, 7, 14], // Days before due date to send reminders
    reminderCount: 3 // Maximum number of reminders
  })

  useEffect(() => {
    loadData()
  }, [id, loadData])

  const loadData = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      
      // Load clients
      const userClients = await blink.db.clients.list({
        where: { userId: user.id }
      })
      setClients(userClients)

      // Load payment gateways
      const userGateways = await blink.db.paymentGateways.list({
        where: { userId: user.id, isActive: true }
      })
      setPaymentGateways(userGateways)

      // If editing, load invoice data
      if (isEditing && id) {
        const invoice = await blink.db.invoices.list({
          where: { id, userId: user.id },
          limit: 1
        })

        if (invoice.length > 0) {
          const invoiceData = invoice[0]
          setInvoiceData({
            clientId: invoiceData.clientId,
            invoiceNumber: invoiceData.invoiceNumber,
            title: invoiceData.title || '',
            description: invoiceData.description || '',
            issueDate: invoiceData.issueDate,
            dueDate: invoiceData.dueDate || '',
            currency: invoiceData.currency,
            taxRate: invoiceData.taxRate,
            notes: invoiceData.notes || '',
            terms: invoiceData.terms || '',
            paymentGateway: invoiceData.paymentGateway || '',
            status: invoiceData.status
          })

          // Load invoice items
          const invoiceItems = await blink.db.invoiceItems.list({
            where: { invoiceId: id }
          })
          
          if (invoiceItems.length > 0) {
            setItems(invoiceItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total
            })))
          }
        }
      } else {
        // Generate invoice number for new invoice
        const invoiceCount = await blink.db.invoices.list({
          where: { userId: user.id }
        })
        const nextNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount.length + 1).padStart(3, '0')}`
        setInvoiceData(prev => ({ ...prev, invoiceNumber: nextNumber }))
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [isEditing, id])

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof typeof items[0], value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setItems(newItems)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * invoiceData.taxRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount()
  }

  // Custom field functions
  const addCustomField = (position: 'header' | 'items' | 'footer') => {
    setCustomFields(prev => ({
      ...prev,
      [position]: [...prev[position], { name: '', value: '', type: 'text' }]
    }))
  }

  const updateCustomField = (position: 'header' | 'items' | 'footer', index: number, field: string, value: string) => {
    setCustomFields(prev => ({
      ...prev,
      [position]: prev[position].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeCustomField = (position: 'header' | 'items' | 'footer', index: number) => {
    setCustomFields(prev => ({
      ...prev,
      [position]: prev[position].filter((_, i) => i !== index)
    }))
  }

  const saveInvoice = async (status: 'draft' | 'sent' = 'draft') => {
    if (!invoiceData.clientId || !invoiceData.invoiceNumber) {
      toast.error('Please select a client and enter an invoice number')
      return
    }

    if (items.some(item => !item.description.trim())) {
      toast.error('Please fill in all item descriptions')
      return
    }

    setSaving(true)
    try {
      const user = await blink.auth.me()
      const subtotal = calculateSubtotal()
      const taxAmount = calculateTaxAmount()
      const totalAmount = calculateTotal()

      const invoicePayload = {
        userId: user.id,
        clientId: invoiceData.clientId,
        invoiceNumber: invoiceData.invoiceNumber,
        title: invoiceData.title,
        description: invoiceData.description,
        status,
        currency: invoiceData.currency,
        subtotal,
        taxRate: invoiceData.taxRate,
        taxAmount,
        totalAmount,
        dueDate: invoiceData.dueDate || null,
        issueDate: invoiceData.issueDate,
        paymentGateway: invoiceData.paymentGateway,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        reminderDays: JSON.stringify(reminderSettings.reminderDays),
        reminderCount: 0,
        lastReminderSent: null,
        updatedAt: new Date().toISOString()
      }

      let invoiceId: string

      if (isEditing && id) {
        // Update existing invoice
        await blink.db.invoices.update(id, invoicePayload)
        invoiceId = id

        // Delete existing items
        const existingItems = await blink.db.invoiceItems.list({
          where: { invoiceId: id }
        })
        for (const item of existingItems) {
          await blink.db.invoiceItems.delete(item.id)
        }
      } else {
        // Create new invoice
        invoiceId = `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await blink.db.invoices.create({
          id: invoiceId,
          ...invoicePayload,
          createdAt: new Date().toISOString()
        })
      }

      // Create invoice items
      for (const item of items) {
        await blink.db.invoiceItems.create({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          invoiceId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          createdAt: new Date().toISOString()
        })
      }

      toast.success(
        status === 'sent' 
          ? 'Invoice sent successfully!' 
          : isEditing 
            ? 'Invoice updated successfully!' 
            : 'Invoice created successfully!'
      )
      
      navigate('/invoices')
    } catch (error) {
      console.error('Failed to save invoice:', error)
      toast.error('Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Update invoice details' : 'Create a new invoice for your client'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => saveInvoice('draft')} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => saveInvoice('sent')} disabled={saving}>
            <Send className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save & Send'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Basic information about this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={invoiceData.clientId} onValueChange={(value) => setInvoiceData({ ...invoiceData, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                    placeholder="INV-2024-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={invoiceData.title}
                  onChange={(e) => setInvoiceData({ ...invoiceData, title: e.target.value })}
                  placeholder="Invoice title (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={invoiceData.description}
                  onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
                  placeholder="Brief description of the work or services"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={invoiceData.issueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={invoiceData.currency} onValueChange={(value) => setInvoiceData({ ...invoiceData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Items</CardTitle>
                  <CardDescription>Add items, services, or products to this invoice</CardDescription>
                </div>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                    <div className="col-span-12 md:col-span-5">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Input
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    
                    <div className="col-span-4 md:col-span-2">
                      <Label htmlFor={`quantity-${index}`}>Qty</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="col-span-4 md:col-span-2">
                      <Label htmlFor={`unitPrice-${index}`}>Price</Label>
                      <Input
                        id={`unitPrice-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="col-span-3 md:col-span-2">
                      <Label>Total</Label>
                      <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center">
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>Add custom fields to different sections of your invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header Custom Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Header Fields</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomField('header')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Header Field
                  </Button>
                </div>
                {customFields.header.map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => updateCustomField('header', index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        placeholder="Field value"
                        value={field.value}
                        onChange={(e) => updateCustomField('header', index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Select value={field.type} onValueChange={(value) => updateCustomField('header', index, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomField('header', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Custom Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Footer Fields</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomField('footer')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Footer Field
                  </Button>
                </div>
                {customFields.footer.map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => updateCustomField('footer', index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        placeholder="Field value"
                        value={field.value}
                        onChange={(e) => updateCustomField('footer', index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Select value={field.type} onValueChange={(value) => updateCustomField('footer', index, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomField('footer', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reminder Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Reminder Settings</CardTitle>
              <CardDescription>Configure when to send payment reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Reminder Days (before due date)</Label>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 7, 14, 30].map((days) => (
                    <Button
                      key={days}
                      type="button"
                      variant={reminderSettings.reminderDays.includes(days) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newDays = reminderSettings.reminderDays.includes(days)
                          ? reminderSettings.reminderDays.filter(d => d !== days)
                          : [...reminderSettings.reminderDays, days].sort((a, b) => a - b)
                        setReminderSettings({ ...reminderSettings, reminderDays: newDays })
                      }}
                    >
                      {days} day{days > 1 ? 's' : ''}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Selected: {reminderSettings.reminderDays.length > 0 
                    ? reminderSettings.reminderDays.join(', ') + ' days before due date'
                    : 'No reminders set'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                  placeholder="Additional notes for the client"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={invoiceData.terms}
                  onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
                  placeholder="Payment terms and conditions"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentGateway">Payment Gateway</Label>
                <Select value={invoiceData.paymentGateway} onValueChange={(value) => setInvoiceData({ ...invoiceData, paymentGateway: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentGateways.map((gateway) => (
                      <SelectItem key={gateway.id} value={gateway.gatewayType}>
                        {gateway.gatewayType.charAt(0).toUpperCase() + gateway.gatewayType.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Invoice Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax Rate:</span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoiceData.taxRate}
                      onChange={(e) => setInvoiceData({ ...invoiceData, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-16 h-8 text-right"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Amount:</span>
                  <span>${calculateTaxAmount().toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)} {invoiceData.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={invoiceData.status === 'draft' ? 'secondary' : 'default'}>
                {invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}