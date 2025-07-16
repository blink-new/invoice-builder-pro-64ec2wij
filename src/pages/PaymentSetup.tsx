import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { blink, type PaymentGateway } from '../lib/blink'
import { toast } from 'sonner'
import { 
  CreditCard, 
  DollarSign, 
  Globe, 
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react'

const paymentGateways = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept credit cards, digital wallets, and more',
    icon: CreditCard,
    color: 'bg-purple-100 text-purple-600',
    fields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_test_...' },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_test_...' },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...' }
    ]
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept PayPal payments worldwide',
    icon: DollarSign,
    color: 'bg-blue-100 text-blue-600',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Your PayPal Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Your PayPal Client Secret' },
      { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'production'] }
    ]
  },
  {
    id: 'payoneer',
    name: 'Payoneer',
    description: 'Global payment platform for businesses',
    icon: Globe,
    color: 'bg-orange-100 text-orange-600',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Payoneer API Key' },
      { key: 'programId', label: 'Program ID', type: 'text', placeholder: 'Your Program ID' },
      { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'production'] }
    ]
  },
  {
    id: 'lemonsqueezy',
    name: 'Lemon Squeezy',
    description: 'All-in-one platform for digital products',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Lemon Squeezy API Key' },
      { key: 'storeId', label: 'Store ID', type: 'text', placeholder: 'Your Store ID' },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'Your Webhook Secret' }
    ]
  },
  {
    id: 'xoom',
    name: 'Xoom (PayPal Service)',
    description: 'International money transfers by PayPal',
    icon: Shield,
    color: 'bg-indigo-100 text-indigo-600',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Xoom API Key' },
      { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Your Xoom API Secret' },
      { key: 'partnerId', label: 'Partner ID', type: 'text', placeholder: 'Your Xoom Partner ID' }
    ]
  },
  {
    id: 'wise',
    name: 'Wise (TransferWise)',
    description: 'International money transfers and payments',
    icon: Globe,
    color: 'bg-green-100 text-green-600',
    fields: [
      { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your Wise API Token' },
      { key: 'profileId', label: 'Profile ID', type: 'text', placeholder: 'Your Profile ID' },
      { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'live'] }
    ]
  }
]

export default function PaymentSetup() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentGateways()
  }, [])

  const loadPaymentGateways = async () => {
    try {
      const user = await blink.auth.me()
      const userGateways = await blink.db.paymentGateways.list({
        where: { userId: user.id }
      })
      setGateways(userGateways)
    } catch (error) {
      console.error('Failed to load payment gateways:', error)
      toast.error('Failed to load payment gateways')
    } finally {
      setLoading(false)
    }
  }

  const saveGateway = async (gatewayType: string, config: any, isActive: boolean) => {
    setSaving(gatewayType)
    try {
      const user = await blink.auth.me()
      
      // Find existing gateway
      const existingGateway = gateways.find(g => g.gatewayType === gatewayType)
      
      if (existingGateway) {
        // Update existing
        await blink.db.paymentGateways.update(existingGateway.id, {
          isActive,
          config: JSON.stringify(config),
          updatedAt: new Date().toISOString()
        })
      } else {
        // Create new
        await blink.db.paymentGateways.create({
          id: `gateway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          gatewayType: gatewayType as any,
          isActive,
          config: JSON.stringify(config),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      await loadPaymentGateways()
      toast.success(`${gatewayType} configuration saved successfully`)
    } catch (error) {
      console.error('Failed to save gateway:', error)
      toast.error('Failed to save gateway configuration')
    } finally {
      setSaving(null)
    }
  }

  const getGatewayStatus = (gatewayType: string) => {
    const gateway = gateways.find(g => g.gatewayType === gatewayType)
    if (!gateway) return { configured: false, active: false }
    
    const config = gateway.config ? JSON.parse(gateway.config) : {}
    const hasRequiredFields = Object.keys(config).length > 0
    
    return {
      configured: hasRequiredFields,
      active: gateway.isActive && hasRequiredFields
    }
  }

  const GatewayCard = ({ gateway }: { gateway: typeof paymentGateways[0] }) => {
    const [config, setConfig] = useState<any>({})
    const [isActive, setIsActive] = useState(false)
    const status = getGatewayStatus(gateway.id)

    useEffect(() => {
      const existingGateway = gateways.find(g => g.gatewayType === gateway.id)
      if (existingGateway) {
        setConfig(existingGateway.config ? JSON.parse(existingGateway.config) : {})
        setIsActive(existingGateway.isActive)
      }
    }, [gateway.id])

    const handleSave = () => {
      saveGateway(gateway.id, config, isActive)
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${gateway.color}`}>
                <gateway.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{gateway.name}</CardTitle>
                <CardDescription>{gateway.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {status.configured && (
                <Badge variant={status.active ? 'default' : 'secondary'}>
                  {status.active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {gateway.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`${gateway.id}-${field.key}`}>{field.label}</Label>
              {field.type === 'select' ? (
                <select
                  id={`${gateway.id}-${field.key}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={config[field.key] || ''}
                  onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`${gateway.id}-${field.key}`}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={config[field.key] || ''}
                  onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                />
              )}
            </div>
          ))}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id={`${gateway.id}-active`}
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor={`${gateway.id}-active`}>Enable this gateway</Label>
            </div>
            
            <Button
              onClick={handleSave}
              disabled={saving === gateway.id}
            >
              {saving === gateway.id ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Payment Setup</h1>
          <p className="text-gray-600 mt-2">
            Configure your payment gateways to start accepting payments
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Gateways</p>
                <p className="text-2xl font-bold text-gray-900">
                  {gateways.filter(g => g.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Configured</p>
                <p className="text-2xl font-bold text-gray-900">
                  {gateways.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentGateways.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paymentGateways.map((gateway) => (
          <GatewayCard key={gateway.id} gateway={gateway} />
        ))}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Setting up payment gateways for the first time? Here are some helpful resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Documentation Links</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <a href="https://stripe.com/docs" className="text-primary hover:underline">Stripe Documentation</a></li>
                <li>• <a href="https://developer.paypal.com" className="text-primary hover:underline">PayPal Developer Guide</a></li>
                <li>• <a href="https://docs.lemon.dev" className="text-primary hover:underline">Lemon Squeezy API</a></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Security Notes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Always use test keys during development</li>
                <li>• Keep your secret keys secure and private</li>
                <li>• Enable webhook endpoints for real-time updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}