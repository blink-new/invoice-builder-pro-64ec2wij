import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import RichTextEditor from '../components/RichTextEditor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { blink, type EmailTemplate } from '../lib/blink'
import { toast } from 'sonner'
import { 
  Mail, 
  Clock, 
  Heart, 
  Plus,
  Edit,
  Save,
  Eye,
  Copy
} from 'lucide-react'

const templateTypes = [
  {
    id: 'invoice',
    name: 'Invoice Email',
    description: 'Email sent when invoice is created and sent to client',
    icon: Mail,
    color: 'bg-blue-100 text-blue-600',
    variables: [
      '{client_name}', '{invoice_number}', '{total_amount}', '{due_date}', 
      '{payment_link}', '{company_name}', '{invoice_date}', '{currency}'
    ]
  },
  {
    id: 'reminder',
    name: 'Payment Reminder',
    description: 'Automated reminder emails for overdue invoices',
    icon: Clock,
    color: 'bg-orange-100 text-orange-600',
    variables: [
      '{client_name}', '{invoice_number}', '{total_amount}', '{due_date}', 
      '{days_overdue}', '{payment_link}', '{company_name}', '{currency}'
    ]
  },
  {
    id: 'thank_you',
    name: 'Thank You Email',
    description: 'Email sent after successful payment',
    icon: Heart,
    color: 'bg-green-100 text-green-600',
    variables: [
      '{client_name}', '{invoice_number}', '{total_amount}', '{payment_date}', 
      '{company_name}', '{currency}', '{payment_method}'
    ]
  }
]

const defaultTemplates = {
  invoice: {
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
{company_name}`
  },
  reminder: {
    subject: 'Payment Reminder: Invoice #{invoice_number} - {days_overdue} days overdue',
    body: `Dear {client_name},

This is a friendly reminder that invoice #{invoice_number} for {total_amount} {currency} was due on {due_date} and is now {days_overdue} days overdue.

To avoid any late fees or service interruptions, please process your payment as soon as possible.

You can pay online using the following secure link:
{payment_link}

If you have already made this payment, please disregard this message. If you have any questions or concerns, please contact us immediately.

Thank you for your prompt attention to this matter.

Best regards,
{company_name}`
  },
  thank_you: {
    subject: 'Payment Received - Thank You! Invoice #{invoice_number}',
    body: `Dear {client_name},

Thank you for your payment of {total_amount} {currency} for invoice #{invoice_number}.

Payment Details:
- Invoice Number: #{invoice_number}
- Amount Paid: {total_amount} {currency}
- Payment Date: {payment_date}
- Payment Method: {payment_method}

Your payment has been successfully processed and your account is now up to date.

We truly appreciate your business and look forward to continuing our partnership.

If you need a receipt or have any questions, please don't hesitate to contact us.

Best regards,
{company_name}`
  }
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

  useEffect(() => {
    loadEmailTemplates()
  }, [])

  const loadEmailTemplates = async () => {
    try {
      const user = await blink.auth.me()
      const userTemplates = await blink.db.emailTemplates.list({
        where: { userId: user.id }
      })
      setTemplates(userTemplates)
    } catch (error) {
      console.error('Failed to load email templates:', error)
      toast.error('Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }

  const saveTemplate = async (templateType: string, subject: string, body: string, isDefault: boolean = false) => {
    setSaving(templateType)
    try {
      const user = await blink.auth.me()
      
      // Find existing template
      const existingTemplate = templates.find(t => t.templateType === templateType)
      
      if (existingTemplate) {
        // Update existing
        await blink.db.emailTemplates.update(existingTemplate.id, {
          subject,
          body,
          isDefault,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Create new
        await blink.db.emailTemplates.create({
          id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          templateType: templateType as any,
          subject,
          body,
          isDefault,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      await loadEmailTemplates()
      setEditingTemplate(null)
      toast.success('Template saved successfully')
    } catch (error) {
      console.error('Failed to save template:', error)
      toast.error('Failed to save template')
    } finally {
      setSaving(null)
    }
  }

  const resetToDefault = async (templateType: string) => {
    const defaultTemplate = defaultTemplates[templateType as keyof typeof defaultTemplates]
    if (defaultTemplate) {
      await saveTemplate(templateType, defaultTemplate.subject, defaultTemplate.body, true)
    }
  }

  const copyTemplate = (templateType: string) => {
    const template = templates.find(t => t.templateType === templateType)
    const defaultTemplate = defaultTemplates[templateType as keyof typeof defaultTemplates]
    const content = template || defaultTemplate
    
    if (content) {
      navigator.clipboard.writeText(`Subject: ${content.subject}\n\n${content.body}`)
      toast.success('Template copied to clipboard')
    }
  }

  const getTemplate = (templateType: string) => {
    const userTemplate = templates.find(t => t.templateType === templateType)
    if (userTemplate) return userTemplate
    
    const defaultTemplate = defaultTemplates[templateType as keyof typeof defaultTemplates]
    return defaultTemplate ? {
      id: `default_${templateType}`,
      userId: 'system',
      templateType: templateType as any,
      subject: defaultTemplate.subject,
      body: defaultTemplate.body,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : null
  }

  const TemplateCard = ({ templateConfig }: { templateConfig: typeof templateTypes[0] }) => {
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const template = getTemplate(templateConfig.id)
    const isEditing = editingTemplate === templateConfig.id
    const isPreviewing = previewTemplate === templateConfig.id

    useEffect(() => {
      if (template) {
        setSubject(template.subject)
        setBody(template.body)
      }
    }, [template])

    const handleSave = () => {
      saveTemplate(templateConfig.id, subject, body)
    }

    const handlePreview = () => {
      setPreviewTemplate(isPreviewing ? null : templateConfig.id)
    }

    const renderPreview = (text: string) => {
      // Replace variables with sample data for preview
      const sampleData = {
        '{client_name}': 'John Smith',
        '{invoice_number}': 'INV-2024-001',
        '{total_amount}': '$1,250.00',
        '{due_date}': 'January 31, 2024',
        '{payment_link}': 'https://pay.example.com/invoice/123',
        '{company_name}': 'Your Company Name',
        '{invoice_date}': 'January 15, 2024',
        '{currency}': 'USD',
        '{days_overdue}': '5',
        '{payment_date}': 'January 30, 2024',
        '{payment_method}': 'Credit Card'
      }
      
      let preview = text
      Object.entries(sampleData).forEach(([variable, value]) => {
        preview = preview.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
      })
      
      return preview
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${templateConfig.color}`}>
                <templateConfig.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{templateConfig.name}</CardTitle>
                <CardDescription>{templateConfig.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {template?.isDefault && (
                <Badge variant="secondary">Default</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyTemplate(templateConfig.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingTemplate(isEditing ? null : templateConfig.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Variables Reference */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Available Variables:</h4>
            <div className="flex flex-wrap gap-1">
              {templateConfig.variables.map((variable) => (
                <Badge key={variable} variant="outline" className="text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${templateConfig.id}-subject`}>Subject Line</Label>
                <Input
                  id={`${templateConfig.id}-subject`}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`${templateConfig.id}-body`}>Email Body</Label>
                <RichTextEditor
                  value={body}
                  onChange={(value) => setBody(value)}
                  placeholder="Enter email body with rich formatting..."
                  className="min-h-[300px]"
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => resetToDefault(templateConfig.id)}
                >
                  Reset to Default
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTemplate(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving === templateConfig.id}
                  >
                    {saving === templateConfig.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Subject:</h4>
                <p className="text-sm bg-gray-50 p-2 rounded border">
                  {template?.subject || 'No template configured'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Body Preview:</h4>
                <div className="text-sm bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans">
                    {template?.body ? (
                      isPreviewing ? renderPreview(template.body) : template.body
                    ) : 'No template configured'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-2">
            Customize your email templates for invoices, reminders, and thank you messages
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Custom Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Template Types</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templateTypes.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Variables Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(templateTypes.flatMap(t => t.variables)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Templates */}
      <div className="space-y-6">
        {templateTypes.map((templateConfig) => (
          <TemplateCard key={templateConfig.id} templateConfig={templateConfig} />
        ))}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Template Variables Guide</CardTitle>
          <CardDescription>
            Use these variables in your templates to automatically insert dynamic content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Client & Invoice Variables</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{client_name}'}</code>
                  <span className="text-gray-600">Client's full name</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{invoice_number}'}</code>
                  <span className="text-gray-600">Invoice number</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{total_amount}'}</code>
                  <span className="text-gray-600">Invoice total amount</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{due_date}'}</code>
                  <span className="text-gray-600">Payment due date</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Company & Payment Variables</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{company_name}'}</code>
                  <span className="text-gray-600">Your company name</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{payment_link}'}</code>
                  <span className="text-gray-600">Secure payment URL</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{currency}'}</code>
                  <span className="text-gray-600">Invoice currency</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{days_overdue}'}</code>
                  <span className="text-gray-600">Days past due date</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}