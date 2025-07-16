// Mock data for demonstration purposes
// This will be used when database is not available

export const mockClients = [
  {
    id: 'client_1',
    userId: 'user_1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    company: 'Smith Consulting LLC',
    address: '123 Business St, New York, NY 10001',
    phone: '+1 (555) 123-4567',
    taxId: 'EIN-12-3456789',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'client_2',
    userId: 'user_1',
    name: 'Sarah Johnson',
    email: 'sarah@techstartup.com',
    company: 'TechStartup Inc.',
    address: '456 Innovation Ave, San Francisco, CA 94105',
    phone: '+1 (555) 987-6543',
    taxId: 'EIN-98-7654321',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'client_3',
    userId: 'user_1',
    name: 'Michael Brown',
    email: 'mike.brown@designstudio.com',
    company: 'Creative Design Studio',
    address: '789 Creative Blvd, Los Angeles, CA 90210',
    phone: '+1 (555) 456-7890',
    taxId: 'EIN-45-6789012',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-01T09:15:00Z'
  }
]

export const mockInvoices = [
  {
    id: 'invoice_1',
    userId: 'user_1',
    clientId: 'client_1',
    invoiceNumber: 'INV-2024-001',
    title: 'Website Development Services',
    description: 'Complete website redesign and development',
    status: 'paid' as const,
    currency: 'USD',
    subtotal: 2500.00,
    taxRate: 8.5,
    taxAmount: 212.50,
    totalAmount: 2712.50,
    dueDate: '2024-02-15',
    issueDate: '2024-01-15',
    paymentGateway: 'stripe',
    paymentLink: 'https://pay.stripe.com/invoice/123',
    notes: 'Thank you for your business!',
    terms: 'Payment due within 30 days',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-10T16:30:00Z'
  },
  {
    id: 'invoice_2',
    userId: 'user_1',
    clientId: 'client_2',
    invoiceNumber: 'INV-2024-002',
    title: 'Mobile App Development',
    description: 'iOS and Android app development',
    status: 'sent' as const,
    currency: 'USD',
    subtotal: 5000.00,
    taxRate: 8.5,
    taxAmount: 425.00,
    totalAmount: 5425.00,
    dueDate: '2024-03-01',
    issueDate: '2024-02-01',
    paymentGateway: 'stripe',
    paymentLink: 'https://pay.stripe.com/invoice/456',
    notes: 'Please review the app specifications attached.',
    terms: 'Payment due within 30 days',
    createdAt: '2024-02-01T14:30:00Z',
    updatedAt: '2024-02-01T14:30:00Z'
  },
  {
    id: 'invoice_3',
    userId: 'user_1',
    clientId: 'client_3',
    invoiceNumber: 'INV-2024-003',
    title: 'Brand Identity Design',
    description: 'Logo design and brand guidelines',
    status: 'overdue' as const,
    currency: 'USD',
    subtotal: 1200.00,
    taxRate: 8.5,
    taxAmount: 102.00,
    totalAmount: 1302.00,
    dueDate: '2024-01-30',
    issueDate: '2024-01-01',
    paymentGateway: 'paypal',
    paymentLink: 'https://paypal.me/invoice/789',
    notes: 'Includes 3 logo concepts and final files.',
    terms: 'Payment due within 30 days',
    createdAt: '2024-01-01T09:15:00Z',
    updatedAt: '2024-01-01T09:15:00Z'
  },
  {
    id: 'invoice_4',
    userId: 'user_1',
    clientId: 'client_1',
    invoiceNumber: 'INV-2024-004',
    title: 'SEO Optimization Services',
    description: 'Monthly SEO and content optimization',
    status: 'draft' as const,
    currency: 'USD',
    subtotal: 800.00,
    taxRate: 8.5,
    taxAmount: 68.00,
    totalAmount: 868.00,
    dueDate: '2024-03-15',
    issueDate: '2024-02-15',
    paymentGateway: 'stripe',
    notes: 'Monthly retainer for SEO services.',
    terms: 'Payment due within 15 days',
    createdAt: '2024-02-15T11:00:00Z',
    updatedAt: '2024-02-15T11:00:00Z'
  }
]

export const mockInvoiceItems = [
  // Items for invoice_1
  {
    id: 'item_1',
    invoiceId: 'invoice_1',
    description: 'Website Design & UI/UX',
    quantity: 1,
    unitPrice: 1500.00,
    total: 1500.00,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'item_2',
    invoiceId: 'invoice_1',
    description: 'Frontend Development',
    quantity: 40,
    unitPrice: 15.00,
    total: 600.00,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'item_3',
    invoiceId: 'invoice_1',
    description: 'Backend Integration',
    quantity: 20,
    unitPrice: 20.00,
    total: 400.00,
    createdAt: '2024-01-15T10:00:00Z'
  },
  // Items for invoice_2
  {
    id: 'item_4',
    invoiceId: 'invoice_2',
    description: 'iOS App Development',
    quantity: 1,
    unitPrice: 2500.00,
    total: 2500.00,
    createdAt: '2024-02-01T14:30:00Z'
  },
  {
    id: 'item_5',
    invoiceId: 'invoice_2',
    description: 'Android App Development',
    quantity: 1,
    unitPrice: 2500.00,
    total: 2500.00,
    createdAt: '2024-02-01T14:30:00Z'
  },
  // Items for invoice_3
  {
    id: 'item_6',
    invoiceId: 'invoice_3',
    description: 'Logo Design Concepts',
    quantity: 3,
    unitPrice: 200.00,
    total: 600.00,
    createdAt: '2024-01-01T09:15:00Z'
  },
  {
    id: 'item_7',
    invoiceId: 'invoice_3',
    description: 'Brand Guidelines Document',
    quantity: 1,
    unitPrice: 600.00,
    total: 600.00,
    createdAt: '2024-01-01T09:15:00Z'
  },
  // Items for invoice_4
  {
    id: 'item_8',
    invoiceId: 'invoice_4',
    description: 'SEO Audit & Strategy',
    quantity: 1,
    unitPrice: 300.00,
    total: 300.00,
    createdAt: '2024-02-15T11:00:00Z'
  },
  {
    id: 'item_9',
    invoiceId: 'invoice_4',
    description: 'Content Optimization',
    quantity: 10,
    unitPrice: 50.00,
    total: 500.00,
    createdAt: '2024-02-15T11:00:00Z'
  }
]

export const mockPaymentGateways = [
  {
    id: 'gateway_1',
    userId: 'user_1',
    gatewayType: 'stripe' as const,
    isActive: true,
    config: JSON.stringify({
      publishableKey: 'pk_test_...',
      secretKey: 'sk_test_...',
      webhookSecret: 'whsec_...'
    }),
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'gateway_2',
    userId: 'user_1',
    gatewayType: 'paypal' as const,
    isActive: true,
    config: JSON.stringify({
      clientId: 'paypal_client_id',
      clientSecret: 'paypal_client_secret',
      environment: 'sandbox'
    }),
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  }
]

export const mockEmailTemplates = [
  {
    id: 'template_1',
    userId: 'user_1',
    templateType: 'invoice' as const,
    subject: 'Invoice #{invoice_number} from {company_name}',
    body: `Dear {client_name},

I hope this email finds you well. Please find attached your invoice #{invoice_number} for {total_amount} {currency}.

Invoice Details:
- Invoice Number: #{invoice_number}
- Amount: {total_amount} {currency}
- Due Date: {due_date}

You can pay online using the following secure link:
{payment_link}

If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business!

Best regards,
{company_name}`,
    isDefault: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  }
]

export const mockReminderSettings = [
  {
    id: 'reminder_1',
    userId: 'user_1',
    reminderType: 'before_due' as const,
    daysOffset: 3,
    isActive: true,
    emailTemplateId: 'template_1',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'reminder_2',
    userId: 'user_1',
    reminderType: 'after_due' as const,
    daysOffset: 1,
    isActive: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  }
]

// Helper function to simulate database operations with mock data
export const mockDatabase = {
  clients: {
    list: async (options?: any) => {
      // Simulate filtering by userId
      return mockClients.filter(client => 
        !options?.where?.userId || client.userId === options.where.userId
      )
    },
    create: async (data: any) => {
      const newClient = { ...data, id: `client_${Date.now()}` }
      mockClients.push(newClient)
      return newClient
    },
    update: async (id: string, data: any) => {
      const index = mockClients.findIndex(c => c.id === id)
      if (index !== -1) {
        mockClients[index] = { ...mockClients[index], ...data }
        return mockClients[index]
      }
      throw new Error('Client not found')
    },
    delete: async (id: string) => {
      const index = mockClients.findIndex(c => c.id === id)
      if (index !== -1) {
        mockClients.splice(index, 1)
        return true
      }
      throw new Error('Client not found')
    }
  },
  invoices: {
    list: async (options?: any) => {
      let filtered = mockInvoices.filter(invoice => 
        !options?.where?.userId || invoice.userId === options.where.userId
      )
      
      if (options?.orderBy?.createdAt === 'desc') {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
      
      if (options?.limit) {
        filtered = filtered.slice(0, options.limit)
      }
      
      return filtered
    },
    create: async (data: any) => {
      const newInvoice = { ...data }
      mockInvoices.push(newInvoice)
      return newInvoice
    },
    update: async (id: string, data: any) => {
      const index = mockInvoices.findIndex(i => i.id === id)
      if (index !== -1) {
        mockInvoices[index] = { ...mockInvoices[index], ...data }
        return mockInvoices[index]
      }
      throw new Error('Invoice not found')
    },
    delete: async (id: string) => {
      const index = mockInvoices.findIndex(i => i.id === id)
      if (index !== -1) {
        mockInvoices.splice(index, 1)
        return true
      }
      throw new Error('Invoice not found')
    }
  },
  invoiceItems: {
    list: async (options?: any) => {
      return mockInvoiceItems.filter(item => 
        !options?.where?.invoiceId || item.invoiceId === options.where.invoiceId
      )
    },
    create: async (data: any) => {
      const newItem = { ...data }
      mockInvoiceItems.push(newItem)
      return newItem
    },
    delete: async (id: string) => {
      const index = mockInvoiceItems.findIndex(i => i.id === id)
      if (index !== -1) {
        mockInvoiceItems.splice(index, 1)
        return true
      }
      throw new Error('Item not found')
    }
  },
  paymentGateways: {
    list: async (options?: any) => {
      return mockPaymentGateways.filter(gateway => 
        !options?.where?.userId || gateway.userId === options.where.userId
      )
    },
    create: async (data: any) => {
      const newGateway = { ...data }
      mockPaymentGateways.push(newGateway)
      return newGateway
    },
    update: async (id: string, data: any) => {
      const index = mockPaymentGateways.findIndex(g => g.id === id)
      if (index !== -1) {
        mockPaymentGateways[index] = { ...mockPaymentGateways[index], ...data }
        return mockPaymentGateways[index]
      }
      throw new Error('Gateway not found')
    }
  },
  emailTemplates: {
    list: async (options?: any) => {
      return mockEmailTemplates.filter(template => 
        !options?.where?.userId || template.userId === options.where.userId
      )
    },
    create: async (data: any) => {
      const newTemplate = { ...data }
      mockEmailTemplates.push(newTemplate)
      return newTemplate
    },
    update: async (id: string, data: any) => {
      const index = mockEmailTemplates.findIndex(t => t.id === id)
      if (index !== -1) {
        mockEmailTemplates[index] = { ...mockEmailTemplates[index], ...data }
        return mockEmailTemplates[index]
      }
      throw new Error('Template not found')
    }
  },
  reminderSettings: {
    list: async (options?: any) => {
      return mockReminderSettings.filter(setting => 
        !options?.where?.userId || setting.userId === options.where.userId
      )
    },
    create: async (data: any) => {
      const newSetting = { ...data }
      mockReminderSettings.push(newSetting)
      return newSetting
    },
    update: async (id: string, data: any) => {
      const index = mockReminderSettings.findIndex(s => s.id === id)
      if (index !== -1) {
        mockReminderSettings[index] = { ...mockReminderSettings[index], ...data }
        return mockReminderSettings[index]
      }
      throw new Error('Setting not found')
    }
  }
}