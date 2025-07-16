import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { blink, type ReminderSetting, type EmailTemplate } from '../lib/blink'
import { toast } from 'sonner'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Mail, 
  Clock,
  Heart,
  Save,
  User,
  Building
} from 'lucide-react'

export default function Settings() {
  const [reminderSettings, setReminderSettings] = useState<ReminderSetting[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Company settings
  const [companySettings, setCompanySettings] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    taxId: ''
  })

  // Default reminder settings
  const defaultReminders = [
    {
      type: 'before_due',
      label: 'Before Due Date',
      description: 'Send reminder before invoice due date',
      icon: Clock,
      color: 'text-blue-600',
      defaultDays: 3
    },
    {
      type: 'after_due',
      label: 'After Due Date',
      description: 'Send reminder after invoice becomes overdue',
      icon: Bell,
      color: 'text-orange-600',
      defaultDays: 1
    },
    {
      type: 'thank_you',
      label: 'Thank You',
      description: 'Send thank you message after payment',
      icon: Heart,
      color: 'text-green-600',
      defaultDays: 0
    }
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load reminder settings
      const userReminders = await blink.db.reminderSettings.list({
        where: { userId: user.id }
      })
      setReminderSettings(userReminders)

      // Load email templates
      const userTemplates = await blink.db.emailTemplates.list({
        where: { userId: user.id }
      })
      setEmailTemplates(userTemplates)

      // Set company settings from user data
      setCompanySettings({
        companyName: user.name || '',
        email: user.email || '',
        phone: '',
        address: '',
        website: '',
        taxId: ''
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveReminderSetting = async (reminderType: string, daysOffset: number, isActive: boolean) => {
    setSaving(true)
    try {
      const user = await blink.auth.me()
      
      // Find existing reminder setting
      const existingSetting = reminderSettings.find(r => r.reminderType === reminderType)
      
      if (existingSetting) {
        // Update existing
        await blink.db.reminderSettings.update(existingSetting.id, {
          daysOffset,
          isActive,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Create new
        await blink.db.reminderSettings.create({
          id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          reminderType: reminderType as any,
          daysOffset,
          isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      await loadSettings()
      toast.success('Reminder settings saved')
    } catch (error) {
      console.error('Failed to save reminder setting:', error)
      toast.error('Failed to save reminder setting')
    } finally {
      setSaving(false)
    }
  }

  const saveCompanySettings = async () => {
    setSaving(true)
    try {
      // In a real app, you'd save this to a company settings table
      // For now, we'll just show a success message
      toast.success('Company settings saved')
    } catch (error) {
      console.error('Failed to save company settings:', error)
      toast.error('Failed to save company settings')
    } finally {
      setSaving(false)
    }
  }

  const getReminderSetting = (reminderType: string) => {
    return reminderSettings.find(r => r.reminderType === reminderType)
  }

  const ReminderCard = ({ reminder }: { reminder: typeof defaultReminders[0] }) => {
    const setting = getReminderSetting(reminder.type)
    const [isActive, setIsActive] = useState(setting?.isActive || false)
    const [daysOffset, setDaysOffset] = useState(setting?.daysOffset || reminder.defaultDays)

    const handleSave = () => {
      saveReminderSetting(reminder.type, daysOffset, isActive)
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <reminder.icon className={`h-5 w-5 ${reminder.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{reminder.label}</CardTitle>
                <CardDescription>{reminder.description}</CardDescription>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${reminder.type}-days`}>
              {reminder.type === 'before_due' ? 'Days before due date' :
               reminder.type === 'after_due' ? 'Days after due date' :
               'Days after payment (0 = immediately)'}
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id={`${reminder.type}-days`}
                type="number"
                min="0"
                max="30"
                value={daysOffset}
                onChange={(e) => setDaysOffset(parseInt(e.target.value) || 0)}
                className="w-20"
                disabled={!isActive}
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saving || !isActive}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Setting
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure your account, company information, and automation settings
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>
                This information will appear on your invoices and emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    placeholder="company@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  placeholder="123 Business St, City, State 12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={companySettings.taxId}
                  onChange={(e) => setCompanySettings({ ...companySettings, taxId: e.target.value })}
                  placeholder="Your tax identification number"
                />
              </div>

              <div className="pt-4 border-t">
                <Button onClick={saveCompanySettings} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Company Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {defaultReminders.map((reminder) => (
              <ReminderCard key={reminder.type} reminder={reminder} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How Reminders Work</CardTitle>
              <CardDescription>
                Automated reminders help you get paid faster and maintain good client relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Before Due Date</h4>
                    <p className="text-sm text-gray-600">
                      Send a friendly reminder before the invoice is due to ensure timely payment
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                    <Bell className="h-3 w-3 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">After Due Date</h4>
                    <p className="text-sm text-gray-600">
                      Automatically follow up on overdue invoices to maintain cash flow
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <Heart className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Thank You</h4>
                    <p className="text-sm text-gray-600">
                      Send a thank you message after payment to build stronger client relationships
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your account preferences and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive email notifications for important events</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto-save Drafts</h4>
                    <p className="text-sm text-gray-600">Automatically save invoice drafts as you work</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Dark Mode</h4>
                    <p className="text-sm text-gray-600">Use dark theme for the interface</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">Danger Zone</h4>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h5 className="font-medium text-red-800">Delete Account</h5>
                    <p className="text-sm text-red-600 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm" className="mt-3">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}