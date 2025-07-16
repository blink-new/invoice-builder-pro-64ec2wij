import { createClient } from '@blinkdotnew/sdk'
import { mockDatabase } from './mockData'

export const blink = createClient({
  projectId: 'invoice-builder-pro-64ec2wij',
  authRequired: true
})

// Enhanced blink client with fallback to mock data
const originalDb = blink.db

// Create a proxy that falls back to mock data when database operations fail
export const enhancedBlink = {
  ...blink,
  db: new Proxy(originalDb, {
    get(target, prop) {
      const tableName = prop as string
      
      if (mockDatabase[tableName as keyof typeof mockDatabase]) {
        return new Proxy(target[tableName] || {}, {
          get(tableTarget, operation) {
            const op = operation as string
            
            return async (...args: any[]) => {
              try {
                // Try the real database first
                if (tableTarget && tableTarget[op]) {
                  return await tableTarget[op](...args)
                }
                throw new Error('Database not available')
              } catch (error) {
                console.warn(`Database operation failed, using mock data for ${tableName}.${op}:`, error)
                // Fall back to mock data
                const mockTable = mockDatabase[tableName as keyof typeof mockDatabase] as any
                if (mockTable && mockTable[op]) {
                  return await mockTable[op](...args)
                }
                throw error
              }
            }
          }
        })
      }
      
      return target[tableName]
    }
  })
}

// Use the enhanced blink client
export { enhancedBlink as blink }

// Types for our data models
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  emailVerified?: boolean
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  userId: string
  name: string
  email: string
  company?: string
  address?: string
  phone?: string
  taxId?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentGateway {
  id: string
  userId: string
  gatewayType: 'stripe' | 'paypal' | 'payoneer' | 'lemonsqueezy' | 'xoom' | 'wise'
  isActive: boolean
  apiKey?: string
  secretKey?: string
  webhookSecret?: string
  config?: any
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  userId: string
  clientId: string
  invoiceNumber: string
  title?: string
  description?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  currency: string
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  dueDate?: string
  issueDate: string
  paymentGateway?: string
  paymentLink?: string
  notes?: string
  terms?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  createdAt: string
}

export interface EmailTemplate {
  id: string
  userId: string
  templateType: 'invoice' | 'reminder' | 'thank_you'
  subject: string
  body: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface ReminderSetting {
  id: string
  userId: string
  reminderType: 'before_due' | 'after_due' | 'thank_you'
  daysOffset: number
  isActive: boolean
  emailTemplateId?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  currency: string
  paymentMethod?: string
  gatewayTransactionId?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paidAt?: string
  createdAt: string
}

// New interfaces for financial management
export interface Expense {
  id: string
  userId: string
  category: string
  description: string
  amount: number
  currency: string
  expenseDate: string
  receiptUrl?: string
  isBillable: boolean
  clientId?: string
  projectName?: string
  paymentMethod?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ExpenseCategory {
  id: string
  userId: string
  name: string
  color: string
  isDefault: boolean
  createdAt: string
}

export interface IncomeRecord {
  id: string
  userId: string
  source: string
  sourceId?: string
  description: string
  amount: number
  currency: string
  receivedDate: string
  paymentMethod?: string
  notes?: string
  createdAt: string
}

export interface FinancialGoal {
  id: string
  userId: string
  goalType: 'monthly_revenue' | 'yearly_revenue' | 'expense_limit'
  targetAmount: number
  currentAmount: number
  currency: string
  targetDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  id: string
  userId: string
  title: string
  description?: string
  eventType: 'payment_due' | 'reminder' | 'meeting' | 'deadline'
  eventDate: string
  relatedId?: string
  relatedType?: string
  isCompleted: boolean
  createdAt: string
}

export interface InvoiceCustomField {
  id: string
  invoiceId: string
  fieldName: string
  fieldValue?: string
  fieldType: 'text' | 'number' | 'date' | 'select'
  fieldPosition: 'header' | 'items' | 'footer'
  createdAt: string
}